function ajaxLoad(callback) {
  var oldXHR = window.XMLHttpRequest
  
  function newXHR() {
    var realXHR = new oldXHR()
    // var open  = realXHR.open
    // realXHR.open= function(a,b){
    //   if (!a) a = ''
    //   if (!b) b = ''
    //   console.count('ajax----open')
    //   open.apply(realXHR, arguments)
    //   let  method = a
    //   let   url = b
    //   let data ={}
    //   if (a.toLowerCase() == 'get') {
    //     data = b.split('?')
    //     data = data[1]
    //   }
    //   console.log(method,url,data)
    // }
  
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