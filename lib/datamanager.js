const fs = require('fs');

const datamanager = {};

datamanager.getDataInfoSync = function(){
	return JSON.parse(fs.readFileSync(`./data/data_info.json`, 'utf8'));
}

module.exports = datamanager;