class BakMap {

    constructor(wikiData){
        this.wikiData = wikiData
        this.center = {lat: this.wikiData.list[0].deathPlaceLat, lng: this.wikiData.list[0].deathPlaceLng}
    
        this.bmap = new google.maps.Map(document.getElementById('bakMap'), {
            zoom: 4,
            center: this.center
        })

        this.markers = []
    }
        
    draw(){
        class OverlayMarker extends google.maps.OverlayView {
            // https://developers.google.com/maps/documentation/javascript/examples/overlay-simple?hl=fr
            constructor(pos, wikiObj, bmap){
                super()
        
                this.pos = pos
                this.wikiObj = wikiObj
        
                // Define a property to hold the image's div. We'll
                // actually create this div upon receipt of the onAdd()
                // method so we'll leave it null for now.
                this.div = null
        
                // Explicitly call setMap on this overlay.
                this.setMap(bmap)
        
                this.clickCallback = function () {}
            }
        
            onClick(cb){
                this.clickCallback = cb
            }
        
            onAdd(){
                this.div = document.createElement('div')
                this.div.classList.add('marker')
                this.div.style.position = 'absolute'
                this.div.innerHTML = this.wikiObj.name
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
        
        this.wikiData.list.forEach(wikiObj => {

            let pos = new google.maps.LatLng(wikiObj.deathPlaceLat, wikiObj.deathPlaceLng)
            
            let marker = new OverlayMarker(pos, wikiObj, this.bmap)
            
            this.markers.push(marker)

            let infoWindow = new google.maps.InfoWindow({
                content: wikiObj.name,
                position: pos
            })
            
            marker.onClick(() => {
                infoWindow.open(this.bmap)
                marker.hide()
            })
            
            infoWindow.addListener('closeclick', () => {
                marker.show()
            })
        })
    }

    onSelectionChange(selection){
        this.markers.forEach(marker => {
            if(selection.map(el => el.name).includes(marker.wikiObj.name)){
                marker.show()
            } else {
                marker.hide()
            }
        })
    }
}