queue()
    .defer(d3.json, "/api/data/timeline")
    .await(makeTimeLine);

function makeTimeLine(error, apiData) {

    const wikiData = apiData.data 

    const dataset = wikiData.list.filter(el => {
        return el.birthDate && 
                moment(el.birthDate).isValid() && 
                el.deathDate && 
                moment(el.deathDate).isValid()
    })

    let startDate = d3.min(dataset, d => moment(d.birthDate).valueOf())
    let endDate = d3.max(dataset, d => moment(d.deathDate).valueOf())

    //lastData = Array.from(dataset).sort((a, b) => moment(a.deathDate).valueOf() - moment(b.deathDate).valueOf()).slice(-1)[0]

    console.log(startDate, endDate)

    let w = 700
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
    let chart = d3.select("#timeline")
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

function makeMap() {

    queue()
    .defer(d3.json, "/api/data/map")
    .await((error, apiData) => {

        const wikiData = apiData.data

        let center = {lat: wikiData.list[0].deathPlaceLat, lng: wikiData.list[0].deathPlaceLng}
    
        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 4,
            center: center
        })

        class OverlayMarker extends google.maps.OverlayView {
            // https://developers.google.com/maps/documentation/javascript/examples/overlay-simple?hl=fr
            constructor(pos, name, map){
                super()
        
                this.pos = pos
                this.name = name
        
                // Define a property to hold the image's div. We'll
                // actually create this div upon receipt of the onAdd()
                // method so we'll leave it null for now.
                this.div = null
        
                // Explicitly call setMap on this overlay.
                this.setMap(map)

                this.clickCallback = function () {}
            }

            onClick(cb){
                this.clickCallback = cb
            }
        
            onAdd(){
                this.div = document.createElement('div')
                this.div.classList.add('marker')
                this.div.style.position = 'absolute'
                this.div.innerHTML = this.name
                this.div.addEventListener('click', this.clickCallback)

                let panes = this.getPanes()
                panes.overlayImage.appendChild(this.div)
            }
        
            draw(){
                let overlayProjection = this.getProjection()
                let position = overlayProjection.fromLatLngToDivPixel(this.pos)
                this.div.style.left = position.x + 'px'
                this.div.style.top = position.y + 'px'
            }
        
            onRemove(){
                this.div.parentNode.removeChild(this.div)
                this.div = null
            }

            show(){
                this.div.style.display = 'block'
            }

            hide(){
                this.div.style.display = 'none'
            }
        }
        
        wikiData.list.forEach(wikiObj => {
            // new google.maps.Marker({
            //         position: {lat: wikiObj.deathPlaceLat, lng: wikiObj.deathPlaceLng},
            //         map: map
            //     })
            let pos = new google.maps.LatLng(wikiObj.deathPlaceLat, wikiObj.deathPlaceLng)
            let marker = new OverlayMarker(pos, wikiObj.name, map)
            let infoWindow = new google.maps.InfoWindow({
                content: wikiObj.name,
                position: pos
            })
            marker.onClick(() => {
                infoWindow.open(map)
                marker.hide()
            })
            infoWindow.addListener('closeclick', () => {
                marker.show()
            })

            
        })

        
    })
}