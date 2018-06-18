class BakTimeline {
    constructor(wikiData){
        this.wikiData = wikiData
        this.dataset = wikiData.list.filter(el => {
            return el.birthDate && 
                    moment(el.birthDate).isValid() && 
                    el.deathDate && 
                    moment(el.deathDate).isValid()
        })

        this.startDate = d3.min(this.dataset, d => moment(d.birthDate).valueOf())
        this.endDate = d3.max(this.dataset, d => moment(d.deathDate).valueOf())

        this.w = 700
        this.h = 700

        this.xPadding = 20
        this.yPadding = 40

        this.innerWidth = this.w - this.xPadding
        this.innerHeight = this.h - this.yPadding
    }

    draw(){
 
    // scales
    let xScale = d3.scale.linear()
    .domain([this.startDate, this.endDate])
    .range([0, this.innerWidth]);
    
    let yScale = d3.scale.linear()
        .domain([0, this.dataset.length])
        .range([0, this.innerHeight]);
        
    // canvas
    let chart = d3.select("#bakTimeline")
        .append("svg")
        .attr("width", this.w)
        .attr("height", this.h)
        .attr("class", "chart")

    // axis
    let xAxis = d3.svg.axis()
        .scale(xScale)
        .tickFormat(d => moment(d).format('YYYY'))
        .orient("bottom")

    chart.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${this.innerHeight})`)
        .call(xAxis)

    // timeline
    let timeline = chart.append("g")
        //.attr("transform", "translate(" + m[3] + "," + (h + m[0]) + ")")
        .attr("width", this.w)
        .attr("height", this.h)
        .attr("class", "timeline")
        
    timeline.append("g").selectAll(".lines")
        .data(this.dataset)
        .enter().append("line")
        .attr("x1", 0)
        .attr("y1", (d, i) =>  yScale(i))
        .attr("x2", this.w)
        .attr("y2", (d, i) =>  yScale(i))
        .attr("stroke", "lightgray")

    timeline.append("g").selectAll(".text")
        .data(this.dataset)
        .enter().append("text")
        .text(d => d.name)
        .attr("x", d => xScale(moment(d.birthDate).valueOf()))
        .attr("y", (d, i) => yScale(i))
        .attr("dy", `${this.h/this.dataset.length}px`)
        .attr("text-anchor", "end")
        .attr("class", "laneText")
        .style("font", `${this.h/this.dataset.length}px sans-serif`)
        
        
    // //mini item rects
    timeline.append("g").selectAll("miniItems")
        .data(this.dataset)
        .enter().append("rect")
        // .attr("class", (d, i) => "miniItem" + i)
        .attr("x", d => xScale(moment(d.birthDate).valueOf()))
        .attr("y", (d, i) => yScale(i) + 1)
        .attr("width", d => xScale(moment(d.deathDate).valueOf()) - xScale(moment(d.birthDate).valueOf()))
        .attr("height", this.h/this.dataset.length - 2)
        }
}