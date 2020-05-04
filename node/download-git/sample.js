const download = require('download-git-repo')

// download('github:advence-liz/index-creater/lib', 'test/lib', function(
//     err
// ) {
//     console.log(err ? 'Error' : 'Success')
// })

download(
    'direct:https://raw.githubusercontent.com/advence-liz/json-server-router/master/cli',
    'test/ex',
    function(err) {
        console.log(err ? 'Error' : 'Success')
    }
)
