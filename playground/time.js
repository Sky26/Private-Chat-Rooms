// unix epic is a moment in history : Jan 1st 1970 00:00:00 am (stored in UTC, which means it's timezone independant)
// timestamp 0 = Jan 1st 1970 00:00:00 am
// Timestamp inside js are stored in ms
// Timestamp inside unix are stored in seconds
// new Date().getTime() will return the actual timestamp

const moment = require("moment");

var date = moment();
console.log(date.format()); // 2018-09-22T10:13:41-04:00
console.log(date.format("MMM")); // Sep
console.log(date.format("YYYY")); // 2018
console.log(date.format("MMM YYYY")); // Sep 2018
console.log(date.format("MMM Do, YYYY")); // Sep 22nd, 2018
console.log(date.format("h:mm a")); // 10:39 am
console.log(date.add(100, year).substract(9, "months"));

// moment with a provided timestamp
var createdAt = 1234;
var date = moment(createdAt);
console.log(date.format("h:mm a"));

// will return the same timestamp
new Date().getTime();
var someTimestamp = moment().valueOf();
