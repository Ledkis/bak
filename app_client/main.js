queue()
    .defer(d3.json, "/api/data")
    .await(makeGraphs);

function makeGraphs(error, apiData) {
    console.log(apiData.data.list.length)

    d3.select("#page-wrapper").selectAll("p")
    .data(apiData.data.list)
    .enter()
    .append("p")
    .text(d => d.name);
}