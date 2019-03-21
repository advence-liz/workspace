var exec = require('child_process').exec

// 成功的例子
exec('sleep 2 && ls -al', function (error, stdout, stderr) {
  if (error) {
    console.error('error: ' + error)
    return
  }
  console.log('stdout: ' + stdout)
  console.log('stderr: ' + typeof stderr)
})
