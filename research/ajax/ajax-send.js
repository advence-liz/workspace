function ajaxSend(callback) {
  // http://stackoverflow.com/questions/3596583/javascript-detect-an-ajax-event
  if (!callback) {
    return
  }
  
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
    ajaxListener.tempSend.apply(this, arguments)
    if (ajaxListener.method.toLowerCase() == 'post') {
      ajaxListener.data = a
    }
    ajaxListener.callback()
  }
}
  
ajaxSend((method, url, data) => {
  console.log('listener:', method, url, data)
})
  