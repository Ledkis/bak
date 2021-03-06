const cheerio = require('cheerio')
const logger = require('./my-winston')(__filename)
const utils = require('./utils')
const wikiutils = require('./wikiutils')

const wikiscrapper = {}

wikiscrapper.getWikiScrapper = function (wikiDataType) {
  if (wikiDataType.includes('list')) return this.scrapPhilosPage
  else if(wikiDataType.includes('table')) return this.scrapWikiTablePage
  else throw new Error(`getWikiScrapper: no scrapper for this data type: ${JSON.stringify(wikiDataType)}; should be list or table`)
}

wikiscrapper.scrapInfoBox = function (pageHtml) {
  const data = {}
  const infoboxV3 = {}

  const $ = cheerio.load(pageHtml)
  $('.infobox_v3 table tr').map(function (i, el) {
    // this === el
    infoboxV3[$('th', el).text()] = utils.trim($('td', el).text().replace(/\n/g, ' '))
  })

  data.infoboxV3 = infoboxV3

  return data
}

wikiscrapper.scrapPhilosPage = function (pageHtml) {
  const data = {}
  data.list = []

  const $ = cheerio.load(pageHtml)

  let h2Section, h3Section, h4Section
  let context = {title: ''}

  const elements = $('.mw-parser-output')

  // Validate result before parsing
  if (elements.length === 0) {
    throw new Error('scrapPhilosPage: Unable to find any data!')
  }

  elements[0].children.forEach((el) => {
    if (el.name === 'h2' || el.name === 'h3' || el.name === 'h4') {
      if (el.children !== undefined && el.children.length > 1) {
        if (el.children[1] !== undefined && el.children[1].children[0] !== undefined) {
          let node = el.children[1].children[0]

          let section

          if (node.type && node.type === 'text') {
            section = {title: node.data}
          } else if (node.name && node.name === 'a') {
            section = {title: node.attribs.title, href: node.attribs.href}
          }

          if (el.name === 'h2') {
            h2Section = section
          } else if (el.name === 'h3') {
            h3Section = section
          } else if (el.name === 'h4') {
            h4Section = section
          }

          // console.log('section: ' + ((section && section.title) ? section.title : ''));
        }
      }
    } else if (el.name === 'ul' && el.children !== undefined && el.children.length > 1) {
      // potential wiki info

      let liElem = el.children[1].children

      // tcheck for context
      for (let i = 0; i < liElem.length - 1; i++) {
        let child = liElem[i]
        if (child.name === 'ul') {
          for (let j = 0; j < 2; j++) {
            // if there is a list inside a list, it's because of context (with potential link)
            let node = liElem[j]
            if (node.name === 'a') {
              context.title += node.attribs.title
              context.href = node.attribs.href
            }
            if (node.type === 'text') {
              context.title = node.data
            }
          }

          el = child
        } else {
          context = {title: ''}
        }
      }

      // here is a list of li with philosophes info
      el.children.forEach((liNode) => {
        if (liNode.name === 'li') {
          // philosophes line

          // get precise info
          let phil = {title: ''}
          phil.attribs = []

          if (h2Section) phil.attribs.push(h2Section)
          if (h3Section) phil.attribs.push(h3Section)
          if (h4Section) phil.attribs.push(h4Section)

          if (context.title !== '') phil.attribs.push(context)

          liNode.children.forEach((liContent, index) => {
            // the info we want for the philosophie are: text + link + don't care OR link + don't care

            if (!phil.href && liContent.name === 'a') {
              // if we start with the link, we have all the info
              phil.title += liContent.attribs.title
              phil.href = liContent.attribs.href
            }
            if (!phil.title && liContent.type === 'text') {
              // if we start with text, link will come next
              phil.title = liContent.data
            }
          })

          // get parse info

          let nodeText = wikiutils.liNodeToText(liNode)
          let bdInfo = wikiutils.philoBirthDateParser(nodeText)

          phil._raw = nodeText
          if (bdInfo.birth) phil.birth = bdInfo.birth
          if (bdInfo.death) phil.death = bdInfo.death

          // console.log(phil);

          data.list.push(phil)
        }
      })
    }
  })

  // TODO: place parsing outside the scraping
  data.length = data.list.length
  return data
}

wikiscrapper.scrapWikiTablePage = function (pageHtml) {
  // Prepare result
  const data = {}
  data.list = []

  const $ = cheerio.load(pageHtml)

  // get papes table or table title
  const elements = $('.mw-parser-output h3, caption, .wikitable')

  // Validate result before parsing
  if (elements.length === 0) {
    throw new Error('scrapWikiTablePage: Unable to find any data!')
  }

  let h3Context = ''
  let caption = ''

  // Loop on the elements
  elementsLoop: for (let idElement = 0; idElement < elements.length; idElement++) {
    const element = elements[idElement]

    if (element.name === 'h3') {
      if (element.children[0].children.length > 0) {
        h3Context = $(element.children[0]).text()
      } else {
        h3Context = $(element.children[1]).text()
      }
      continue elementsLoop
    }

    if ($(element).find('caption')) {
      caption = $(element).find('caption').text()
    }

    const rows = $(element).find('tr')

    let fiedsTagList = []
    // Loop on the rows
    rowloop: for (let idRow = 0; idRow < rows.length; idRow++) {
      const row = rows[idRow]

      if (idRow === 0) {
        const fieldsTag = $(row).find('th')

        // Loop on field tag
        for (let idField = 0; idField < fieldsTag.length; idField++) {
          let node = fieldsTag[idField]
          fiedsTagList[idField] = $(node).text()
        }

        continue rowloop
      }

      const fields = $(row).find('td')

      // if(fields.length !== fiedsTagList.length) continue elementsLoop;

      const pageData = {}

      // Loop on field
      for (let idField = 0; idField < fiedsTagList.length; idField++) {
        // we put an underscore for the raw data
        pageData[`_${fiedsTagList[idField]}`] = $(fields[idField]).text()
      }

      // We put attibs behind the fields
      pageData.attribs = []
      if (h3Context) pageData.attribs.push(h3Context)
      if (caption) pageData.attribs.push(caption)

      data.list.push(pageData)
    }

    caption = h3Context = ''
  }

  data.length = data.list.length
  return data
}

module.exports = wikiscrapper
