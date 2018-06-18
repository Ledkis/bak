function initFRONT() {

    queue()
    .defer(d3.json, "/api/data")
    .await((error, apiData) => {

        const wikiData = apiData.data

        wikiData.list = wikiData.list.filter(el => {
            return el.deathPlaceLat && el.deathPlaceLng
          })

        let timeline = new Timeline(wikiData)

        timeline.draw()

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