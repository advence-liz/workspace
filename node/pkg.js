const fs = require('fs-extra')
const pkg = require('./package.json')

fs.writeFileSync('package1.json', JSON.stringify(pkg, null, 2))
