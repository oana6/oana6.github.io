function fetchLOD(sparql_date, sparql_extra, sparql_gender, sparql_birth, birthColor, sparql_death, deathColor, year) {
    var p2 = document.getElementById("profession");
    //var controller = L.control.layers(null, null);
    var controller = false;


    var url = "https://query.wikidata.org/sparql";
    //?cityB wdt:P625 ?coords_valueB .\n' +
    var overlayMaps, baseMaps;
    var markerBClusters = L.markerClusterGroup({
        iconCreateFunction: function (cl) {
            var layer = cl.getAllChildMarkers()[0].l;
            return new L.DivIcon({
                html: '<div style="background-color:' + birthColor + ';">' + cl.getChildCount() + '</div>',
                className: 'my-div-icon'
            });
        }
    });
    var markerDClusters = L.markerClusterGroup({
        iconCreateFunction: function (cl) {
            var layer = cl.getAllChildMarkers()[0].l;
            return new L.DivIcon({
                html: '<div style="background-color:' + deathColor + ';">' + cl.getChildCount() + '</div>',
                className: 'my-div-icon'

            });
        }
    });
    var paths = L.markerClusterGroup();

    var query =
        'PREFIX wikibase: <http://wikiba.se/ontology#>\n' +
        'PREFIX : <http://www.wikidata.org/entity/>\n' +
        'PREFIX wdt: <http://www.wikidata.org/prop/direct/>\n' +
        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
        'SELECT DISTINCT ?person ?nameLabel ?cityBLabel ?countryBLabel ?cityDLabel ?countryDLabel ?dateBLabel ?dateDLabel ?coords_valueB ?coords_valueD \n' +
        'WHERE{ \n' +
        ' ?person rdfs:label ?name; \n' +
        sparql_extra +
        sparql_gender +
        '                wdt:P19 ?cityB; \n' +
        '                wdt:P20 ?cityD; \n' +
        '                wdt:P569 ?dateB; \n' +
        '                wdt:P570 ?dateD. \n' +
        '       ?cityB wdt:P17 ' + sparql_birth + ' .\n' +
        '       ?cityD wdt:P17 ' + sparql_death + ' .\n' +
        '       ?cityB wdt:P625 ?coords_valueB .\n' +
        '       ?cityD wdt:P625 ?coords_valueD .\n' +
        sparql_date +
        '       SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } \n' +
        '       FILTER(LANGMATCHES(LANG(?name), "EN")) \n' +
        '}\n';
    //'LIMIT 400';

    console.log(query);
    var queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";
    var persQ = "";
    var intervals = Math.ceil((year[1] - year[0]) / 100);

    var sameA = new Array(intervals).fill(0);
    var nearA = new Array(intervals).fill(0);
    var mediumA = new Array(intervals).fill(0);
    var farA = new Array(intervals).fill(0);
    var superfarA = new Array(intervals).fill(0);

    var same = 0;
    var near = 0;
    var medium = 0;
    var far = 0;
    var superfar = 0;
    if (controller === false) {
        controller = L.control.layers().addTo(mymap);
    }
    $.ajax({
        dataType: "json",
        url: queryUrl,
        success: function (data, stat) {
            var nr = document.getElementById("results");
            var results = data.results.bindings;



            var popup;
            var table = document.getElementById("data");
            table.innerHTML = "";
            var BC, DC = "";
            for (var i = 0; i < results.length; i++) {

                if (results[i].countryBLabel) {
                    BC = results[i].countryBLabel.value;
                } else {
                    var birth = document.getElementById("birthLocation");
                    BC = birth.options[birth.selectedIndex].text;
                }
                if (results[i].countryDLabel) {
                    DC = results[i].countryDLabel.value;
                } else {
                    var death = document.getElementById("deathLocation");
                    DC = death.options[death.selectedIndex].text;
                }
                popup = '<a href="' + results[i].person.value +
                    '">' + results[i].nameLabel.value + '</a>' +
                    '<br/>Place of Birth: ' + results[i].cityBLabel.value + ", " + BC + '<br/>Place of Death: ' + results[i].cityDLabel.value + ", " + DC +
                    '<br/>Date of Birth: ' + results[i].dateBLabel.value +
                    '<br/>Date of Death: ' + results[i].dateDLabel.value;
                // console.log(results[i].person.value + " " + results[i].coords_valueB.value + " " + results[i].coords_valueD.value);

                var coordsB = results[i].coords_valueB.value.replace('Point(', '').replace(')', '').split(" ");
                var coordsD = results[i].coords_valueD.value.replace('Point(', '').replace(')', '').split(" ");

                if (!coordsD[1] || !coordsD[0]) {
                    console.log("da");
                    coordsD[1] = coordsB[1];
                    coordsD[0] = coordsB[0];
                }

                if (!coordsB[1] || !coordsB[0]) {
                    console.log("da");
                    coordsB[1] = coordsD[1];
                    coordsB[0] = coordsD[0];
                }

                var mB = L.circle([coordsB[1], coordsB[0]], {
                        radius: 10,
                        weight: 1,

                        fillOpacity: 1,
                        fillcolor: birthColor
                    })
                    .bindPopup(popup);
                var mD = L.circle([coordsD[1], coordsD[0]], {
                        radius: 10,
                        color: deathColor
                    })
                    .bindPopup(popup);


                var line = L.polyline([[coordsB[1], coordsB[0]], [coordsD[1], coordsD[0]]], {
                    className: 'my_polyline',
                    color: birthColor
                }).addTo(paths);

                var rline = L.polyline([[coordsD[1], coordsD[0]], [coordsB[1], coordsB[0]]], {
                    className: 'my_polyline',
                    color: birthColor
                });

                var arrowHead = L.polylineDecorator(line, {
                    patterns: [
                        {
                            offset: '100%',
                            repeat: 0,
                            symbol: L.Symbol.arrowHead({
                                pixelSize: 4,
                                polygon: false,
                                pathOptions: {
                                    color: deathColor
                                }
                            })
                                }
        ]
                }).addTo(mymap);

                var RarrowHead = L.polylineDecorator(rline, {
                    patterns: [
                        {
                            offset: '100%',
                            repeat: 0,
                            symbol: L.Symbol.arrowHead({
                                pixelSize: 4,
                                polygon: false,
                                pathOptions: {
                                    color: birthColor
                                }
                            })
                                }
        ]
                }).addTo(mymap);



                markerBClusters.addLayer(mB);
                markerDClusters.addLayer(mD);
                var row = table.insertRow(i);
                var cell0 = row.insertCell(0);
                var cell1 = row.insertCell(1);
                var cell2 = row.insertCell(2);
                var cell3 = row.insertCell(3);
                var cell4 = row.insertCell(4);

                cell0.innerHTML = '<a href="' + results[i].person.value +
                    '">' + results[i].nameLabel.value + '</a>';

                cell1.innerHTML = 'Birth: ' + results[i].cityBLabel.value + ", " + BC;

                cell2.innerHTML = 'Death: ' + results[i].cityDLabel.value + ", " + DC;

                cell3.innerHTML = parseInt(results[i].dateBLabel.value) + ' - ' +
                    parseInt(results[i].dateDLabel.value) + '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp';
                var dist = Math.ceil(distance(coordsB[0], coordsB[1], coordsD[0], coordsD[1], 'K'));
                cell4.innerHTML = dist + 'km';
                if (dist == 0) {
                    same++;
                    /*  console.log(parseInt(results[i].dateBLabel.value) + " " + year[0] + " " + intervals + " " + Math.ceil((parseInt(results[i].dateBLabel.value) - year[0]) / intervals));


                      sameA[(parseInt(Math.ceil(results[i].dateBLabel.value) - year[0]) / intervals)]++;*/

                }
                if (dist > 0 && dist <= 100) {

                    near = near + 1;
                } else
                if (dist > 100 && dist <= 1000) {
                    medium = medium + 1;
                }
                if (dist > 1000 && dist <= 5000) {
                    far = far + 1;
                }

            }

            controller.addOverlay(markerBClusters, "birth " + p2.options[p2.selectedIndex].text);
            controller.addOverlay(markerDClusters, "death " + p2.options[p2.selectedIndex].text);
            controller.addOverlay(paths, "paths " + p2.options[p2.selectedIndex].text);
            superfar = results.length - same - near - medium - far;
            nr.innerHTML = "Results: " + results.length + "<br />0km: " + same + " (" + Math.round(same * 100 / results.length) + "%)<br />0km - 100km: " + near + " (" + Math.round(near * 100 / results.length) + "%)<br />100km - 1000km: " + medium + " (" + Math.round(medium * 100 / results.length) + "%)<br />1000km - 5000km: " + far + " (" + Math.round(far * 100 / results.length) + "%)<br />5000+km: " + superfar + " (" + Math.round(superfar * 100 / results.length) + "%)";
            if (results.length != 0) {
                createPieChart(same, near, medium, far, superfar, results.length);
                createDependencyResults(sparql_extra, sparql_gender, sparql_birth, sparql_death, sparql_date, results.length);
                createTopB(sparql_extra, sparql_gender, sparql_birth, sparql_death, sparql_date);
                createTopD(sparql_extra, sparql_gender, sparql_birth, sparql_death, sparql_date);
                countCities(sparql_extra, sparql_gender, sparql_birth, sparql_death, sparql_date);
            }




        },
        error: function (jqXHR, status, error) {}

    }).fail(doShit);

    mymap.setView([30, 0], 2);
    mymap.addLayer(markerBClusters);
    mymap.addLayer(markerDClusters);



}

function doShit() {
    console.log(":(")
    document.getElementById("results").innerHTML = "??";

}
