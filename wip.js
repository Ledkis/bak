const config = require('config');
const wikipedia = require("./lib/my-node-wikipedia");
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
        if(opts.online){
         wikipedia.page.data(page, { content: true , lang:'fr'}, (response, page, url) => {
                // todo: Promise ?

                if(response.error) return reject(response.error);
                    
                const res = scrapPapesPage(response.parse, page, url);

                resolve(res);
            });
         } else {

            fs.readFile(`./data/raw/${page}.html`, 'utf8', (err, data) => {

                if (err) return reject(err);

                const response = {text: {}};

                response.text["*"] = data;

                const res = scrapPapesPage(response, page, url);

                resolve(res);
            });
        }
    });
}

function scrapPapesPage(response, page, url){

    // Prepare result
    const data = {};
    data.title = page;
    data.url = url;

    data.list = [];


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

}



fetchPapesList({online: true/*!(NODE_ENV === 'debug')*/}).then((res, err) => {
    if(err) throw err;
    logger.info(`papes nbr: ${res.list.length}`)
}).catch(error => { 
    logger.err(error); 
});

// node --inspect-brk wip.js