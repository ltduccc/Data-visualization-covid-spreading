// Set the dimensions of the canvas / graph

var margin = { top: 50, right: 100, bottom: 30, left: 100 },
width = 1000 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;

// Parse the date / time
var parseDate = d3.time.format("%Y-%m-%d").parse,
    formatDate = d3.time.format("%Y-%d-%b"),
    bisectDate = d3.bisector(function (d) { return d.date; }).left;

// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(10);

// Define the line
var valueline = d3.svg.line()
    .x(function (d) { return x(d.date); })
    .y(function (d) {
    if (d.total_cases == "") {
        return y(0);
    }
    return y(d.total_cases);
    });

// Adds the svg canvas
var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

var lineSvg = svg.append("g");

var focus = svg.append("g")
    .style("display", "none");

// Get the data
d3.csv("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv", function (error, data) {
    let numberDay = 1;
    let location = "Afghanistan";
    var dataProcess = data.filter(item => item.location == location).slice(0, numberDay);
    console.log(dataProcess)
    data.forEach(function (d) {
    d.date = parseDate(d.date);
    // console.log(d.date)
    // d.date = d3.timeParse("%Y-%m-%d")(d.date);
    if (d.total_cases == "") {
        d.total_cases = 0;
    } else {
        d.total_cases = +d.total_cases;
    }
    });

    var allGroup = Array.from(new Set(data.map(d => d['location'])))
    // var dataF = data.filter(function (d) { return d.location == "Afghanistan" }).slice(0, numberDay);

    // load data
    d3.select("#selectButton")
    .selectAll('option')
    .data(allGroup)
    .enter()
    .append('option')
    .text(function (d) { return d; })
    .property("value", function (d) {
        return d;
    })

    // event handling
    document.querySelector("#selectButton").onchange = (e) => {
    location = e.target.value;
    update(location, numberDay)
    }

    // event handling
    document.querySelector("#selectday").oninput = (e) => {
    numberDay = e.target.value;
    update(location, numberDay);
    }



    // Scale the range of the data
    x.domain(d3.extent(dataProcess, function (d) { return d.date; }));
    y.domain([0, d3.max(dataProcess, function (d) { return d.total_cases; })]);
    //y.domain([0, 4000])

    // Add the valueline path.
    lineSvg.append("path")
    .attr("class", "line")
    .attr("d", valueline(dataProcess));

    // Add the X Axis
    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    // Add the Y Axis
    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

    // append the x line
    focus.append("line")
    .attr("class", "x")
    .style("stroke", "blue")
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0.5)
    .attr("y1", 0)
    .attr("y2", height);

    // append the y line
    focus.append("line")
    .attr("class", "y")
    .style("stroke", "blue")
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0.5)
    .attr("x1", width)
    .attr("x2", width);

    // append the circle at the intersection
    focus.append("circle")
    .attr("class", "y")
    .style("fill", "none")
    .style("stroke", "blue")
    .attr("r", 4);

    // place the value at the intersection
    focus.append("text")
    .attr("class", "y1")
    .style("stroke", "white")
    .style("stroke-width", "3.5px")
    .style("opacity", 0.8)
    .attr("dx", 8)
    .attr("dy", "-.3em");
    focus.append("text")
    .attr("class", "y2")
    .attr("dx", 8)
    .attr("dy", "-.3em");

    // place the date at the intersection
    focus.append("text")
    .attr("class", "y3")
    .style("stroke", "white")
    .style("stroke-width", "3.5px")
    .style("opacity", 0.8)
    .attr("dx", 8)
    .attr("dy", "1em");
    focus.append("text")
    .attr("class", "y4")
    .attr("dx", 8)
    .attr("dy", "1em");

    // append the rectangle to capture mouse
    svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function () { focus.style("display", null); })
    .on("mouseout", function () { focus.style("display", "none"); })
    .on("mousemove", mousemove);

    function mousemove(element) {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(dataProcess, x0, 1),
        d0 = dataProcess[i - 1],
        d1 = dataProcess[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;


    focus.select("circle.y")
        .attr("transform",
        "translate(" + x(d.date) + "," +
        y(d.total_cases) + ")");

    focus.select("text.y1")
        .attr("transform",
        "translate(" + x(d.date) + "," +
        y(d.total_cases) + ")")
        .text(d.total_cases);

    focus.select("text.y2")
        .attr("transform",
        "translate(" + x(d.date) + "," +
        y(d.total_cases) + ")")
        .text(d.total_cases);

    focus.select("text.y3")
        .attr("transform",
        "translate(" + x(d.date) + "," +
        y(d.total_cases) + ")")
        .text(formatDate(d.date));

    focus.select("text.y4")
        .attr("transform",
        "translate(" + x(d.date) + "," +
        y(d.total_cases) + ")")
        .text(formatDate(d.date));

    focus.select(".x")
        .attr("transform",
        "translate(" + x(d.date) + "," +
        y(d.total_cases) + ")")
        .attr("y2", height - y(d.total_cases));

    focus.select(".y")
        .attr("transform",
        "translate(" + width * -1 + "," +
        y(d.total_cases) + ")")
        .attr("x2", width + width);
    }

    var ok1 = 0, ok2 = 0, ok3 = 0, ok4 = 0;

    function update(selectedGroup, numberDay) {
    var dataFilter = data.filter(function (d) { return d.location == selectedGroup }).slice(0, numberDay);
    console.log(dataFilter)
    var maxCases = d3.max(dataFilter, function(d) {
        return d.total_cases;
    })
    var maxDate = d3.max(dataFilter, function(d) {
        return d.date;
    })
    if (maxCases >= 1000 && ok1 == 0) {
        alert("On " + formatDate(maxDate) + " " + selectedGroup + " reached 1 000 cases");
        ok1 = 1;
    }
    if (maxCases < 1000) {
        ok1 = 0;
    }

    if (maxCases >= 10000 && ok2 == 0) {
        alert("On " + formatDate(maxDate) + " " + selectedGroup + " reached 10 000 cases");
        ok2 = 1;
    }
    if (maxCases < 10000) {
        ok2 = 0;
    }

    if (maxCases >= 100000 && ok3 == 0) {
        alert("On " + formatDate(maxDate) + " " + selectedGroup + " reached more than 100 000 cases");
        ok3 = 1;
    }
    if (maxCases < 100000) {
        ok3 = 0;
    }

    if (maxCases >= 1000000 && ok4 == 0) {
        alert("On " + formatDate(maxDate) + " " + selectedGroup + " reached more than 1 000 000 cases");
        ok4 = 1;
    }
    if (maxCases < 1000000) {
        ok4 = 0;
    }

    if (maxCases >= 10000000 && ok5 == 0) {
        alert("On " + formatDate(maxDate) + " " + selectedGroup + " reached more than 10 000 000 cases");
        ok5 = 1;
    }
    if (maxCases < 10000000) {
        ok5 = 0;
    }
    x.domain(d3.extent(dataFilter, function (d) { return d.date; }));
    y.domain([0, d3.max(dataFilter, function (d) {
        return d.total_cases;
    })]);
    xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);

    yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(10);

    // var valueline = d3.svg.line()
    //   .x(function (d) {
    //     return x(d.date);
    //   })
    //   .y(function (d) {
    //     return y(d.total_cases);
    //   });

    lineSvg.remove();
    lineSvg = svg.append("g");
    console.log(valueline(dataFilter))

    lineSvg.append("path")
        .attr("class", "line")
        .attr("d", valueline(dataFilter));

    // Add the X Axis
    // svg.append("g")
    //   .attr("class", "x axis")
    //   .attr("transform", "translate(0," + height + ")")
    //   .call(xAxis);

    d3.select(".x.axis").call(xAxis);
    d3.select(".y.axis").call(yAxis);

    // Add the Y Axis
    // svg.append("g")
    //   .attr("class", "y axis")
    //   .call(yAxis);

    // append the x line
    focus.append("line")
        .attr("class", "x")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", height);

    // append the y line
    focus.append("line")
        .attr("class", "y")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("x1", width)
        .attr("x2", width);

    // append the circle at the intersection
    // focus.append("circle")
    //   .attr("class", "y")
    //   .style("fill", "none")
    //   .style("stroke", "blue")
    //   .attr("r", 4);

    // place the value at the intersection
    focus.append("text")
        .attr("class", "y1")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");
    focus.append("text")
        .attr("class", "y2")
        .attr("dx", 8)
        .attr("dy", "-.3em");

    // place the date at the intersection
    focus.append("text")
        .attr("class", "y3")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "1em");
    focus.append("text")
        .attr("class", "y4")
        .attr("dx", 8)
        .attr("dy", "1em");

    // append the rectangle to capture mouse
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function () { focus.style("display", null); })
        .on("mouseout", function () { focus.style("display", "none"); })
        .on("mousemove", mousemovemove);

    function mousemovemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(dataFilter, x0, 1),
        d0 = dataFilter[i - 1],
        d1 = dataFilter[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;


        focus.select("circle.y")
        .attr("transform",
            "translate(" + x(d.date) + "," +
            y(d.total_cases) + ")");

        focus.select("text.y1")
        .attr("transform",
            "translate(" + x(d.date) + "," +
            y(d.total_cases) + ")")
        .text(d.total_cases);

        focus.select("text.y2")
        .attr("transform",
            "translate(" + x(d.date) + "," +
            y(d.total_cases) + ")")
        .text(d.total_cases);

        focus.select("text.y3")
        .attr("transform",
            "translate(" + x(d.date) + "," +
            y(d.total_cases) + ")")
        .text(formatDate(d.date));

        focus.select("text.y4")
        .attr("transform",
            "translate(" + x(d.date) + "," +
            y(d.total_cases) + ")")
        .text(formatDate(d.date));

        focus.select(".x")
        .attr("transform",
            "translate(" + x(d.date) + "," +
            y(d.total_cases) + ")")
        .attr("y2", height - y(d.total_cases));

        focus.select(".y")
        .attr("transform",
            "translate(" + width * -1 + "," +
            y(d.total_cases) + ")")
        .attr("x2", width + width);
    }
    }

});