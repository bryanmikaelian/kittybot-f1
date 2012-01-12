var https = require('https');
var APIKEY = ''
var sifterNumber;
var room_prefex;

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis"), redisdb = redis.createClient(rtg.port, rtg.hostname);
  redisdb.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require('redis'), redisdb = redis.createClient();
}


this.getAll = function(room, command, callback) {
  room_prefex = "[Room " + room.name + "]";
  console.log(room_prefex + " Request was made for all the open sifter tickets.");
  redisdb.hkeys("open_sifters", function(err, keys){
    console.log(room_prefex + " Processing command 'HKEYS open_sifters'");
    // If no keys exist, specify that there are no open sifters.
    if (keys.length === 0) {
      callback("Meow.  There are no open Sifter Tickets.");
    }
    // There is at least one sifter open
    else {
      callback("The following sifters are open: " + keys.join(", ") + ". Type /sifter " + " <number> to see more info.");
    }
  });
}

this.getSpecific = function(room, command, callback) {
  room_prefex = "[Room " + room.name + "]";

  // Get the sifter number
  sifterNumber = command.replace(/\/sifter\s+(\d+)/i, "$1");
  console.log(room_prefex + " Request was made for sifter #" + sifterNumber);

  // Attempt to get that value from the redis hash
  redisdb.hget("open_sifters", sifterNumber, function(err, value){
    console.log(room_prefex + " Processing command 'HGET open_sifters " + sifterNumber + "'");
    // If there is no value, specify that the sifter could now be found.
    if (value === null) {
      callback("Meow.  I cannot find that sifter.");
    }
    // We found the sifter.  Yay.
    else {
      callback("Sifter #" + sifterNumber + ": " +value);
    }
  });
}


this.pollAPI = function(callback) {
  var options = {
    host: 'fellowshiptech.sifterapp.com',
    path: '/api/projects/5348/issues?s=1-2',
    headers: {'X-Sifter-Token': APIKEY}
  };

  //Get all the sifters from Sifter's API
  this.getAllFromAPI(options, function(sifters) {
    console.log("[Sifter Poller] Polling the Sifter API for new issues");

    // Store all the issues numbers that came back from the API (e.g. the up to date data) in an array
    var issues = new Array();
    for (var i = 0; i < sifters.length; i++) {
        issues.push(sifters[i]['number']);
    };

    // Get all the keys, e.g. numbers, from the redis hash
    redisdb.hkeys("open_sifters", function(err, keys){
      // For each key in the hash, remove it from the hash if it is doesn't exist in the collection of issue numbers returned from the API
      for (var i = 0; i < keys.length; i++) {
        if (issues.indexOf(parseInt(keys[i])) === -1) {
          console.log("[Sifter Poller] " + keys[i] + " has been removed from the collection of issues.");
          redisdb.hdel("open_sifters", keys[i]);
        }
      }

      // Now that the redis hash has all closed issues removed, see which open issues are not present in the redis DB
      for (var i = 0; i < sifters.length; i++) {
        // If the redis hash doesn't have that issue, it is newely opened. Add that issue to the hash and notify the chat room via a callback
        if (keys.indexOf(sifters[i]['number'].toString()) === -1) {
          console.log("[Sifter Poller] " + sifters[i]['number'] + " has been added as a new issue.");
          redisdb.hset("open_sifters", sifters[i]['number'], sifters[i]['subject']);
          callback("Sifter #" + sifters[i]['number'] + ": " + sifters[i]['subject'] + " has just been opened by " + sifters[i]['opener_name']);
        }
      }
    });
  });
}

this.getAllFromAPI = function(options, callback) {
  // Hold all the open sifters
  var openSifters = new Array(); 
  // Get all the issues
  https.get(options, function(res){
    res.on('data', function (chunk) { 
      var issues = JSON.parse(chunk);
      for (var i = 0; i < issues['issues'].length; i++) {
        openSifters.push(issues['issues'][i]);
      };
      callback(openSifters);
    });
  });
}
