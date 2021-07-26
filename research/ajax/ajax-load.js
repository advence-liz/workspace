//https://www.jb51.net/article/91419.htm

function ajaxLoad(callback) {
  var oldXHR = window.XMLHttpRequest

  function newXHR() {
    var realXHR = new oldXHR()
    console.count('new XHR')
    realXHR.open
    realXHR.addEventListener('load', function() {
      const { responseURL, status, statusText, response } = this
      console.log({ responseURL, status, statusText, response })
      callback({ responseURL, status, statusText, response })
    })

    return realXHR
  }

  window.XMLHttpRequest = newXHR
}
var __ajax = { info: [], error: [] }
window.__ajax = __ajax

ajaxLoad(xhr => {
  //   console.log('info',JSON.stringify(xhr) )
})
