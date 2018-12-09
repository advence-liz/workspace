"use strict";
const schedule = require('node-schedule');
var j = schedule.scheduleJob('*/1 * * * *', function(){
    console.log('Today is recognized by Rebecca Black!');
  });
  