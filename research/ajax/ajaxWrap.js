import queryString from 'querystring'
function ajaxSend(xhr) {
  // http://stackoverflow.com/questions/3596583/javascript-detect-an-ajax-event

  const _open = xhr.open
  const _send = xhr.send

  xhr.open = function(method, url) {
    _open.apply(this, arguments)
    let data = '{}' // 默认值当post参数为空时起效，为了形式上跟get一致
    if (method.toLowerCase() == 'get') {
      try {
        data = JSON.stringify(queryString.parse(url.split('?')[1]))
      } catch (error) {
        console.error(error)
      }
    }
    this.request = { method, url, data }
  }

  xhr.send = function(body) {
    _send.apply(this, arguments)
    if (body) this.request.data = body
    // console.log(this.request)
  }
}
// ajaxSend(XMLHttpRequest.prototype)

//https://www.jb51.net/article/91419.htm

function ajaxLoad(callback) {
  var oldXHR = window.XMLHttpRequest

  function WrapXHR() {
    var realXHR = new oldXHR()
    ajaxSend(realXHR)
    realXHR.addEventListener('load', function() {
      const {
        responseURL,
        status,
        statusText,
        response: _response,
        request
      } = this

      const response = JSON.parse(_response)

      console.log({ request, responseURL, status, statusText, response })
      callback({ responseURL, status, statusText, response })
    })

    return realXHR
  }

  window.XMLHttpRequest = WrapXHR
}
var __ajax = { info: [], error: [] }
window.__ajax = __ajax

ajaxLoad(xhr => {
  //   console.log('info',JSON.stringify(xhr) )
})
