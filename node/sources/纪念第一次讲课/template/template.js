const fs=require("fs");
const path= require("path");
/**
 * 此处readFile&writeFile 没有使用相对路径，因为如果是相对路径，是相对于当前进程所在的路径（process.cmd()），而不是相对于当前脚本所在的路径。
 */
var fileName= path.resolve(__dirname,'_layout.html');
var distPath = path.resolve(__dirname,'index.html');
var template = fs.readFileSync(fileName, 'utf8');

template = template.toString().replace(/<jspath>/,`<script src="bundle.js"></script>`);

fs.writeFile(distPath,template,(err) => {
  if (err) throw err;
  console.log('It\'s saved!');
});