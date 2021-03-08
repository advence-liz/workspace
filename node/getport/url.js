const getIPAddress = require('./ip')

const superagent = require('superagent')

module.exports = async () => {
  return await superagent
    .post('https://r.sankuai.com/api/proxy/url')
    .send({
      ip: getIPAddress(),
      port: 8000,
      vConsole: 'true'
    })
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .then(function(response) {
      const url = response.body.proxyUrl
      const res = {
        m: url.replace('sankuai', 'meituan'),
        s: url,
        d: url.replace('sankuai', 'dianping')
      }
      return res
    })
}
