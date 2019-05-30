function gatherValues() {
    document.getElementById("results").innerHTML = "";
    var sparql_date, sparql_profession, sparql_gender, sparql_death, sparql_birth;
    var sparql_orientation, sparql_ethnic, sparql_religion;
    var year = slider.noUiSlider.get();
    var profession = document.getElementById("profession");
    var professionVal = profession.options[profession.selectedIndex].value;
    var professionalChecked = document.getElementById("IsAssociation").checked;
    var gender = document.querySelector('input[name="gender"]:checked').value;
    var birth = document.getElementById("birthLocation");
    var birthVal = birth.options[birth.selectedIndex].value;
    var birthColor = document.getElementById("birthcolor").value;
    var death = document.getElementById("deathLocation");
    var deathVal = death.options[death.selectedIndex].value;
    var deathColor = document.getElementById("deathcolor").value;



    var sparql_orientationF = document.getElementById("sexualSelection");
    var sparql_orientationV = sparql_orientationF.options[sparql_orientationF.selectedIndex].value;
    if (sparql_orientationV == 0)
        sparql_orientation = "";
    else
        sparql_orientation = '       wdt:P91 :' + sparql_orientationV + '; \n';

    var sparql_ethnicF = document.getElementById("ethnicSelection");
    var sparql_ethnicV = sparql_ethnicF.options[sparql_ethnicF.selectedIndex].value;
    if (sparql_ethnicV == 0)
        sparql_ethnic = "";
    else
        sparql_ethnic = '       wdt:P172 :' + sparql_ethnicV + '; \n';

    var sparql_religionF = document.getElementById("religionSelection");
    var sparql_religionV = sparql_religionF.options[sparql_religionF.selectedIndex].value;

    console.log(sparql_religionV);
    if (sparql_religionV == 0)
        sparql_religion = "";
    else
        sparql_religion = '       wdt:P140 :' + sparql_religionV + '; \n';


    if (year[0] === '-500' && year[1] === '2019') {
        sparql_date = "";
    } else {
        sparql_date = '       FILTER (?dateB >= "' + year[0] + '-01-01"^^xsd:dateTime && ?dateB < "' + year[1] + '-01-01"^^xsd:dateTime)\n';
    }
    if (professionalChecked) {
        sparql_profession = '       wdt:P106 ?profession; \n';
    } else {
        if (professionVal === 'Q19546')
            sparql_profession = '               wdt:P39 :Q19546; \n';
        else
            sparql_profession = '       wdt:P106 :' + professionVal + '; \n';
    }



    if (gender === 'all') {
        sparql_gender = '               wdt:P21 ?gender; \n';
    } else {
        sparql_gender = gender + ';\n';
    }


    if (deathVal === '') {
        sparql_death = '?countryD';
    } else {
        sparql_death = ':' + deathVal;
    }

    if (birthVal === '') {
        sparql_birth = '?countryB';
    } else {
        sparql_birth = ':' + birthVal;
    }

    var sparql_extra = sparql_profession + sparql_religion + sparql_orientation + sparql_ethnic;

    fetchLOD(sparql_date, sparql_extra, sparql_gender, sparql_birth, birthColor, sparql_death, deathColor, year);

    createBar(year[0], year[1], professionVal, gender, birthVal, sparql_birth, sparql_death);

    console.log(sparql_extra);
    create_chord_diagram(sparql_date, sparql_extra, sparql_gender, sparql_birth, birthColor, sparql_death, deathColor, year);

}

function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") {
            dist = dist * 1.609344
        }
        if (unit == "N") {
            dist = dist * 0.8684
        }
        return dist;
    }
}





function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

    var str = '';
    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ',';
            if (array[i][index].type = "literal") {
                line += '"' + array[i][index].value + '"';
            } else {
                line += array[i][index].value
            };

        }
        str += line + '\r\n';
    }
    return str;
}
