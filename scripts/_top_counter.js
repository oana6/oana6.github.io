function createTopB(sparql_extra, sparql_gender, sparql_birth, sparql_death, sparql_date) {
    var endpointUrl = 'https://query.wikidata.org/sparql',
        sparqlQuery = "PREFIX : <http://www.wikidata.org/entity/>\n" +
        "SELECT DISTINCT ?cityBLabel (COUNT (distinct ?person) as ?count) \n" +
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
        "} GROUP BY ?cityBLabel \n" +
        "ORDER BY desc(?count) \n" +
        "LIMIT 5 \n";

    var queryUrl = endpointUrl + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json";
    $.ajax({
        dataType: "json",
        url: queryUrl,
        success: function (data, stat) {
            var resTable = document.getElementById("topB");
            resTable.innerHTML = "<h1>Top5 Birth places</h1>";
            var results = data.results.bindings;
            console.log(results);
            for (var i = 0; i < results.length; i++) {
                var row = resTable.insertRow(i);
                var cell0 = row.insertCell(0);
                cell0.innerHTML = results[i].cityBLabel.value + " " + results[i].count.value + "\n";
            }
        }
    }).fail(doShit);
}

function createTopD(sparql_extra, sparql_gender, sparql_birth, sparql_death, sparql_date) {
    var endpointUrl = 'https://query.wikidata.org/sparql',
        sparqlQuery = "PREFIX : <http://www.wikidata.org/entity/>\n" +
        "SELECT DISTINCT ?cityDLabel (COUNT (distinct ?person) as ?count) \n" +
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
        "} GROUP BY ?cityDLabel \n" +
        "ORDER BY desc(?count) \n" +
        "LIMIT 5 \n";

    var queryUrl = endpointUrl + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json";
    $.ajax({
        dataType: "json",
        url: queryUrl,
        success: function (data, stat) {
            var resTable = document.getElementById("topD");
            resTable.innerHTML = "<h1>Top5 Death places</h1>";
            var results = data.results.bindings;
            console.log(results);
            for (var i = 0; i < results.length; i++) {
                var row = resTable.insertRow(i);
                var cell0 = row.insertCell(0);
                cell0.innerHTML = results[i].cityDLabel.value + " " + results[i].count.value + "\n";
            }
        }
    }).fail(doShit);
}

function countCities(sparql_extra, sparql_gender, sparql_birth, sparql_death, sparql_date) {
    var endpointUrl = 'https://query.wikidata.org/sparql',
        sparqlQuery = "PREFIX : <http://www.wikidata.org/entity/>\n" +
        "SELECT DISTINCT (COUNT (distinct ?cityB) as ?countBB) (COUNT (distinct ?cityD) as ?countDD)  \n" +
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
        "}\n";

    var queryUrl = endpointUrl + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json";
    $.ajax({
        dataType: "json",
        url: queryUrl,
        success: function (data, stat) {
            var resTable = document.getElementById("counter");

            var results = data.results.bindings;
            resTable.innerHTML = "<h1>Nr cities of birth: " + results[0].countBB.value + "</h1>\n" + "<h1>Nr cities of death: " + results[0].countDD.value + "</h1>";

        }
    }).fail(doShit);
}
