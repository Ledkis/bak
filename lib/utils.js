const utils = {}

utils.trim = function (str) {
  // https://stackoverflow.com/questions/1418050/string-strip-for-javascript
  // http://blog.stevenlevithan.com/archives/faster-trim-javascript
  str = str.replace(/^\s\s*/, '')
  let ws = /\s/
  let i = str.length
  while (ws.test(str.charAt(--i)));
  return str.slice(0, i + 1)
}

utils.logTrim = function (str, size) {
  if (str.length < size) str += ' '.repeat(size - str.length)
  if (str.length > size) str.substring(0, size)

  return str
}

function isGenerator (obj) {
  // https://github.com/tj/co/blob/717b043371ba057cb7a4a2a4e47120d598116ed7/index.js#L221
  return typeof obj.next === 'function' && typeof obj.throw === 'function'
}

utils.isGeneratorFunction = function (obj) {
  // https://github.com/tj/co/blob/717b043371ba057cb7a4a2a4e47120d598116ed7/index.js#L221
  // https://stackoverflow.com/questions/16754956/check-if-function-is-a-generator
  let constructor = obj.constructor
  if (!constructor) return false
  if (constructor.name === 'GeneratorFunction' || constructor.displayName === 'GeneratorFunction') return true
  return isGenerator(constructor.prototype)
}

utils.objToStr = function (obj, line){
  if(!obj) return 'undefined'
  obj = Array.isArray(obj) 
      ? obj.map(el => JSON.stringify(el)) 
      : Object.keys(obj)
        .filter(key => typeof obj[key] !== 'function')
        .map(key => {
                      let val = obj[key]
                      val = (typeof val === 'number' && !Number.isInteger(val)) 
                          ? Number(val).toFixed(2) 
                          : JSON.stringify(val)
                      return `${key}: ${val}`
                      })
  return (line ? '' : '\n') + obj.join(line ? ' ' : '\n');
}

utils.wait = function (time, valToPropagate) {
  return new Promise((resolve, reject) => {
    //console.log("waiting... ", time)
    setTimeout(resolve, time, valToPropagate)
  })
}

/*
 * serial executes Promises sequentially.
 * @param {funcs} An array of funcs that return promises.
 * @example
 * const urls = ['/url1', '/url2', '/url3']
 * serial(urls.map(url => () => $.ajax(url)))
 *     .then(console.log.bind(console))
 */
utils.serialPromise = function (tasks){
  // // TODO: understand whats happening...
  // const concat = list => Array.prototype.concat.bind(list)
  // const promiseConcat = f => x => f().then(concat(x))
  // const promiseReduce = (acc, x) => acc.then(promiseConcat(x))
  // return promises.reduce(promiseReduce, Promise.resolve([]))}

  // https://decembersoft.com/posts/promises-in-serial-with-array-reduce/
  return tasks.reduce((promiseChain, currentTask) => {
    return promiseChain.then(chainResults =>
        currentTask.then(currentResult => [ ...chainResults, currentResult ])
      )}, Promise.resolve([]))
} 

utils.groupsBy = function(array, key) {
  // https://stackoverflow.com/questions/14446511/what-is-the-most-efficient-method-to-groupby-on-a-javascript-array-of-objects
  return array.reduce(function(grpObj, cur) {
    (grpObj[cur[key]] = grpObj[cur[key]] || []).push(cur);
    return grpObj
  }, {})
}

module.exports = utils
