function loadScript (
  source = 'https://cdn.bootcss.com/gremlins.js/0.1.0/gremlins.min.js',
  callback
) {
  var head = document.getElementsByTagName('head')[0]
  var scripts = head.getElementsByTagName('script')
  var found = false
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src === source) {
      found = true
      break
    }
  }
  if (!found) {
    var script = document.createElement('script')
    script.type = 'text/javascript'
    if (script.readyState) {
      // IE
      script.onreadystatechange = function () {
        if (
          script.readyState === 'loaded' ||
          script.readyState === 'complete'
        ) {
          script.onreadystatechange = null
          callback()
        }
      }
    } else {
      // Others
      script.onload = callback
    }
    script.src = source
    head.appendChild(script)
  }
}
function unleashGremlins (ttl, callback) {
  // function stop () {
  //   horde.stop()
  //   callback()
  // }
  // var horde = window.gremlins.createHorde()
  // horde.seed(1234)
  // horde.after(callback)
  // window.onbeforeunload = stop
  // setTimeout(stop, ttl)
  // horde.unleash()
}

loadScript('https://cdn.bootcss.com/gremlins.js/0.1.0/gremlins.min.js', () => {
  unleashGremlins(10000)
})
