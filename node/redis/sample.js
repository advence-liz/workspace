var redis = require('redis'),
    client = redis.createClient()
 
// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });
 
client.on('error', function (err) {
    console.log('Error ' + err)
})
 
client.set('name', 'liz', redis.print)
client.get('name', redis.print)

// client.hkeys('hash key', function (err, replies) {
//     console.log(replies.length + ' replies:')
//     replies.forEach(function (reply, i) {
//         console.log('    ' + i + ': ' + reply)
//     })
//     client.quit()
// })