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

module.exports = utils
