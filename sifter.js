var https = require('https');
var APIKEY = 'b5c0c1aafc3a4db0d6aa55ed51731bd7'

this.processCommand = function processCommand(room, command){        
  console.log("Processing the command: " + command);

  // All sifter related things
  if (command === "/sifters" || command.match(/\/sifter\s+(\d+)/)) {

    // Set the headers
    var options = {
      host: 'fellowshiptech.sifterapp.com',
      path: '/api/projects/5348/issues?s=1-2',
      headers: {'X-Sifter-Token': APIKEY}
    };

    // If someone wants all the sifters, make a request against the Sifter API to get all the open issues
    if (command === "/sifters") {
      var issues = new Array();
      this.getAll(options, function(sifters){
        if (sifters.length === 0) {
            room.speak("Meow. There are no open sifters.");
        }
        else {
          for (var i = 0; i < sifters.length; i++) {
            issues.push(sifters[i]['number']);
          };
          room.speak("The following sifters are open: " + issues.join(", ") + ". Type /sifter <number> to see more info.");
        }
      });
    }

    // If someone wants a specific sifter, make a request against the Sifter API for all the issues and find that issue.
    if (command.match(/\/sifter\s+(\d+)/)) {

      // Get the number
      var sifterNumber = command.replace(/\/sifter\s+(\d+)/i, "$1");

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
  } // if block for sifters

  // All Change request things
  if (command === "/crs" || command.match(/\/cr\s+(\d+)/)) {
    // Set the headers
    var options = {
      host: 'fellowshiptech.sifterapp.com',
      path: '/api/projects/3624/issues?s=1-2',
      headers: {'X-Sifter-Token': APIKEY}
    };

    // If someone wants all the sifters, make a request against the Sifter API to get all the open change requests
    if (command === "/crs") {
      // Make a request against the Sifter API
      var changerequests = new Array();
      this.getAll(options, function(sifters){
        if (sifters.length === 0) {
          room.speak("Meow. There are no open change requests.");
        }
        else {
          for (var i = 0; i < sifters.length; i++) {
            changerequests.push(sifters[i]['number']);
          };
          room.speak("The following change requests are open: " + changerequests.join(", ") + ". Type /cr <number> to see more info.");
        }
      });
    }

    // If someone wants a specific change request, make a request against the Sifter API for all the issues and find that change request.
    if (command.match(/\/cr\s+(\d+)/)) {
      // Get the number
      var crNumber = command.replace(/\/cr\s+(\d+)/i, "$1");

      // Hold the data for the specific change request
      var cr = null;

      this.getAll(options, function(sifters){
        // Check and see if any sifters exist
        if (sifters.length === 0) {
          room.speak("Meow. There are no open change requests.");
        }
        else {
          // Sifters exist. Iterate through each one and figure out if the one requested exists
          for (var i = 0; i < sifters.length; i++) {
            // If it exists, let the room know.
            if (sifters[i]['number'].toString() === crNumber) {
              cr = sifters[i];
              room.speak("Sifter #" + cr['number'] + ": " + cr['subject']);
              room.speak("Assigned to: " + cr['assignee_name']);
              room.speak("State: " + cr['category_name']);
              break;
            }
          };
          // After iterating through it, if sifter is null then we never found it.  Let the room know.
          if (cr === null) {
            room.speak("Meow. I could not find that change request.");
          }
        }
      });
    }
  } // if block for change requests
} 

this.pollAPI = function(redisdb, callback) {
  console.log("Checking the Sifter API for new data.");

  var options = {
    host: 'fellowshiptech.sifterapp.com',
    path: '/api/projects/5348/issues?s=1-2',
    headers: {'X-Sifter-Token': APIKEY}
  };

  // Does the redis hash exist?
  redisdb.keys("open_issues", function(err, value){
    if (value.length >= 0) {
      // Redis hash exists.  Get all the sifters from Sifter's API
      https.get(options,function(res){
        res.on('data', function (chunk) {
          var data = JSON.parse(chunk);
          var issues = new Array();
          // Store all the issues that came back from the API (e.g. the up to date data) in an array
          for (var i = 0; i < data['issues'].length; i++) {
            issues.push(data['issues'][i]['number']);
          };
          // First see what fields in the hash don't match up the latest set issue numbers. Any fields in the hash but not in the list of issue numbers needs to be removed
          redisdb.hkeys("open_issues", function(err, keys){
            // For each key in the returned data, if it doesn't exist, remove it from the redis hash.
            for (var i = 0; i < keys.length; i++) {
              if (issues.indexOf(parseInt(keys[i])) === -1) {
                console.log(keys[i] + " has been removed from the collection of issues.");
                redisdb.hdel("open_issues", keys[i]);
              }
            };
            // Now that the redis hash is up to date, see which issues are not present in the redis DB
            redisdb.hkeys("open_issues", function(err, keys){
              for (var i = 0; i < issues.length; i++) {
                if (keys.indexOf(issues[i].toString()) === -1) {
                  console.log(issues[i] + " has been added as a new issue.");
                  redisdb.hset("open_issues", issues[i], data['issues'][i]['api_url']);
                  callback(data['issues'][i]);
                }
              };
            });
          });
         });
      });
    }
    else {
      // The redis hash doesn't exist exist.  Populate the hash
      https.get(options,function(res){
        res.on('data', function (chunk) {
          var data = JSON.parse(chunk);
          var issues = new Array();
          // Add all of the issues to a redis hash.  The key is the sifter number and the value is the API URL
          for (var i = 0; i < data['issues'].length; i++) {
            redisdb.hset("open_issues", data['issues'][i]['number'], data['issues'][i]['api_url']);
          };
        });
      });
    }
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
