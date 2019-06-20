function createBar(year1, year2, professionVal, gender, birthVal, sparql_birth, sparql_death) {
    var sparql_gender;
    if (gender === 'all') {
        sparql_gender = '               wdt:P21 ?gender; \n';
    } else {
        sparql_gender = gender + ';\n';
    }
    var endpoint = "https://query.wikidata.org/sparql";
    /*
        if (year2 >= 2000) {
            year2 = 1999;
        }
    */
    var sparql =
        'PREFIX wikibase: <http://wikiba.se/ontology#>\n' +
        'PREFIX : <http://www.wikidata.org/entity/>\n' +
        'PREFIX wdt: <http://www.wikidata.org/prop/direct/>\n' +
        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
        'SELECT ?year (COUNT(?item) AS ?count)  WHERE { \n' +
        '?item wdt:P31 :Q5 ; # instance of: human \n' +
        sparql_gender +
        'wdt:P569 ?date;   # born \n' +
        'wdt:P570 ?dateD; \n' +
        'wdt:P19 ?cityB; \n' +
        'wdt:P20 ?cityD; \n' +

        'wdt:P106 :' + professionVal + '. \n ' +
        '       ?cityB wdt:P17 ' + sparql_birth + ' .\n' +
        '       ?cityD wdt:P17 ' + sparql_death + ' .\n' +
        'BIND(str(YEAR(?date)) AS ?year) \n' +
        'FILTER (?date >= "' + year1 + '-01-01"^^xsd:dateTime && ?date <= "' + year2 + '-01-01"^^xsd:dateTime) \n' +
        '} \n' +
        'GROUP BY  ?year \n' +
        ' ORDER BY ?year';

    console.log(sparql);
    d3sparql.query(endpoint, sparql, render)
}

function render(json) {
    console.log(json);
    if (json.results.bindings.length != 0) {
        var config = {
            "label_y": "Number of people",
            "label_x": "Year",
            "var_y": "count",
            "var_x": "year",
            "width": 1800, // canvas width
            "height": 200, // canvas height
            "margin": 0, // canvas margin
            "selector": "#result"
        }
        d3sparql.barchart(json, config);
    }
}
