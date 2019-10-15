import queryString from 'querystring'
function ajaxSend() {
  // http://stackoverflow.com/questions/3596583/javascript-detect-an-ajax-event

  const _open = XMLHttpRequest.prototype.open
  const _send = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.open = function(method, url) {
    _open.apply(this, arguments)
    let data = {}
    if (method.toLowerCase() == 'get') {
      data = queryString.parse(url.split('?')[1])
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
