const { performance } = require('perf_hooks');
const logger = require ('../lib/mylogger')('unittest');
const utils = require("../lib/utils");

const testutils = {};

testutils.performanceWrapper = function(fn, args, mark){
	// we keep mark instead of using fn.name because it can return undefined and so perturb the marks
	if (arguments.length < 3) {
		mark = args;
		args = [];
	}

	performance.mark(`${mark}A`);

	let res;
	if(utils.isGeneratorFunction(fn)) res = fn.next(...args);
	else res = fn(...args);

	performance.mark(`${mark}B`);
	performance.measure(`${mark}A to ${mark}B`, `${mark}A`, `${mark}B`);
	const measure = performance.getEntriesByName(`${mark}A to ${mark}B`)[0];
	logger.test(`time exec ${mark} : ${measure.duration} mills`);

	return res;
}

testutils.tw = function(fn){
	//testWrapper
	logger.test(`__________________${fn.name}____________________`)
	let res = testutils.performanceWrapper(fn, fn.name);
	if(res) logger.test('result: ' + res);
	logger.test(`__________________END__________________`)
}


module.exports = testutils;