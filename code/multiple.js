var rowConverter = function (d) {
  //console.log(d);
  return {
    Case: parseInt(d.total_cases) || 0,
    Country: d["location"],
    Date: new Date(d.date),
  };
};
d3.csv("./owid-covid-data.csv", rowConverter, function (error, data) {
  // data = data.slice(0, 100);
  if (error) {
    console.log(error);
  } else {


    // console.log(data);
    // Set the margins
    var margin = { top: 60, right: 100, bottom: 20, left: 80 },
      width = 1000 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
    // Create the svg canvas

    var zoom = d3.zoom()
      .scaleExtent([.5, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
      .extent([[0, 0], [width, height]])
      .on("zoom", updateChart);

    var svg = d3
      .select("body")
      .append("svg")
      // .style("width", width + margin.left + margin.right + "px")
      // .style("height", height + margin.top + margin.bottom + "px")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "svg")
      .call(zoom)

    //NEST : group data by country
    var nest = d3
      .nest()
      .key(function (d) {
        return d.Country;
      })
      .entries(data);

    d3.select("#select")
      .selectAll('myOptions')
      .data(nest)
      .enter()
      .append("option")
      .text(function (d) {
        return d.key;

      }) // text showed in the menu
      .attr("value", function (d) {
        return d.key;
      }); // corresponding value returned by the button

    // Set the ranges
    var x = d3
      .scaleTime()
      .domain([
        d3.min(data, function (d) {
          return d.Date;
        }),
        d3.max(data, function (d) {
          return d.Date;
        }),
      ])
      .range([0, width]);
    var y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function (d) {
          return d.Case;
        }),
      ])
      .range([height, 0]);
    // color
    var res = nest.slice(0, 0).map(function (d) {
      return d.key;
    });
    //console.log(nest)
    // console.log(res)
    var color = d3
      .scaleOrdinal()
      .domain(res)
      .range(d3.schemeDark2);

    //  Add the X Axis
    var xaxis = svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeDate)
          .tickSize(0, 0)
          .tickFormat(d3.timeFormat("%b-%d-%Y"))
          .tickSizeInner(0)
          .tickPadding(10)
      );

    // Add the Y Axis
    var yaxis = svg
      .append("g")
      .attr("class", "y axis")
      .call(
        d3.axisLeft(y).ticks(5).tickSizeInner(0).tickPadding(6).tickSize(0, 0)
      );

    // Add a label to the y axis
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - 80)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("CONFIRMED CASES ")
      .attr("class", "y axis label")
      .style("fill", "darkgreen");

    // Add line into SVG
    var line = d3
      .line()
      .x((d) => x(d.Date))
      .y((d) => y(d.Case));

    let glines = svg.append("g");

    glines
      .selectAll(".line-group")
      .data(nest.slice(0, 0))
      .enter()
      .append("g")
      .append("path")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("stroke", function (d) {
        return color(d.key);
      })
      .attr("class", function (d) {
        return "line " + d.key;
      })
      .attr("d", (d) => line(d.values))
      .style("stroke-width", "1.1")
      .attr("class", "line-group");

    // Add the CIRCLE on the lines
    svg
      .selectAll("myDots")
      .data(nest.slice(0, 0))
      .enter()
      .append("g")
      .style("fill", "white")
      .attr("stroke", function (d) {
        return color(d.key);
      })
      .style("stroke-width", "0")
      .selectAll("myPoints")
      .data(function (d) {
        return d.values;
      })
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d.Date);
      })
      .attr("cy", function (d) {
        return y(d.Case);
      })
      .attr("r", 2)
      .attr("class", function (d) {
        return "circle " + d.key;
      })
      .attr("class", "myDots");
    //.style("opacity", 0.5)

    // LEGEND

    //Hightlight the country which is hovered
    var highlight = function (d) {
      d3.selectAll(".line").transition().duration(300).style("opacity", 0.05);

      d3.select("." + d.key)

        .transition()
        .duration(300)
        .style("opacity", "1")
        .style("stroke-width", "3");
    };

    // when it is not hovered anymore
    var noHighlight = function (d) {
      d3.selectAll(".line")
        .transition()
        .duration("100")
        .style("opacity", "1")
        .style("stroke-width", "2");
    };

    // Add one dot in the legend for each name.
    var size = 20;
    svg
      .selectAll("myRect")
      .data(nest.slice(0, 0))
      .enter()
      .append("rect")
      .attr("x", 840)
      .attr("y", function (d, i) {
        return i * (size + 5);
      })
      .attr("width", size)
      .attr("height", size)
      .style("fill", function (d) {
        return color(d.key);
      })
      .on("mouseover", highlight)
      .on("mouseleave", noHighlight)

    // Add one dot in the legend for each name.
    svg
      .selectAll("mylabels")
      .data(nest.slice(0, 0))
      .enter()
      .append("text")
      .attr("x", 840 + size * 1.2)
      .attr("y", function (d, i) {
        return i * (size + 5) + size / 2;
      })
      .style("fill", function (d) {
        return color(d.key);
      })
      .text(function (d) {
        return d.key;
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .on("mouseover", highlight)
      .on("mouseleave", noHighlight);

    // this the black vertical line to folow mouse
    var mouseG = svg.append("g").attr("class", "mouse-over-effects");

    mouseG
      .append("path")
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-dasharray", "3, 3")
      .style("stroke-width", "1.5px")
      .style("opacity", "0");

    var mousePerLine = mouseG
      .selectAll(".mouse-per-line")
      .data(nest.slice(0, 0))
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine
      .append("circle")
      .attr("r", 7)
      .style("stroke", function (d) {
        return color(d.key);
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text").attr("transform", "translate(10,-5)");

    var tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background-color", "#D3D3D3")
      .style("padding", 5 + "px")
      .style("display", "none");

    mouseG
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("class", "mainRect")
      .attr("pointer-events", "all")
      .on("mouseout", function () {
        d3.select(".mouse-line").style("opacity", "0");
        d3.selectAll(".mouse-per-line circle").style("opacity", "0");
        d3.selectAll(".mouse-per-line text").style("opacity", "0");
        d3.selectAll("#tooltip").style("display", "none");
      })
      .on("mouseover", function () {
        d3.select(".mouse-line").style("opacity", "1");
        d3.selectAll(".mouse-per-line circle").style("opacity", "1");
        d3.selectAll(".mouse-per-line text").style("opacity", "1");
        d3.selectAll("#tooltip").style("display", "block");
      })
      .on("mousemove", function () {
        var mouse = d3.mouse(this);

        if (mouse[0] >= width) {
          mouseG.select("rect").attr("width", width + 30);
          return;
        }

        d3.selectAll(".mouse-per-line").attr("transform", function (d) {
          var xDate = x.invert(mouse[0]);
          var bisect = d3.bisector(function (d) {
            return d.Date;
          }).right;
          var idx = bisect(d.values, xDate);

          let xCoordinate = x(d.values[idx].Date).toString();
          let yCoordinate = y(d.values[idx].Case).toString();

          d3.select(".mouse-line").attr("d", function () {
            var data = "M" + xCoordinate + "," + height;
            data += " " + xCoordinate + "," + 0;
            return data;
          });

          d3.select(this)
            .select("text")
            .text(y.invert(yCoordinate).toFixed(0))
            .attr("fill", function (d) {
              return color(d.key);
            });

          return "translate(" + xCoordinate + "," + yCoordinate + ")";
        });

        updateTooltipContent(mouse, nest);
      });

    function updateTooltipContent(mouse, nest) {
      var sortingObj = [];

      nest.map((d) => {
        var xDate = x.invert(mouse[0]);
        var bisect = d3.bisector(function (d) {
          return d.Date;
        }).right;
        var idx = bisect(d.values, xDate);

        sortingObj.push({
          country: d.values[idx].Country,
          case: d.values[idx].Case,
          date: d.values[idx].Date,
        });
      });

      if (sortingObj[0] == null) return;

      sortingObj.sort((x, y) => y.case - x.case);

      tooltip
        .html((d) => {
          var string = sortingObj[0].Date.toString();
          var i = string.indexOf("00:00:00");
          return string.substring(0, i);
        })
        .style("left", d3.event.pageX + 50 + "px")
        .style("top", d3.event.pageY - 50 + "px")
        .style("display", "block")
        .style("font-size", 12)
        .selectAll()
        .data(sortingObj)
        .enter()
        .append("div")
        .style("color", (d) => {
          return color(d.country);
        })
        .style("font-size", 10)
        .html((d) => {
          return d.country + " : " + d.case;
        });
    }
  }

  function handleRemove(country) {
    console.log(country)
    // console.log(tempArray.filter(item => item != country))
    tempArray = tempArray.filter(item => item != country)
    console.log(tempArray)
    var res = nest.filter(item => tempArray.indexOf(item.key) != -1).map(function (d) {
      return d.key;
    });

    var nestChange = nest.filter(item => tempArray.indexOf(item.key) != -1);
    var dataChange = data.filter(item => tempArray.indexOf(item.Country) != -1);

    x = d3
      .scaleTime()
      .domain([
        d3.min(dataChange, function (d) {
          return d.Date;
        }),
        d3.max(data, function (d) {
          return d.Date;
        }),
      ])
      .range([0, width]);
    y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(dataChange, function (d) {
          return d.Case;
        }),
      ])
      .range([height, 0]);


    //  Add the X Axis
    xaxis
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeDate)
          .tickSize(0, 0)
          .tickFormat(d3.timeFormat("%b-%d-%Y"))
          .tickSizeInner(0)
          .tickPadding(10)
      );

    // Add the Y Axis
    yaxis
      .call(
        d3.axisLeft(y).ticks(5).tickSizeInner(0).tickPadding(6).tickSize(0, 0)
      );


    // Add line into SVG
    var line = d3
      .line()
      .x((d) => x(d.Date))
      .y((d) => y(d.Case));

    svg.selectAll(".line-group").remove();
    svg.selectAll(".myDots").remove();
    svg.selectAll(".mouse-per-line").remove();

    let glines = svg.append("g");

    glines
      .selectAll(".line-group")
      .data(nestChange)
      .enter()
      .append("g")
      .append("path")
      .attr("fill", "none")
      .attr("stroke", function (d) {
        return color(d.key);
      })
      .attr("class", function (d) {
        return "line " + d.key;
      })
      .attr("d", (d) => line(d.values))
      .style("stroke-width", "1.1")
      .attr("class", "line-group");

    // Add the CIRCLE on the lines
    svg
      .selectAll("myDots")
      .data(nestChange)
      .enter()
      .append("g")
      .style("fill", "none")
      .attr("stroke", function (d) {
        return color(d.key);
      })
      .style("stroke-width", "0")
      .selectAll("myPoints")
      .data(function (d) {
        return d.values;
      })
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d.Date);
      })
      .attr("cy", function (d) {
        return y(d.Case);
      })
      .attr("r", 2)
      .attr("class", function (d) {
        return "circle " + d.key;
      })
      .attr("class", "myDots");
    //.style("opacity", 0.5)

    // LEGEND

    //Hightlight the country which is hovered
    var highlight = function (d) {
      d3.selectAll(".line").transition().duration(300).style("opacity", 0.05);

      d3.select("." + d.key)

        .transition()
        .duration(300)
        .style("opacity", "1")
        .style("stroke-width", "3");
    };

    // when it is not hovered anymore
    var noHighlight = function (d) {
      d3.selectAll(".line")
        .transition()
        .duration("100")
        .style("opacity", "1")
        .style("stroke-width", "2");
    };


    d3.selectAll(".myRect").remove();
    d3.selectAll(".mylabels").remove();


    // Add one dot in the legend for each name.
    var size = 20;
    svg
      .selectAll("myRect")
      .data(nestChange)
      .enter()
      .append("rect")
      .attr("x", 840)
      .attr("y", function (d, i) {
        return i * (size + 5);
      })
      .attr("width", size)
      .attr("height", size)
      .style("fill", function (d) {
        return color(d.key);
      })
      .attr("class", "myRect")
      .on("mouseover", highlight)
      .on("mouseleave", noHighlight)

    // Add one dot in the legend for each name.
    svg
      .selectAll("mylabels")
      .data(nestChange)
      .enter()
      .append("text")
      .attr("x", 840 + size * 1.2)
      .attr("y", function (d, i) {
        return i * (size + 5) + size / 2;
      })
      .style("fill", function (d) {
        return color(d.key);
      })
      .attr("cursor", "pointer")
      .text(function (d) {
        return d.key;
      })
      .on("click", (e) => handleRemove(e.key))
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .attr("class", "mylabels")
      .on("mouseover", highlight)
      .on("mouseleave", noHighlight);


    // this the black vertical line to folow mouse
    var mouseG = svg.append("g").attr("class", "mouse-over-effects");

    mouseG
      .append("path")
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-dasharray", "3, 3")
      .style("stroke-width", "1.5px")
      .style("opacity", "0");

    var mousePerLine = mouseG
      .selectAll(".mouse-per-line")
      .data(nestChange)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine
      .append("circle")
      .attr("r", 7)
      .style("stroke", function (d) {
        return color(d.key);
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text").attr("transform", "translate(10,-5)");

    mouseG
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("class", "mainRect")

      .attr("pointer-events", "all")
      .on("mouseout", function () {
        d3.select(".mouse-line").style("opacity", "0");
        d3.selectAll(".mouse-per-line circle").style("opacity", "0");
        d3.selectAll(".mouse-per-line text").style("opacity", "0");
        d3.selectAll("#tooltip").style("display", "none");
      })
      .on("mouseover", function () {
        d3.select(".mouse-line").style("opacity", "1");
        d3.selectAll(".mouse-per-line circle").style("opacity", "1");
        d3.selectAll(".mouse-per-line text").style("opacity", "1");
        d3.selectAll("#tooltip").style("display", "block");
      })
      .on("mousemove", function () {
        var mouse = d3.mouse(this);

        if (mouse[0] >= width) {
          mouseG.select("rect").attr("width", width + 30);
          return;
        }

        d3.selectAll(".mouse-per-line").attr("transform", function (d) {
          var xDate = x.invert(mouse[0]);
          var bisect = d3.bisector(function (d) {
            return d.Date;
          }).right;
          var idx = bisect(d.values, xDate);

          let xCoordinate = x(d.values[idx].Date).toString();
          let yCoordinate = y(d.values[idx].Case).toString();

          d3.select(".mouse-line").attr("d", function () {
            var data = "M" + xCoordinate + "," + height;
            data += " " + xCoordinate + "," + 0;
            return data;
          });

          d3.select(this)
            .select("text")
            .text(y.invert(yCoordinate).toFixed(0))
            .attr("fill", function (d) {
              return color(d.key);
            });

          return "translate(" + xCoordinate + "," + yCoordinate + ")";
        });

        updateTooltipContent(mouse, nest);
      });
  }





  function updateChart() {

    console.log(nest)
    console.log(tempArray)
    // recover the new scale
    var newX = d3.event.transform.rescaleX(x);
    var newY = d3.event.transform.rescaleY(y);

    var nestChange = nest.filter(item => tempArray.indexOf(item.key) != -1);
    var dataChange = data.filter(item => tempArray.indexOf(item.Country) != -1);

    // // update axes with these new boundaries


    xaxis
      .call(
        d3
          .axisBottom(newX)
          .ticks(d3.timeDate)
          .tickSize(0, 0)
          .tickFormat(d3.timeFormat("%b-%d-%Y"))
          .tickSizeInner(0)
          .tickPadding(10)
      );

    // Add the Y Axis
    yaxis
      .call(
        d3.axisLeft(newY).ticks(5).tickSizeInner(0).tickPadding(6).tickSize(0, 0)
      );

    var line = d3
      .line()
      .x((d) => newX(d.Date))
      .y((d) => newY(d.Case));

    // svg.selectAll(".line-group").remove();
    svg.selectAll(".myDots").remove();
    svg.selectAll(".mouse-per-line").remove();


    svg.selectAll(".line-group")
      .attr("clip-path", "url(#clip)")
      .attr("d", (d) => line(d.values))

    // Add the CIRCLE on the lines
    svg
      .selectAll("myDots")
      .data(nestChange)
      .enter()
      .append("g")
      .style("fill", "none")
      .attr("stroke", function (d) {
        return color(d.key);
      })
      .style("stroke-width", "0")
      .selectAll("myPoints")
      .data(function (d) {
        return d.values;
      })
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return newX(d.Date);
      })
      .attr("cy", function (d) {
        return newY(d.Case);
      })
      .attr("r", 2)
      .attr("class", function (d) {
        return "circle " + d.key;
      })
      .attr("class", "myDots");
    //.style("opacity", 0.5)

    // LEGEND

    //Hightlight the country which is hovered
    var highlight = function (d) {
      d3.selectAll(".line").transition().duration(300).style("opacity", 0.05);

      d3.select("." + d.key)

        .transition()
        .duration(300)
        .style("opacity", "1")
        .style("stroke-width", "3");
    };

    // when it is not hovered anymore
    var noHighlight = function (d) {
      d3.selectAll(".line")
        .transition()
        .duration("100")
        .style("opacity", "1")
        .style("stroke-width", "2");
    };

    d3.selectAll(".myRect").remove();
    d3.selectAll(".mylabels").remove();


    // Add one dot in the legend for each name.
    var size = 20;
    svg
      .selectAll("myRect")
      .data(nestChange)
      .enter()
      .append("rect")
      .attr("x", 840)
      .attr("y", function (d, i) {
        return i * (size + 5);
      })
      .attr("width", size)
      .attr("height", size)
      .style("fill", function (d) {
        return color(d.key);
      })
      .attr("class", "myRect")
      .on("mouseover", highlight)
      .on("mouseleave", noHighlight);

    d3.selectAll(".mylabels").remove();

    // Add one dot in the legend for each name.
    svg
      .selectAll("mylabels")
      .data(nestChange)
      .enter()
      .append("text")
      .attr("x", 840 + size * 1.2)
      .attr("y", function (d, i) {
        return i * (size + 5) + size / 2;
      })
      .style("fill", function (d) {
        return color(d.key);
      })
      .attr("cursor", "pointer")
      .text(function (d) {
        return d.key;
      })
      .on("click", (e) => handleRemove(e.key))
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .attr("class", "mylabels")
      .on("mouseover", highlight)
      .on("mouseleave", noHighlight);


    // this the black vertical line to folow mouse
    var mouseG = svg.append("g").attr("class", "mouse-over-effects");

    mouseG
      .append("path")
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-dasharray", "3, 3")
      .style("stroke-width", "1.5px")
      .style("opacity", "0");

    var mousePerLine = mouseG
      .selectAll(".mouse-per-line")
      .data(nestChange)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine
      .append("circle")
      .attr("r", 7)
      .style("stroke", function (d) {
        return color(d.key);
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text").attr("transform", "translate(10,-5)");

    mouseG
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("class", "mainRect")

      .attr("pointer-events", "all")
      .on("mouseout", function () {
        d3.select(".mouse-line").style("opacity", "0");
        d3.selectAll(".mouse-per-line circle").style("opacity", "0");
        d3.selectAll(".mouse-per-line text").style("opacity", "0");
        d3.selectAll("#tooltip").style("display", "none");
      })
      .on("mouseover", function () {
        d3.select(".mouse-line").style("opacity", "1");
        d3.selectAll(".mouse-per-line circle").style("opacity", "1");
        d3.selectAll(".mouse-per-line text").style("opacity", "1");
        d3.selectAll("#tooltip").style("display", "block");
      })
      .on("mousemove", function () {
        var mouse = d3.mouse(this);

        if (mouse[0] >= width) {
          mouseG.select("rect").attr("width", width + 30);
          return;
        }

        d3.selectAll(".mouse-per-line").attr("transform", function (d) {
          var xDate = newX.invert(mouse[0]);
          var bisect = d3.bisector(function (d) {
            return d.Date;
          }).right;
          var idx = bisect(d.values, xDate);

          let xCoordinate = newX(d.values[idx].Date).toString();
          let yCoordinate = newY(d.values[idx].Case).toString();

          d3.select(".mouse-line").attr("d", function () {
            var data = "M" + xCoordinate + "," + height;
            data += " " + xCoordinate + "," + 0;
            return data;
          });

          d3.select(this)
            .select("text")
            .text(newY.invert(yCoordinate).toFixed(0))
            .attr("fill", function (d) {
              return color(d.key);
            });

          return "translate(" + xCoordinate + "," + yCoordinate + ")";
        });

        updateTooltipContent(mouse, nest);
      });

  }





  var tempArray = []
  const select = document.querySelector("#select");
  select.onchange = (e) => {
    console.log(e.target.value);
    tempArray.push(e.target.value);
    console.log(tempArray)
    console.log(nest.filter(item => tempArray.indexOf(item.key) != -1))

    // Set the ranges
    // var x = d3.scaleTime()
    //   .domain([d3.min(data, function (d) { return d.Date; }),
    //   d3.max(data, function (d) { return d.Date; })
    //   ])
    //   .range([0, width]);
    // var y = d3.scaleLinear()
    //   .domain([0, d3.max(data, function (d) { return d.Case; })])
    //   .range([height, 0]);
    // color
    var res = nest.filter(item => tempArray.indexOf(item.key) != -1).map(function (d) {
      return d.key;
    });

    var nestChange = nest.filter(item => tempArray.indexOf(item.key) != -1);
    var dataChange = data.filter(item => tempArray.indexOf(item.Country) != -1);

    x = d3
      .scaleTime()
      .domain([
        d3.min(dataChange, function (d) {
          return d.Date;
        }),
        d3.max(data, function (d) {
          return d.Date;
        }),
      ])
      .range([0, width]);
    y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(dataChange, function (d) {
          return d.Case;
        }),
      ])
      .range([height, 0]);


    //  Add the X Axis
    xaxis
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeDate)
          .tickSize(0, 0)
          .tickFormat(d3.timeFormat("%b-%d-%Y"))
          .tickSizeInner(0)
          .tickPadding(10)
      );

    // Add the Y Axis
    yaxis
      .call(
        d3.axisLeft(y).ticks(5).tickSizeInner(0).tickPadding(6).tickSize(0, 0)
      );


    // Add line into SVG
    var line = d3
      .line()
      .x((d) => x(d.Date))
      .y((d) => y(d.Case));

    svg.selectAll(".line-group").remove();
    svg.selectAll(".myDots").remove();
    svg.selectAll(".mouse-per-line").remove();


    var clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width)
      .attr("height", height)

    let glines = svg.append("g").attr("clip-path", "url(#clip)")


    glines
      .selectAll(".line-group")
      .data(nestChange)
      .enter()
      .append("g")
      .append("path")
      .attr("fill", "none")
      .attr("stroke", function (d) {
        return color(d.key);
      })
      .attr("class", function (d) {
        return "line " + d.key;
      })
      .attr("d", (d) => line(d.values))
      .style("stroke-width", "1.1")
      .attr("class", "line-group");

    // Add the CIRCLE on the lines
    svg
      .selectAll("myDots")
      .data(nestChange)
      .enter()
      .append("g")
      .style("fill", "none")
      .attr("stroke", function (d) {
        return color(d.key);
      })
      .style("stroke-width", "0")
      .selectAll("myPoints")
      .data(function (d) {
        return d.values;
      })
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d.Date);
      })
      .attr("cy", function (d) {
        return y(d.Case);
      })
      .attr("r", 2)
      .attr("class", function (d) {
        return "circle " + d.key;
      })
      .attr("class", "myDots");
    //.style("opacity", 0.5)

    // LEGEND

    //Hightlight the country which is hovered
    var highlight = function (d) {
      d3.selectAll(".line").transition().duration(300).style("opacity", 0.05);

      d3.select("." + d.key)

        .transition()
        .duration(300)
        .style("opacity", "1")
        .style("stroke-width", "3");
    };

    // when it is not hovered anymore
    var noHighlight = function (d) {
      d3.selectAll(".line")
        .transition()
        .duration("100")
        .style("opacity", "1")
        .style("stroke-width", "2");
    };

    d3.selectAll(".myRect").remove();
    d3.selectAll(".mylabels").remove();


    // Add one dot in the legend for each name.
    var size = 20;
    svg
      .selectAll("myRect")
      .data(nestChange)
      .enter()
      .append("rect")
      .attr("x", 840)
      .attr("y", function (d, i) {
        return i * (size + 5);
      })
      .attr("width", size)
      .attr("height", size)
      .style("fill", function (d) {
        return color(d.key);
      })
      .attr("class", "myRect")
      .on("mouseover", highlight)
      .on("mouseleave", noHighlight);

    d3.selectAll(".mylabels").remove();

    // Add one dot in the legend for each name.
    svg
      .selectAll("mylabels")
      .data(nestChange)
      .enter()
      .append("text")
      .attr("x", 840 + size * 1.2)
      .attr("y", function (d, i) {
        return i * (size + 5) + size / 2;
      })
      .style("fill", function (d) {
        return color(d.key);
      })
      .attr("cursor", "pointer")
      .text(function (d) {
        return d.key;
      })
      .on("click", (e) => handleRemove(e.key))
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .attr("class", "mylabels")
      .on("mouseover", highlight)
      .on("mouseleave", noHighlight);


    // this the black vertical line to folow mouse
    var mouseG = svg.append("g").attr("class", "mouse-over-effects");

    mouseG
      .append("path")
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-dasharray", "3, 3")
      .style("stroke-width", "1.5px")
      .style("opacity", "0");

    var mousePerLine = mouseG
      .selectAll(".mouse-per-line")
      .data(nestChange)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine
      .append("circle")
      .attr("r", 7)
      .style("stroke", function (d) {
        return color(d.key);
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text").attr("transform", "translate(10,-5)");

    mouseG
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("class", "mainRect")

      .attr("pointer-events", "all")
      .on("mouseout", function () {
        d3.select(".mouse-line").style("opacity", "0");
        d3.selectAll(".mouse-per-line circle").style("opacity", "0");
        d3.selectAll(".mouse-per-line text").style("opacity", "0");
        d3.selectAll("#tooltip").style("display", "none");
      })
      .on("mouseover", function () {
        d3.select(".mouse-line").style("opacity", "1");
        d3.selectAll(".mouse-per-line circle").style("opacity", "1");
        d3.selectAll(".mouse-per-line text").style("opacity", "1");
        d3.selectAll("#tooltip").style("display", "block");
      })
      .on("mousemove", function () {
        var mouse = d3.mouse(this);

        if (mouse[0] >= width) {
          mouseG.select("rect").attr("width", width + 30);
          return;
        }

        d3.selectAll(".mouse-per-line").attr("transform", function (d) {
          var xDate = x.invert(mouse[0]);
          var bisect = d3.bisector(function (d) {
            return d.Date;
          }).right;
          var idx = bisect(d.values, xDate);

          let xCoordinate = x(d.values[idx].Date).toString();
          let yCoordinate = y(d.values[idx].Case).toString();

          d3.select(".mouse-line").attr("d", function () {
            var data = "M" + xCoordinate + "," + height;
            data += " " + xCoordinate + "," + 0;
            return data;
          });

          d3.select(this)
            .select("text")
            .text(y.invert(yCoordinate).toFixed(0))
            .attr("fill", function (d) {
              return color(d.key);
            });

          return "translate(" + xCoordinate + "," + yCoordinate + ")";
        });

        updateTooltipContent(mouse, nest);
      });
  };

  const input = document.querySelector("#input");
  input.setAttribute("min", 0);
  input.setAttribute("max", nest.length);
  input.setAttribute("value", 20);
  input.onchange = (e) => {
    console.log(e.target.value);
    const groupValue = e.target.value;
    // Set the ranges
    // var x = d3.scaleTime()
    //   .domain([d3.min(data, function (d) { return d.Date; }),
    //   d3.max(data, function (d) { return d.Date; })
    //   ])
    //   .range([0, width]);
    // var y = d3.scaleLinear()
    //   .domain([0, d3.max(data, function (d) { return d.Case; })])
    //   .range([height, 0]);
    // color
    var res = nest.slice(0, groupValue).map(function (d) {
      return d.key;
    });




    // Add line into SVG
    var line = d3
      .line()
      .x((d) => x(d.Date))
      .y((d) => y(d.Case));

    svg.selectAll(".line-group").remove();
    svg.selectAll(".myDots").remove();
    svg.selectAll(".mouse-per-line").remove();

    let glines = svg.append("g");

    glines
      .selectAll(".line-group")
      .data(nest.slice(0, groupValue))
      .enter()
      .append("g")
      .append("path")
      .attr("fill", "none")
      .attr("stroke", function (d) {
        return color(d.key);
      })
      .attr("class", function (d) {
        return "line " + d.key;
      })
      .attr("d", (d) => line(d.values))
      .style("stroke-width", "1.1")
      .attr("class", "line-group");

    // Add the CIRCLE on the lines
    svg
      .selectAll("myDots")
      .data(nest.slice(0, groupValue))
      .enter()
      .append("g")
      .style("fill", "white")
      .attr("stroke", function (d) {
        return color(d.key);
      })
      .style("stroke-width", "0")
      .selectAll("myPoints")
      .data(function (d) {
        return d.values;
      })
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d.Date);
      })
      .attr("cy", function (d) {
        return y(d.Case);
      })
      .attr("r", 2)
      .attr("class", function (d) {
        return "circle " + d.key;
      })
      .attr("class", "myDots");
    //.style("opacity", 0.5)

    // LEGEND

    //Hightlight the country which is hovered
    var highlight = function (d) {
      d3.selectAll(".line").transition().duration(300).style("opacity", 0.05);

      d3.select("." + d.key)

        .transition()
        .duration(300)
        .style("opacity", "1")
        .style("stroke-width", "3");
    };

    // when it is not hovered anymore
    var noHighlight = function (d) {
      d3.selectAll(".line")
        .transition()
        .duration("100")
        .style("opacity", "1")
        .style("stroke-width", "2");
    };

    // Add one dot in the legend for each name.
    var size = 20;
    svg
      .selectAll("myRect")
      .data(nest.slice(0, groupValue))
      .enter()
      .append("rect")
      .attr("x", 840)
      .attr("y", function (d, i) {
        return i * (size + 5);
      })
      .attr("width", size)
      .attr("height", size)
      .style("fill", function (d) {
        return color(d.key);
      })
      .on("mouseover", highlight)
      .on("mouseleave", noHighlight);

    // Add one dot in the legend for each name.
    svg
      .selectAll("mylabels")
      .data(nest.slice(0, groupValue))
      .enter()
      .append("text")
      .attr("x", 840 + size * 1.2)
      .attr("y", function (d, i) {
        return i * (size + 5) + size / 2;
      })
      .style("fill", function (d) {
        return color(d.key);
      })
      .text(function (d) {
        return d.key;
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .on("mouseover", highlight)
      .on("mouseleave", noHighlight);

    // this the black vertical line to folow mouse
    var mouseG = svg.append("g").attr("class", "mouse-over-effects");

    mouseG
      .append("path")
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-dasharray", "3, 3")
      .style("stroke-width", "1.5px")
      .style("opacity", "0");

    var mousePerLine = mouseG
      .selectAll(".mouse-per-line")
      .data(nest.slice(0, groupValue))
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine
      .append("circle")
      .attr("r", 7)
      .style("stroke", function (d) {
        return color(d.key);
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text").attr("transform", "translate(10,-5)");

    mouseG
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("class", "mainRect")

      .attr("pointer-events", "all")
      .on("mouseout", function () {
        d3.select(".mouse-line").style("opacity", "0");
        d3.selectAll(".mouse-per-line circle").style("opacity", "0");
        d3.selectAll(".mouse-per-line text").style("opacity", "0");
        d3.selectAll("#tooltip").style("display", "none");
      })
      .on("mouseover", function () {
        d3.select(".mouse-line").style("opacity", "1");
        d3.selectAll(".mouse-per-line circle").style("opacity", "1");
        d3.selectAll(".mouse-per-line text").style("opacity", "1");
        d3.selectAll("#tooltip").style("display", "block");
      })
      .on("mousemove", function () {
        var mouse = d3.mouse(this);

        if (mouse[0] >= width) {
          mouseG.select("rect").attr("width", width + 30);
          return;
        }

        d3.selectAll(".mouse-per-line").attr("transform", function (d) {
          var xDate = x.invert(mouse[0]);
          var bisect = d3.bisector(function (d) {
            return d.Date;
          }).right;
          var idx = bisect(d.values, xDate);

          let xCoordinate = x(d.values[idx].Date).toString();
          let yCoordinate = y(d.values[idx].Case).toString();

          d3.select(".mouse-line").attr("d", function () {
            var data = "M" + xCoordinate + "," + height;
            data += " " + xCoordinate + "," + 0;
            return data;
          });

          d3.select(this)
            .select("text")
            .text(y.invert(yCoordinate).toFixed(0))
            .attr("fill", function (d) {
              return color(d.key);
            });

          return "translate(" + xCoordinate + "," + yCoordinate + ")";
        });

        updateTooltipContent(mouse, nest);
      });
  };
});
