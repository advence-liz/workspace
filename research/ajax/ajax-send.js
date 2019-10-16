import queryString from 'querystring'
function ajaxSend() {
  // http://stackoverflow.com/questions/3596583/javascript-detect-an-ajax-event

  const _open = XMLHttpRequest.prototype.open
  const _send = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.open = function(method, url) {
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

  XMLHttpRequest.prototype.send = function(body) {
    _send.apply(this, arguments)
    if (body) this.request.data = body
    console.log(this.request)
  }
}
ajaxSend()
