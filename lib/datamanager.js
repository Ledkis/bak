const fs = require('fs');
const config = require('config');

const datamanager = {};

const dataInfoFile = config.get('dataInfoFile')

datamanager.getDataInfoSync = function(){
	return JSON.parse(fs.readFileSync(dataInfoFile, 'utf8'));
}

datamanager.saveDataInfoSync = function(dataInfo){
	return 	fs.writeFileSync(dataInfoFile, JSON.stringify(dataInfo, null, 4));
}


module.exports = datamanager;