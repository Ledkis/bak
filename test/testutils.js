const { performance } = require('perf_hooks');
const utils = require("../lib/utils");

const testutils = {};

testutils.performanceWrapper = function(fn, mark){
	performance.mark(`${mark}A`);

	let res;
	if(utils.isGeneratorFunction(fn)) res = fn.next();
	else res = fn();

	performance.mark(`${mark}B`);
	performance.measure(`${mark}A to ${mark}B`, `${mark}A`, `${mark}B`);
	const measure = performance.getEntriesByName(`${mark}A to ${mark}B`)[0];
	console.log(`time exec ${mark} : ${measure.duration} mills`);

	return res;
}

testutils.tw = function(fn){
	//testWrapper
	console.log(`__________________${fn.name}____________________`)
	console.log('result: ' + testutils.performanceWrapper(fn, fn.name));
	console.log(`________________________________________________`)
}


module.exports = testutils;