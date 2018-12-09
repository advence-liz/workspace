"use strict";
const path =require("path");
const fs=require("fs");
const rr = fs.createReadStream(path.join(__dirname,'test','lower.txt'));

rr.on('readable', () => {
  let chunk;
  while (null !== (chunk = rr.read())) {
    console.log(`Received ${chunk.length} bytes of data.`);
  }
});
rr.on('end', () => {
  console.log('end');
});
// const readable = getReadableStreamSomehow();
// readable.on('readable', () => {
//   let chunk;
//   while (null !== (chunk = readable.read())) {
//     console.log(`Received ${chunk.length} bytes of data.`);
//   }
// });