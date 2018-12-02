class BakTimeline {
    constructor(wikiData){
        this.wikiData = wikiData
    }

    draw(onSelectionChangeCb){

        let dataset = this.wikiData.list.filter(el => {
            return el.birthDate && 
                    moment(el.birthDate).isValid() && 
                    el.deathDate && 
                    moment(el.deathDate).isValid()
        })

        let selection = Array.from(dataset)

        let startDate = d3.min(dataset, d => moment(d.birthDate).valueOf())
        let endDate = d3.max(dataset, d => moment(d.deathDate).valueOf())

        let w = 500
        let h = 500

        let xPadding = 20
        let yPadding = 40

        let innerWidth = w - xPadding
        let innerHeight = h - yPadding

        let time = moment(startDate)
 
        // scales
        let xScale = d3.scale.linear()
        .domain([startDate, endDate])
        .range([0, innerWidth]);
        
        let yScale = d3.scale.linear()
            .domain([0, dataset.length])
            .range([0, innerHeight]);
            
        // canvas
        let chart = d3.select("#bakTimeline")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("class", "chart")

        // axis
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
        
        // time line selector
        let timeSelector = timeline.append("line")
            .attr("x1", xScale(time))
            .attr("y1", 0)
            .attr("x2", xScale(time))
            .attr("y2", h)
            .attr("stroke", "lightgray")

        let timeSelectorText = timeline.append("text")
            .text(`selectionTime: ${time.years()}`)
            .attr("x", 100)
            .attr("y", h)
            //.attr("dy", 0)
            
            .attr("class", "laneText")
            //.style("font", `${h/dataset.length}px sans-serif`)

        chart.on('mousemove', function ()  {
            let [mouseX, mouseY] = d3.mouse(this)
            //onMouseMove(mouseX, mouseY)
            timeSelector.attr("x1", mouseX).attr("x2", mouseX)

            time = moment(xScale.invert(mouseX))

            timeSelectorText.text(`selectionTime: ${time.years()}`)

            selection = dataset.filter(el => { 
                let isSelected = moment(el.birthDate).valueOf() <= time.valueOf() &&
                moment(el.deathDate).valueOf() >= time.valueOf()
                return isSelected
            })

            onSelectionChangeCb(selection)
        })


        //
            
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
}