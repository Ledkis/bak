const { performance } = require('perf_hooks');

const testutils = {};

testutils.performanceWrapper = function(functionIterator, mark){
	performance.mark(`${mark}A`);
	functionIterator.next();
	performance.mark(`${mark}B`);
	performance.measure(`${mark}A to ${mark}B`, `${mark}A`, `${mark}B`);
	const measure = performance.getEntriesByName(`${mark}A to ${mark}B`)[0];
	console.log(`${mark} : ${measure.duration/1000} sec`);
}

testutils.tw = function(fn){
	//testWrapper
	console.log(`__________________${fn.name}____________________`)
	console.log(fn());
	console.log(`________________________________________________`)
}


module.exports = testutils;