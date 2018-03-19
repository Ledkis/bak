const utils = {};

utils.addTrim = function(){
	if(typeof(String.prototype.trim) === "undefined"){
		 // https://stackoverflow.com/questions/1418050/string-strip-for-javascript
		  // http://blog.stevenlevithan.com/archives/faster-trim-javascript
		  String.prototype.trim = function() {
		  	var	str = str.replace(/^\s\s*/, ''),
		  	ws = /\s/,
		  	i = str.length;
		  	while (ws.test(str.charAt(--i)));
		  	return str.slice(0, i + 1);
		  };
	}
}

module.exports = utils;