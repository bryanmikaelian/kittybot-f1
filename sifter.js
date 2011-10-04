var https = require('https');

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
      headers: {'X-Sifter-Token': 'b5c0c1aafc3a4db0d6aa55ed51731bd7'}
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
      headers: {'X-Sifter-Token': 'b5c0c1aafc3a4db0d6aa55ed51731bd7'}
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
