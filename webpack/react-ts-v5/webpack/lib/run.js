const path = require('path');
const [, , type] = process.argv;

const run = require(path.resolve(
  process.cwd(),
  'webpack/build',
  `build.${type}.js`,
));

run({});
