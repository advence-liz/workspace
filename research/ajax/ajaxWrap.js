function ajaxLoad(callback) {
  var oldXHR = window.XMLHttpRequest

  function newXHR() {
    var realXHR = new oldXHR()
    var open = realXHR.open
    realXHR.open = function(a, b) {
      if (!a) a = ''
      if (!b) b = ''
      open.apply(realXHR, arguments)
      let method = a
      let url = b
      let data = {}
      if (a.toLowerCase() == 'get') {
        data = b.split('?')
        data = data[1]
      }
      this.request = { method, url, data }
      console.log(method, url, data)
    }

    realXHR.addEventListener('load', function() {
      const { request, status, statusText, response } = this

      callback({
        request,
        response: JSON.parse(response),
        status,
        statusText
      })
    })

    return realXHR
  }

  window.XMLHttpRequest = newXHR
}

ajaxLoad(xhr => {
  const { request, response, status, statusText } = xhr
  const { code, data, message } = response
  const curList = JSON.parse(localStorage.getItem('__ajax')) || []
  curList.push(xhr)
  localStorage.setItem('__ajax', JSON.stringify(curList))
  console.log(request.method, request.url, request.data)
  console.log(status, statusText, response)
})
