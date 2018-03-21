const config = require('config');
const wikipedia = require("./lib/my-node-wikipedia");
const cheerio = require("cheerio");
const fs = require('fs');
const logger = require ('./lib/my-winston')('wip');
const wikimanager = require('./lib/wikimanager');

const NODE_ENV = config.get('NODE_ENV');

logger.info(`____________WIP: START____________`);
logger.info(`NODE_ENV: ${NODE_ENV}`)

function fetchPapesList(opts){
	const url = "http://fr.wikipedia.org/w/api.php?action=parse&page=Liste_des_papes&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json";
	const page = "Liste_des_papes";
	//const page = "List_of_tz_database_time_zones";

	logger.info(`fetchPapesList: ${page}, opts: ${JSON.stringify(opts)}`);

	return new Promise((resolve, reject) => {
        if(opts.online){
         wikipedia.page.data(page, { content: true , lang:'fr'}, (response, page, url) => {
                // TODO: Promise && Remove try catch ?
                try{
                    if(response.error) return reject(response.error);

                    resolve(scrapPapesPage(response.parse, page, url));
                } catch(err){
                    reject(err);
                }
            });
         } else {
            fs.readFile(`./data/raw/${page}.html`, 'utf8', (err, data) => {

                try{
                    if (err) return reject(err);

                    const response = {text: {}};
                    response.text["*"] = data;

                    resolve(scrapPapesPage(response, page, url));
                } catch(err){
                    reject(err);
                }
            });
        }
    }).then((res, err) => {
        if(err) throw err;

        if(opts.save){
            return new Promise(function(resolve, reject) {
                fs.writeFile(`data/json/${res.title}.json`, JSON.stringify(res, null, 4), function(err) {
                    if (err) return reject(err);
                    logger.info(`data/json/${res.title}.json saved`);
                    resolve(res);
                });
            });
        }
        return res;

    });
}

function scrapPapesPage(response, page, url){

    // Prepare result
    const data = {};
    data.title = page;
    data.url = url;

    data.list = [];


    const $ = cheerio.load(response.text["*"]);

    // get papes table or table title
    var elements = $('.mw-parser-output h3, caption, .wikitable');

    // Validate result before parsing
    if (elements.length === 0) {
        throw new Error('Unable to find any data!');
        return;
    }

    let h3Context, caption = '';

    //Loop on the elements
    tableloop: for(let idTable = 0; idTable < elements.length; idTable++){
        
        const element = elements[idTable];

        if(element.name === 'h3'){
            if(element.children[0].children.length > 0){
                h3Context = $(element.children[0]).text();
            } else {
                h3Context = $(element.children[1]).text();
            }
            continue tableloop;
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

            pape.attribs = [];
            if(h3Context) pape.attribs.push(h3Context);
            if(caption) pape.attribs.push(caption);


            //Loop on field
            for(let idField = 0; idField < fiedsTagList.length; idField++){
                pape[fiedsTagList[idField]] = $(fields[idField].children[0]).text();
            }

            data.list.push(pape);

        }
        
        caption = h3Context = '';
    }

    logger.info(`${data.list.length} papes scrapped`);
    return data;
}



fetchPapesList({online: !(NODE_ENV === 'debug'), save:true}).then((res, err) => {
    if(err) throw err;
    logger.info(`papes nbr: ${res.list.length}`)
}).catch(error => { 
    logger.err(error); 
});

// node --inspect-brk wip.js