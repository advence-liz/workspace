const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
// https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/blob/master/examples/livertmp2hls.js
// make sure you set the correct path to your video file
const sourcePath = path.join(__dirname, 'dist', 'm.mp4')
const outputPath = path.resolve(__dirname, 'dist', 't', 'vs.m3u8')

var proc = ffmpeg(sourcePath, { timeout: 432000 })
  // set video bitrate
  .videoBitrate(1024)
  // set h264 preset
  // .addOption('preset', 'superfast')
  // set target codec
  .videoCodec('libx264')
  // set audio bitrate
  // .audioBitrate('128k')
  // set audio codec
  // .audioCodec('libfaac')
  // set number of audio channels
  .audioChannels(2)
  // set hls segments time
  .addOption('-hls_time', 10)
  // include all the segments in the list
  .addOption('-hls_list_size', 0)
  .on('progress', function(progress) {
    console.log('f ' + progress.percent + '%')
  })
  // setup event handlers
  .on('end', function() {
    console.log('file has been converted succesfully')
    process.exit(1)
  })
  .on('error', function(err) {
    console.log('an error happened: ' + err.message)
  })
  // save to file
  .save(outputPath)
