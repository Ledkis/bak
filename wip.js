const config = require('config');
const wikipedia = require("node-wikipedia");
const cheerio = require("cheerio");
const fs = require('fs');
const logger = require ('./lib/mylogger')('wip');
const wikimanager = require('./lib/wikimanager');

const NODE_ENV = config.get('NODE_ENV');

logger.info(`____________WIP: START____________`);
logger.info(`NODE_ENV: ${NODE_ENV}`)
//wikimanager.main();

function fetchPapesList(opts){
	const url = "http://fr.wikipedia.org/w/api.php?action=parse&page=Liste_des_papes&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json";
	const page = "Liste_des_papes";
	//const page = "List_of_tz_database_time_zones";

	logger.info(`fetchPapesList: ${page}`);

	return new Promise((resolve, reject) => {
		let res;

        if(opts.online){
           wikipedia.page.data(page, { content: true , lang:'en'}, (response, page, url) => {
                // todo: Promise ?
                res = scrapPapesPage(response, page, url);			
            });
       } else {
           const pageData = fs.readFileSync(`./data/raw/${page}.html`, 'utf8');
           const response = {text: {}};

           response.text["*"] = pageData;

           res = scrapPapesPage(response, page, url);
       }

       logger.info(`papes nbr: ${res.list.length}`)

       resolve(res);
   }).catch(error => { logger.err(error); });
	;
}

function scrapPapesPage(response, page, url){

    // Prepare result
    const data = {};
    data.title = page;
    data.url = url;

    data.list = [];

    try{

        const $ = cheerio.load(response.text["*"]);

        // get papes table
        var tables = $('.wikitable');

        // Validate result before parsing
        if (tables.length === 0) {
            throw new Error('Unable to find any data!');
            return;
        }

        //Loop on the tables
        tableloop: for(let idTable = 0; idTable < tables.length; idTable++){
            const table = tables[idTable];
            const rows = $(table).find('tr');

            let fiedsTagList = [];
            //Loop on the rows
            rowloop: for(let idRow = 0; idRow < rows.length; idRow++){
                const row = rows[idRow];

                if(idRow === 0){

                    const fieldsTag = $(row).find('th');

                    //Loop on field tag
                    for(let idField = 0; idField < fieldsTag.length; idField++){
                        let node = fieldsTag[idField];
                        if(node.children.length === 1){
                            fiedsTagList[idField] = node.children[0].data;
                        } else if(node.children.length === 2){
                                fiedsTagList[idField] = node.children[0].attribs.title;
                        } else {
                            // Not a pape table
                        }
                    }

                    continue rowloop;
                }

                const fields = $(row).find('td');

                if(fields.length !== fiedsTagList.length) continue tableloop;

                const pape = {};

                //Loop on field
                for(let idField = 0; idField < fiedsTagList.length; idField++){
                    pape[fiedsTagList[idField]] = $(fields[idField].children[0]).text();
                }

                //console.log(pape);

                data.list.push(pape);
            }
        }

        return data;

    } catch(err){
        err.message = `Error while parsing papes: ${err.message}`;
        logger.err(err);
        return data;
    }
}



fetchPapesList({online: !(NODE_ENV === 'debug')});

// node --inspect-brk wip.js