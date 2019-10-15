// http://stackoverflow.com/questions/3596583/javascript-detect-an-ajax-event

function ajaxSend(callback = () => {}) {
  var ajaxListener = new Object()
  ajaxListener.tempOpen = XMLHttpRequest.prototype.open
  ajaxListener.tempSend = XMLHttpRequest.prototype.send
  ajaxListener.callback = function() {
    // this.method :the ajax method used
    // this.url :the url of the requested script (including query string, if any) (urlencoded)
    // this.data :the data sent, if any ex: foo=bar&a=b (urlencoded)
    callback(this.method, this.url, this.data)
  }

  XMLHttpRequest.prototype.open = function(a, b) {
    if (!a) a = ''
    if (!b) b = ''
    console.count('ajax----open')
    ajaxListener.tempOpen.apply(this, arguments)
    ajaxListener.method = a
    ajaxListener.url = b
    if (a.toLowerCase() == 'get') {
      ajaxListener.data = b.split('?')
      ajaxListener.data = ajaxListener.data[1]
    }
  }

  XMLHttpRequest.prototype.send = function(a, b) {
    if (!a) a = ''
    if (!b) b = ''
    console.count('ajax----send')
    ajaxListener.tempSend.apply(this, arguments)
    if (ajaxListener.method.toLowerCase() == 'post') {
      ajaxListener.data = a
    }
    
    const { method, url, data } = ajaxListener
    console.log(method,url,data)
    this.request = { method, url, data }
    ajaxListener.callback()
  }
}

ajaxSend()

//https://www.jb51.net/article/91419.htm

function ajaxLoad(callback) {
  var oldXHR = window.XMLHttpRequest

  function newXHR() {
    var realXHR = new oldXHR()
    realXHR.tag = new Date().getTime()

    realXHR.addEventListener('load', function() {
      const { request, status, statusText, response } = this

      callback({ request, response: JSON.parse(response), status, statusText })
    })

    return realXHR
  }

  window.XMLHttpRequest = newXHR
}

window.__ajax = []

ajaxLoad(xhr => {
  const { request, response, status, statusText } = xhr
  const { code, data, message } = response
  window.__ajax.push(xhr)
  console.log(request.method, request.url, request.data)
  console.log(status, statusText, response)
})
