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

    let startDate = d3.min(dataset, d => moment(d.birthDate).valueOf());
    let endDate = d3.max(dataset, d => moment(d.birthDate).valueOf());

    console.log(startDate, endDate)

    let w = 960
    let h = 700

	// scales
    let xScale = d3.scale.linear()
        .domain([startDate, endDate])
        .range([0, w]);
		
    let yScale = d3.scale.linear()
        .domain([0, dataset.length])
        .range([0, h]);
		

    let chart = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "chart")
		
    chart.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", w)
        .attr("height", h)

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
        .attr("dy", ".5ex")
        .attr("text-anchor", "end")
        .attr("class", "laneText")
        .style("font", 'font: 2px sans-serif')
        
		
	// //mini item rects
    timeline.append("g").selectAll("miniItems")
        .data(dataset)
        .enter().append("rect")
        // .attr("class", (d, i) => "miniItem" + i)
        .attr("x", d => xScale(moment(d.birthDate).valueOf()))
        .attr("y", (d, i) => yScale(i))
        .attr("width", d => xScale(moment(d.deathDate).valueOf()))
        .attr("height", h/dataset.length - 2)
}