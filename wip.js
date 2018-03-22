const config = require('config');
const cheerio = require("cheerio");
const fs = require('fs');
const logger = require ('./lib/my-winston')(__filename);
const wikimanager = require('./lib/wikimanager');
const datamanager = require('./lib/datamanager');

const NODE_ENV = config.get('NODE_ENV');

logger.info(`____________WIP: START____________`);
logger.info(`NODE_ENV: ${NODE_ENV}`)

// node --inspect-brk wip.js

const dataInfo = datamanager.getDataInfoSync();

const page = dataInfo["monarques_fr"].page

const rawData = fs.readFileSync(`./data/raw/${page}.html`, 'utf8');
const response = {text: {}};
response.text["*"] = rawData;

scrapWikiTablePage(response, page);

function scrapWikiTablePage(response, page, url){

    // Prepare result
    const data = {};
    data.title = page;
    if(url) data.url = url;

    data.list = [];


    const $ = cheerio.load(response.text["*"]);

    // get papes table or table title
    const elements = $('.mw-parser-output h3, caption, .wikitable');

    // Validate result before parsing
    if (elements.length === 0) {
    	throw new Error('scrapPapesPage: Unable to find any data!');
    	return;
    }

    let h3Context, caption = '';

    //Loop on the elements
    elementsLoop: for(let idElement = 0; idElement < elements.length; idElement++){

    	const element = elements[idElement];

    	if(element.name === 'h3'){
    		if(element.children[0].children.length > 0){
    			h3Context = $(element.children[0]).text();
    		} else {
    			h3Context = $(element.children[1]).text();
    		}
    		continue elementsLoop;
    	}

    	if($(element).find('caption')){
    		caption = $(element).find('caption').text();
    	}


    	const rows = $(element).find('tr');

    	let fiedsTagList = [];
        //Loop on the rows
        rowloop: for(let idRow = 0; idRow < rows.length; idRow++){
        	const row = rows[idRow];

        	if(idRow === 0){

        		const fieldsTag = $(row).find('th');

                //Loop on field tag
                for(let idField = 0; idField < fieldsTag.length; idField++){
                	let node = fieldsTag[idField];
                	fiedsTagList[idField] = $(node).text();
                }

                continue rowloop;
            }

            const fields = $(row).find('td');

            if(fields.length !== fiedsTagList.length) continue elementsLoop;

            const pageData = {};

            pageData.attribs = [];
            if(h3Context) pageData.attribs.push(h3Context);
            if(caption) pageData.attribs.push(caption);


            //Loop on field
            for(let idField = 0; idField < fiedsTagList.length; idField++){
            	pageData[fiedsTagList[idField]] = $(fields[idField]).text();
            }

            console.log(pageData);

            data.list.push(pageData);

        }
        
        caption = h3Context = '';
    }

    logger.info(`${data.list.length} data scrapped`);
    return data;
}