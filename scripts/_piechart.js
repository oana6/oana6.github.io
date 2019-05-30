function createPieChart(a, b, c, d, e, total) {
    //Width and height
    var w = 200;
    var h = 200;

    var ds = [
        {
            label: "0km",
            value: a,
            procent: Math.round(a * 100 / total)
        },
        {
            label: "0km - 100km",
            value: b,
            procent: Math.round(b * 100 / total)
        },
        {
            label: "100km - 1.000km",
            value: c,
            procent: Math.round(c * 100 / total)

        },
        {
            label: "1.000km - 5.000km",
            value: d,
            procent: Math.round(d * 100 / total)
        },
        {
            label: "5.000km+",
            value: e,
            procent: Math.round(e * 100 / total)
        }
  ];


    var outerRadius = w / 2;
    var innerRadius = 0;
    var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);


    var pie = d3.layout.pie().value(function (d) {
        return d.value;
    });

    // Easy colors accessible via a 10-step ordinal scale
    var color = d3.scale.linear().domain([1, 4])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb("#009EFF"), d3.rgb('#FF0074')])

    // Create SVG element
    var svg = d3.select("#piechart")
        .append("svg")
        .data([ds])
        .attr("width", w)
        .attr("height", h);




    // Set up groups
    var arcs = svg.selectAll("g.arc")
        .data(pie(ds))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")")
        .on("mouseover", function (d, i) {
            d3.select("#tooltips")
                .style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY + "px")
                .style("opacity", 1)
                .select("#value")
                .text(ds[i].label + " : " + ds[i].procent);
        })
        .on("mouseout", function () {
            // Hide the tooltip
            d3.select("#tooltips")
                .style("opacity", 0);
        });

    // Draw arc paths
    arcs.append("path")
        .attr("fill", function (d, i) {
            return color(i);
        })
        .attr("d", arc);

    // Labels
    arcs.append("text")
        .attr("transform", function (d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function (d, i) {
            return ds[i].value;
        });
    d3.select("#resultss").append("text")
        .style("font-size", "10px")

        .html('&emsp;Results:&nbsp; &nbsp; &nbsp; &nbsp;           ' + total + '&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;');
}
