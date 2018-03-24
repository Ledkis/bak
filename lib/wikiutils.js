const wikiutils = {}

const philoBirthDateRX = /\((?:[^-\d]*)(-{0,1}[\d]+)(?:[^-\d]*(?: - )*[^-\d]*)(-{0,1}[\d]+)(?:(?:[^\d]*)|(?: .*))\)/

wikiutils.philoBirthDateParser = function (wikiLine) {
  // TODO: bug with non dead people

  let match = philoBirthDateRX.exec(wikiLine)

  let result = {}
  if (match) {
    result.birth = parseInt(match[1])
    result.death = parseInt(match[2])

    // e.g (1058-1111) gives 1058 -1111
    if (result.death < result.birth) result.death = Math.abs(result.death)
  }

  return result
}

wikiutils.liNodeToText = function (node) {
  let nodeText = ''
  node.children.forEach((el) => {
    if (el.type === 'text') nodeText += el.data
    if (el.type === 'tag') nodeText += el.attribs.title
  })

  return nodeText
}

module.exports = wikiutils
