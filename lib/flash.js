module.exports = function (request, response, next) {
  if (request.session.flash) {
    response.locals.flash = request.session.flash
    request.session.flash = undefined
  }

  request.flash = function (type, content) {
    // Objectif : stocker dans la session le message flash
    if (!request.session.flash) {
      request.session.flash = {}
    }
    request.session.flash[type] = content
  }
  next()
}
