function create_chord_diagram(sparql_date, sparql_extra, sparql_gender, sparql_birth, birthColor, sparql_death, deathColor, year) {



    function makeSPARQLQuery(endpointUrl, sparqlQuery, doneCallback) {
        var settings = {
            headers: {
                Accept: 'application/sparql-results+json'
            },
            data: {
                query: sparqlQuery
            }
        };
        return $.ajax(endpointUrl, settings).then(doneCallback);
    }

    var endpointUrl = 'https://query.wikidata.org/sparql',
        sparqlQuery = "PREFIX : <http://www.wikidata.org/entity/>\n" +
        "SELECT DISTINCT ?countryBLabel  ?countryDLabel \n" +
        "WHERE{ \n" +

        " ?person rdfs:label ?name; \n" +
        sparql_extra +
        sparql_gender +
        "                wdt:P19 ?cityB; \n" +
        "                wdt:P20 ?cityD; \n" +
        "                wdt:P569 ?dateB; \n" +
        "                wdt:P570 ?dateD. \n" +
        "       ?cityB wdt:P17 " + sparql_birth + ".\n " +
        "       ?cityD wdt:P17 " + sparql_death + " .\n" +
        "       ?cityB wdt:P625 ?coords_valueB .\n" +
        "       ?cityD wdt:P625 ?coords_valueD .\n" +
        sparql_date +
        "       SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\". } \n" +
        "       FILTER(LANGMATCHES(LANG(?name), \"EN\")) \n" +
        "} \n";

    console.log("!!!!" + sparqlQuery);

    makeSPARQLQuery(endpointUrl, sparqlQuery, function (data) {

        var results = "who,overlap" + "\n" + convertToCSV(JSON.stringify(data.results.bindings));

        createDependency(results);


    });
}

