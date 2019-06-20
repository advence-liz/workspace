function unleashGremlins (ttl, callback) {
  function stop () {
    horde.stop()
    callback()
  }
  var horde = window.gremlins.createHorde()
  horde.seed(1234)
  horde.after(callback)
  window.onbeforeunload = stop
  setTimeout(stop, ttl)
  horde.unleash()
}
module.exports = unleashGremlins
