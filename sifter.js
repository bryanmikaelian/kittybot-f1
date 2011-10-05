var https = require('https');
var APIKEY = 'b5c0c1aafc3a4db0d6aa55ed51731bd7'
this.processCommand = processCommand;
function processCommand(room, command){        
  var options;
  console.log("Processing the command: " + command);

  // All sifter related things
  if (command === "/sifters" || command.match(/\/sifter\s+(\d+)/)) {

    // Set the headers
    options = {
      host: 'fellowshiptech.sifterapp.com',
      path: '/api/projects/5348/issues?s=1-2',
      headers: {'X-Sifter-Token': APIKEY}
    };

    // If someone wants all the sifters, make a request against the Sifter API to get all the open issues
    if (command === "/sifters") {

      https.get(options,function(res){
        res.on('data', function (chunk) {
          var data = JSON.parse(chunk);
          var issues = new Array();
          // If no iissues come back, let everyone know.
          if (data['issues'].length === 0) {
            room.speak("Meow. There are no open sifters.");
          }
          else {
            for (var i = 0; i < data['issues'].length; i++) {
              issues.push(data['issues'][i]['number']);
            };
          }
          room.speak("The following sifters are open: " + issues.join(", ") + ". Type /sifter <number> to see more info.");
        });
      });
    }

    // If someone wants a specific sifter, make a request against the Sifter API for all the issues and find that issue.
    if (command.match(/\/sifter\s+(\d+)/)) {

      // Get the number
      var sifterNumber = command.replace(/\/sifter\s+(\d+)/i, "$1");

      // Hold the data for the specific sifter
      var sifter = null;

      // Make a request against the Sifter API to get that issue
      https.get(options,function(res){
        res.on('data', function (chunk) {
          var data = JSON.parse(chunk);
          var issues = new Array();
          // If no iissues come back, let everyone know.
          if (data['issues'].length === 0) {
            room.speak("Meow. There are no open sifters.");
          }
          else {
            // Look at each issue.  If its number is the one requested, store it in the sifter variable.
            for (var i = 0; i < data['issues'].length; i++) {
              if (data['issues'][i]['number'].toString() === sifterNumber) {
                sifter = data['issues'][i];
                break;
              }
            };

            // If we found a sifter, let everyone know what that number is. Otherwise mention that it could not be found
            if (sifter !== null) {
              room.speak("Sifter #" + sifter['number'] + ": " + sifter['subject']);
              room.speak("Current status: " + sifter['status']);
            }
            else {
              room.speak("Meow. I could not find that sifter.");
            }
          }
        });
      });
    }
  } // if block for sifters

  // All Change request things
  if (command === "/crs" || command.match(/\/cr\s+(\d+)/)) {
    // Set the headers
    options = {
      host: 'fellowshiptech.sifterapp.com',
      path: '/api/projects/3624/issues?s=1-2',
      headers: {'X-Sifter-Token': APIKEY}
    };

    if (command === "/crs") {
      // Make a request against the Sifter API
      https.get(options,function(res){
        res.on('data', function (chunk) {
          var data = JSON.parse(chunk);
          var changerequests = new Array();
          // If no iissues come back, let everyone know.
          if (data['issues'].length === 0) {
            room.speak("Meow. There are no open change requests.");
          }
          else {
            for (var i = 0; i < data['issues'].length; i++) {
              changerequests.push(data['issues'][i]['number']);
            };
          }
          room.speak("The following change requests are open: " + changerequests.join(", ") + ". Type /cr <number> to see more info.");
        });
      });
    }
    // Match on the /cr <number> command
    if (command.match(/\/cr\s+(\d+)/)) {
      // Get the number
      var crNumber = command.replace(/\/cr\s+(\d+)/i, "$1");

      // Hold the data for the specific change request
      var cr = null;

      //Make a request against the Sifter API
      https.get(options,function(res){
        res.on('data', function (chunk) {
          var data = JSON.parse(chunk);
          var issues = new Array();
          // If no iissues come back, let everyone know.
          if (data['issues'].length === 0) {
            room.speak("Meow. There are no open change requests.");
          }
          else {
            // Look at each issue.  If its number is the one requested, store it in the sifter variable.
            for (var i = 0; i < data['issues'].length; i++) {
              if (data['issues'][i]['number'].toString() === crNumber) {
                cr = data['issues'][i];
              }
            };

            // If we found a sifter, let everyone know what that number is. Otherwise mention that it could not be found
            if (cr !== null) {
              room.speak("Change Request #" + cr['number'] + ": " + cr['subject']);
              room.speak("Assigned to: " + cr['assignee_name']);
              room.speak("State: " + cr['category_name']);
            }
            else {
              room.speak("Meow. I could not find that change request.");
            }
          }
        });
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

this.getAll = function(callback) {
  console.log("Getting all the issues from sifter");
  // Hold all the open sifters
  var openSifters = new Array();
  var options = {
      host: 'fellowshiptech.sifterapp.com',
      path: '/api/projects/5348/issues?s=1-2',
      headers: {'X-Sifter-Token': APIKEY }
  }; 

  // For each project, get all the issues
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
