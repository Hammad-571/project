const apiKey = "123456"                                                       //api value
//check the api key is right or not 
function auth(req, res, next) {
    if (req.query.apikey != apiKey) {
      res.status(401)
      return res.json({ message: "Invalid API key" })
    }
    next()
}

module.exports = { auth }