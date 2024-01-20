const zlib = require('zlib')
const input = `
{
    "id": "32",
    "status": 0,
    "endTime": "2023-12-15T08:56:46.000Z",
    "isGovCoupon": 0,
    "stageList": [
      {
     
        "startTime": "2023-12-15T18:36:11.000Z",
        "pageList": [
          {
            "hash": "6a120156/32/6a120156",
            "grayConfig": "{\"gray\":true,\"white\":false,\"grayRateStep\":[0,10,20,50,100],\"whiteList\":\"\",\"rate\":0,\"unSet\":true}",
          
          }
        ]
      }
    ]
  }`
zlib.deflate(input, (err, buffer) => {
    if (!err) {
        console.log(buffer.toString('base64'))
    }
})
