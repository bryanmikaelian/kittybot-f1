var https = require('https');
var APIKEY = 'b5c0c1aafc3a4db0d6aa55ed51731bd7'
var sifterNumber;

this.processCommand = function processCommand(room, command){        
  console.log("Processing the command: " + command);
  var options;
  // Set everything up
  // Is someone looking for a sifter?
  if (command === "/sifters" || command.match(/\/sifter\s+(\d+)/)) {
    // Set the headers
    options = {
      host: 'fellowshiptech.sifterapp.com',
      path: '/api/projects/5348/issues?s=1-2',
      headers: {'X-Sifter-Token': APIKEY}
    };

    if (command.match(/\/sifter\s+(\d+)/)) {
      // Get the number
      sifterNumber = command.replace(/\/sifter\s+(\d+)/i, "$1");
    }
  }
  // Is someone looking for a change request?
  else if (command === "/crs" || command.match(/\/cr\s+(\d+)/))  {
     // Set the headers
     options = {
       host: 'fellowshiptech.sifterapp.com',
       path: '/api/projects/3624/issues?s=1-2',
       headers: {'X-Sifter-Token': APIKEY}
     };

    if (command.match(/\/cr\s+(\d+)/)){
      // Get the number
      sifterNumber = command.replace(/\/cr\s+(\d+)/i, "$1");
    }

  }
  // No idea what is going on
  else {
    console.log("Error processing command.");
  }

  // Process the command
  if (command === "/sifters" || command === "/crs") {
    var issues = new Array();
    this.getAll(options, function(sifters){
      if (sifters.length === 0) {
          room.speak("Meow. There are no open sifters.");
      }
      else {
        for (var i = 0; i < sifters.length; i++) {
          issues.push(sifters[i]['number']);
        };
        room.speak("The following sifters are open: " + issues.join(", ") + ". Type " + command + " <number> to see more info.");
      }
    });
  }

  if (command.match(/\/sifter\s+(\d+)/) || command.match(/\/cr\s+(\d+)/)) {
    // Hold the data for the specific sifter
    var sifter = null;

    this.getAll(options, function(sifters){
      // Check and see if any sifters exist
      if (sifters.length === 0) {
          room.speak("Meow. There are no open sifters.");
      }
      else {
        // Sifters exist. Iterate through each one and figure out if the one requested exists
        for (var i = 0; i < sifters.length; i++) {
          // If it exists, let the room know.
          if (sifters[i]['number'].toString() === sifterNumber) {
            sifter = sifters[i];
            room.speak("Sifter #" + sifter['number'] + ": " + sifter['subject']);
            room.speak("Assigned to: " + sifter['assignee_name']);
            room.speak("State: " + sifter['category_name']);
            break;
          }
        };
        // After iterating through it, if sifter is null then we never found it.  Let the room know.
        if (sifter === null) {
           room.speak("Meow. I could not find that sifter.");
        }
      }
    });
  }
}

this.pollAPI = function(redisdb, callback) {
  var options = {
    host: 'fellowshiptech.sifterapp.com',
    path: '/api/projects/5348/issues?s=1-2',
    headers: {'X-Sifter-Token': APIKEY}
  };

  //Get all the sifters from Sifter's API
  this.getAll(options, function(sifters) {
    // Store all the issues numbers that came back from the API (e.g. the up to date data) in an array
    var issueNumbers = new Array();
    for (var i = 0; i < sifters.length; i++) {
        issueNumbers.push(sifters[i]['number']);
    };
    // Does the redis hash exist?
    redisdb.keys("open_issues", function(err, value){
      if (value.length >= 0) {
        // Redis hash exists.
        // Get all the keys, e.g. numbers, from the redis hash
        redisdb.hkeys("open_issues", function(err, keys){
          // For each key in the hash, remove it from the hash if it is doesn't exist in the collection of issue numbers returned from the API
          for (var i = 0; i < keys.length; i++) {
            if (issueNumbers.indexOf(parseInt(keys[i])) === -1) {
              console.log(keys[i] + " has been removed from the collection of issues.");
              redisdb.hdel("open_issues", keys[i]);
            }
          };
        });
        // Now that the redis hash is up to date, see which issues are not present in the redis DB
        redisdb.hkeys("open_issues", function(err, keys){
          for (var i = 0; i < sifters.length; i++) {
            if (keys.indexOf(sifters[i]['number'].toString()) === -1) {
              console.log(sifters[i]['number'] + " has been added as a new issue.");
              redisdb.hset("open_issues", sifters[i]['number'], sifters[i]['api_url']);
              callback(sifters[i]);
            }
          };
        });
      }
      else {
      // The redis hash doesn't exist exist.  Populate the hash
      // Add all of the issues to a redis hash.  The key is the sifter number and the value is the API URL
        for (var i = 0; i < sifters.length; i++) {
          redisdb.hset("open_issues", sifters[i]['number'], sifters[i]['api_url']);
        };
      }
    });
  });
}

this.getAll = function(options, callback) {
  console.log("Making a request against the Sifter API");
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
      console.log("Sifter API request complete.  Response: " + res.statusCode);
    });
  });
}
