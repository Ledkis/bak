const config = require('config');
const cheerio = require("cheerio");
const fs = require('fs');
const wikimanager = require('../lib/wikimanager');
const {promisify} = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const NODE_ENV = config.get('NODE_ENV');

// node --inspect-brk wip.js

const testFile = './test/data/test.json';

function longTask(id, time, _error, _rejectError, _trycatchError, _reject, _catch){

	time = Math.random()*time + 1000;

	console.log(`long task ${id}: started`);
	const p = new Promise((resolve, reject)=> {
		setTimeout(()=>{

			if(_error){
				let errorMsg = `long task ${id}: XXX a error occured XXX`;
				console.log(errorMsg);
				throw new Error(errorMsg);	 

				// Les erreurs non try catch dans un promise font planter le programme !

			}
			if(_rejectError) {
				let errorMsg = `long task ${id}: XXX a reject error occured XXX`;
				console.log(errorMsg);
				return reject(new Error(errorMsg));	 
			}

			if(_trycatchError) {
				try{
					let errorMsg = `long task ${id}: XXX a trycatchError occured XXX`;
					console.log(errorMsg);
					throw new Error(errorMsg);	 
				} catch  (err) {
					return reject(err);
				}
			}

			if(_reject){
				let errorMsg = `long task ${id}: XXX a reject occured without error XXX`;
				console.log(errorMsg);
				return reject(errorMsg);
			}
			
			const msg = `long task ${id}: resolved after ${time} millis`;
			console.log(msg);

			resolve(msg);
		}, time);
	})

	if(!_catch){
		return p;
	} else {
		return p.catch(err => {
			console.log(`long task ${id}: error [${err}]`)
		})
	}
}

const _noErrorNoCatch = [false, false, false, false, false];

const _errorNoCatch = [true, false, false, false, false];
const _errorCatch = [true, false, false, false, true];

const _rejectErrorNoCatch = [false, true, false, false, false];
const _rejectErrorCatch = [false, true, false, false, true];

const _trycatchErrorNoCatch = [false, false, true, false, false];
const _trycatchErrorCatch = [false, false, true, false, true];

const _rejectNoCatch = [false, false, true, true, false];
const _rejectCatch = [false, false, true, true, true];

const errorCases = {
	_noErrorNoCatch: _noErrorNoCatch,
// _errorNoCatch: _errorNoCatch,
// _errorCatch: _errorCatch,
// _rejectErrorNoCatch: _rejectErrorNoCatch,
_rejectErrorCatch: _rejectErrorCatch,
// _trycatchErrorNoCatch: _trycatchErrorNoCatch,
_trycatchErrorCatch: _trycatchErrorCatch,
_rejectNoCatch: _rejectNoCatch,
_rejectCatch: _rejectCatch,
_noErrorNoCatch2: _noErrorNoCatch,
_noErrorNoCatch3: _noErrorNoCatch,
_noErrorNoCatch4: _noErrorNoCatch
}


function promiseCaseErroTest(){

	const caseKeys = Object.keys(errorCases);

	let promise;
	caseKeys.forEach((key, index) => {
		if(index === 0){
			promise = longTask(key, 100, ...errorCases[key]);
		} else {

			promise = promise.then((res, err) => {
				if (err) {
					// then err does not work like this !!!
					console.log(`promise case ${caseKeys[index-1]} then: err [${err}]`);
					throw err;
				}

				//throw new Error();

				console.log(`promise case ${caseKeys[index-1]} then: res [${res}]`);	

				longTask(key +' solo', 100, ...errorCases[key]).catch(err => {
					console.log(`promise case ${caseKeys[0]} solo catch: err [${err}]`)
				});

				return longTask(key, 100, ...errorCases[key]);
			})
		}
	});

	promise.catch(err => {
		console.log(`promise case ${caseKeys[0]} catch: err [${err}]`);
	})

	console.log('all promise initialized');

}

console.log('start');
// promiseCaseErroTest();

longTask(1, 100).catch(err => console.log('stop')).then(res => {
	return longTask(2, 100, false, true);
}).then(res => {
	console.log(res);
}, err => {
	console.log(err);
}).then(() => console.log('im working')).catch(err => console.log('stop 2'));



// node ./test/promiseTest.js
// node --inspect-brk ./test/promiseTest.js