function urlParse(search) {
  const result = {}
  var searchParams = new URLSearchParams(search)

  searchParams.forEach(function(value, key) {
    result[key] = value
  })
  return result
}
function ajaxRequestHijack(xhr, callback) {
  // http://stackoverflow.com/questions/3596583/javascript-detect-an-ajax-event

  const _open = xhr.open
  const _send = xhr.send

  xhr.open = function(method, url) {
    console.count('open')
    // debugger
    _open.apply(xhr, arguments)
    let data = '{}' // 默认值当post参数为空时起效，为了形式上跟get一致
    if (method.toLowerCase() == 'get') {
      try {
        data = JSON.stringify(urlParse(url.split('?')[1]))
      } catch (error) {
        console.error(error)
      }
    }
    this.request = { method, url, data }
  }

  xhr.send = function(body) {
    // debugger
    _send.call(this, body)
    if (body) this.request.data = body
    // !callback && console.log('request:', this.request)
    callback && callback(this.request)
  }
}

//https://www.jb51.net/article/91419.htm

function ajaxResponseHijack(xhr, callback) {
  xhr.addEventListener('load', function() {
    const { status, statusText, response: _response, request } = this
    const response = JSON.parse(_response)
    // !callback && console.log('response:', { status, statusText, response })
    callback && callback({ request, status, statusText, response })
  })
}

function ajaxListener(callback) {
  const _XHR = window.XMLHttpRequest
  function WrapXHR() {
    const xhr = new _XHR()

    ajaxRequestHijack(xhr)
    ajaxResponseHijack(xhr, callback)
    return xhr
  }
  window.XMLHttpRequest = WrapXHR
}
ajaxListener(xhr => {
  const { request, response, status, statusText } = xhr
  const { code, data, message } = response
  const curList = JSON.parse(localStorage.getItem('__ajax')) || []
  curList.push(xhr)
  localStorage.setItem('__ajax', JSON.stringify(curList))
  console.log(request.method, request.url, request.data)
  console.log(status, statusText, response)
})
