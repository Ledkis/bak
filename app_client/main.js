function initFRONT() {

    queue()
    .defer(d3.json, "/api/data")
    .await((error, apiData) => {

        const wikiData = apiData.data

        wikiData.list = wikiData.list.filter(el => {
            return el.deathPlaceLat && el.deathPlaceLng
          })

        let bmap = new BakMap(wikiData)
        bmap.draw()

        let timeline = new BakTimeline(wikiData)
        timeline.draw((selection) => {
            bmap.onSelectionChange(selection)
        })

        
        
    })
}