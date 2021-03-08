const { spawnSync } = require('child_process')

const getPort = (port = 3000) => {
  let isPortSelected = false
  while (!isPortSelected) {
    if (spawnSync('lsof', [`-i:${port}`]).stdout.toString()) {
      port++
    } else {
      isPortSelected = true
    }
  }
  return port
}

var r = getPort(3000)

var r1 = getPort(9001)

var c = 1
