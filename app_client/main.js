queue()
    .defer(d3.json, "/api/data")
    .await(makeGraphs);

function makeGraphs(error, apiData) {
    const dataset = apiData.data.list.filter(el => {
        return el.birthDate && 
                moment(el.birthDate).isValid() && 
                el.deathDate && 
                moment(el.deathDate).isValid()
    })

    let startDate = d3.min(dataset, d => moment(d.birthDate).valueOf())
    let endDate = d3.max(dataset, d => moment(d.deathDate).valueOf())

    //lastData = Array.from(dataset).sort((a, b) => moment(a.deathDate).valueOf() - moment(b.deathDate).valueOf()).slice(-1)[0]

    console.log(startDate, endDate)

    let w = 960
    let h = 700

    let xPadding = 20
    let yPadding = 40

    let innerWidth = w - xPadding
    let innerHeight = h - yPadding
   
	// scales
    let xScale = d3.scale.linear()
        .domain([startDate, endDate])
        .range([0, innerWidth]);
		
    let yScale = d3.scale.linear()
        .domain([0, dataset.length])
        .range([0, innerHeight]);
		

    // canvas
    let chart = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "chart")

    //
    let xAxis = d3.svg.axis()
        .scale(xScale)
        .tickFormat(d => moment(d).format('YYYY'))
        .orient("bottom")

    chart.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis)

    // timeline
    let timeline = chart.append("g")
        //.attr("transform", "translate(" + m[3] + "," + (h + m[0]) + ")")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "timeline")
		
    timeline.append("g").selectAll(".lines")
        .data(dataset)
        .enter().append("line")
        .attr("x1", 0)
        .attr("y1", (d, i) =>  yScale(i))
        .attr("x2", w)
        .attr("y2", (d, i) =>  yScale(i))
        .attr("stroke", "lightgray")

    timeline.append("g").selectAll(".text")
        .data(dataset)
        .enter().append("text")
        .text(d => d.name)
        .attr("x", d => xScale(moment(d.birthDate).valueOf()))
        .attr("y", (d, i) => yScale(i))
        .attr("dy", `${h/dataset.length}px`)
        .attr("text-anchor", "end")
        .attr("class", "laneText")
        .style("font", `${h/dataset.length}px sans-serif`)
        
		
	// //mini item rects
    timeline.append("g").selectAll("miniItems")
        .data(dataset)
        .enter().append("rect")
        // .attr("class", (d, i) => "miniItem" + i)
        .attr("x", d => xScale(moment(d.birthDate).valueOf()))
        .attr("y", (d, i) => yScale(i) + 1)
        .attr("width", d => xScale(moment(d.deathDate).valueOf()) - xScale(moment(d.birthDate).valueOf()))
        .attr("height", h/dataset.length - 2)
}