function createDependency(results) {
    //*******************************************************************
    //  CREATE MATRIX AND MAP
    //*******************************************************************
    d3.selectAll("#diagram").select("svg").remove();

    var letters = d3.csv.parse(results);




    var mpr = chordMpr(letters);
    var good1 = 0;
    var good2 = 0;
    mpr
        .addValuesToMap('who')
        .setFilter(function (row, a, b) {


            if (typeof row.overlap == 'undefined') {
                var birth = document.getElementById("birthLocation");
                row.overlap = birth.options[birth.selectedIndex].text;
                good1 = 1;
                if (row.overlap == 'Everywhere') {
                    var death = document.getElementById("deathLocation");
                    row.overlap = death.options[death.selectedIndex].text;
                }
            }

            /*else
                        if (typeof row.who == 'undefined') {
                            var death = document.getElementById("deathLocation");
                            row.who = death.options[death.selectedIndex].text;
                            good2 = 1;
                        }*/
            return (row.who === a.name && row.overlap === b.name)
        })
        .setAccessor(function (recs, a, b) {
            if (!recs[0]) return 0;
            return 1;
        });

    if (good1 + good2 < 2) {

        drawChords(mpr.getMatrix(), mpr.getMap());
    }
    //});

    //*******************************************************************
    //  DRAW THE CHORD DIAGRAM
    //*******************************************************************
    function drawChords(matrix, mmap) {




        var w = 1000,
            h = 1000,
            r1 = h / 2,
            r0 = r1 - 150;

        var fill = d3.scale.category10();

        var chord = d3.layout.chord()
            .padding(.02)
            .sortSubgroups(d3.descending)
            .sortChords(d3.descending);

        var arc = d3.svg.arc()
            .innerRadius(r0)
            .outerRadius(r0 + 20);

        var svg = d3.select("#diagram").append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("svg:g")
            .attr("id", "circle")
            .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")


        svg.append("circle")
            .attr("r", r0 + 20);

        var rdr = chordRdr(matrix, mmap);
        chord.matrix(matrix);

        var g = svg.selectAll("g.group")
            .data(chord.groups())
            .enter().append("svg:g")
            .attr("class", "group")
            .on("mouseover", mouseover)
            .on("mouseout", function (d) {
                d3.select("#tooltip").style("visibility", "hidden")
            });

        g.append("svg:path")
            .style("stroke", "none")
            .style("fill", function (d) {
                return fill(d.index);
            })
            .attr("d", arc);

        g.append("svg:text")
            .each(function (d) {
                d.angle = (d.startAngle + d.endAngle) / 2;
            })
            .attr("dy", ".35em")
            .style("font-size", "9px")
            .attr("text-anchor", function (d) {
                return d.angle > Math.PI ? "end" : null;
            })
            .attr("transform", function (d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                    "translate(" + (r0 + 26) + ")" +
                    (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .text(function (d) {
                return rdr(d).gname;
            });

        var chordPaths = svg.selectAll("path.chord")
            .data(chord.chords())
            .enter().append("svg:path")
            .attr("class", "chord")
            .style("stroke", function (d) {
                return d3.rgb(fill(d.target.index)).darker();
            })
            .style("fill", function (d) {
                return fill(d.target.index);
            })
            .attr("d", d3.svg.chord().radius(r0))
            .on("mouseover", function (d) {
                d3.select("#tooltip")
                    .style("visibility", "visible")
                    .html(chordTip(rdr(d)))
                    .style("top", function () {
                        return (d3.event.pageY - 100) + "px"
                    })
                    .style("left", function () {
                        return (d3.event.pageX - 100) + "px";
                    })
            })
            .on("mouseout", function (d) {
                d3.select("#tooltip").style("visibility", "hidden")
            });

        function chordTip(d) {
            var p = d3.format(".0%"),
                q = d3.format("0d")
            return " Connection " + d.sname + " - " + d.tname
        }

        function groupTip(d) {
            var guru = d.gname,
                q = d3.format("0d");

            return d.gname;


        }

        function mouseover(d, i) {
            d3.select("#tooltip")
                .style("visibility", "visible")
                .html(groupTip(rdr(d)))
                .style("top", function () {
                    return (d3.event.pageY - 80) + "px"
                })
                .style("left", function () {
                    return (d3.event.pageX - 130) + "px";
                })

            chordPaths.classed("fade", function (p) {
                return p.source.index != i &&
                    p.target.index != i;
            });
        }
    }




}

function createDependencyResults(sparql_extra, sparql_gender, sparql_birth, sparql_death, sparql_date, total) {
    var endpointUrl = 'https://query.wikidata.org/sparql',
        sparqlQuery = "PREFIX : <http://www.wikidata.org/entity/>\n" +
        "SELECT DISTINCT ?countryBLabel  ?countryDLabel (COUNT (distinct ?person) as ?count) \n" +
        "WHERE{ \n" +

        " ?person rdfs:label ?name; \n" +
        sparql_extra +
        sparql_gender +
        "                wdt:P19 ?cityB; \n" +
        "                wdt:P20 ?cityD; \n" +
        "                wdt:P569 ?dateB; \n" +
        "                wdt:P570 ?dateD. \n" +
        "       ?cityB wdt:P17 " + sparql_birth + ".\n " +
        "       ?cityD wdt:P17 " + sparql_death + " .\n" +
        "       ?cityB wdt:P625 ?coords_valueB .\n" +
        "       ?cityD wdt:P625 ?coords_valueD .\n" +
        sparql_date +
        "       SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\". } \n" +
        "       FILTER(LANGMATCHES(LANG(?name), \"EN\")) \n" +
        "} GROUP BY ?countryBLabel  ?countryDLabel \n" +
        "ORDER BY desc(?count) \n";

    var queryUrl = endpointUrl + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json";
    $.ajax({
        dataType: "json",
        url: queryUrl,
        success: function (data, stat) {
            var resTable = document.getElementById("multichart");
            resTable.innerHTML = "<h1>Country list</h1>";
            var results = data.results.bindings;
            console.log(results);
            for (var i = 0; i < results.length; i++) {
                var row = resTable.insertRow(i);
                var cell0 = row.insertCell(0);
                var cell1 = row.insertCell(1);
                var cell2 = row.insertCell(2);
                var cell3 = row.insertCell(3);
                var cell4 = row.insertCell(4);


                if (typeof results[i].countryBLabel == 'undefined') {
                    var birth = document.getElementById("birthLocation");
                    cell0.innerHTML = birth.options[birth.selectedIndex].text + "&nbsp;&nbsp;";
                } else {
                    cell0.innerHTML = results[i].countryBLabel.value + "&nbsp;&nbsp;";
                }
                if (typeof results[i].countryDLabel == 'undefined') {
                    var death = document.getElementById("deathLocation");
                    cell1.innerHTML = death.options[death.selectedIndex].text + "&nbsp;&nbsp;";
                } else {
                    cell1.innerHTML = results[i].countryDLabel.value + "&nbsp;&nbsp;";
                }

                cell2.innerHTML = results[i].count.value + " (" + Math.round((results[i].count.value * 100) / total) + "%)";
            }
        }
    }).fail(doShit);

}
