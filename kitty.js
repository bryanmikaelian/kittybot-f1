var http = require('http');
var https = require('https');
var client = require('ranger').createClient("fellowshiptech", "7bda324c83352c4839ee47e6ff842ed759aaf54b");
var sifterC = require('./lib/sifter');

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis"), redisdb = redis.createClient(rtg.port, rtg.hostname);
  redisdb.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require('redis'), redisdb = redis.createClient();
}

var roomNumber = 439862;
var total_rimshots;

console.log("Starting Kittybot...");

http.createServer(function(req, res) {
  console.log("An HTTP request has been made.");
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("Meow\n");
}).listen(Number(process.env.PORT) || 8000);

client.room(roomNumber, function(room) {
  // Flush session when starting for the first time
  redisdb.del("connected_users");
  console.log("Set of connected users has been cleared");


  // Add all the current users to a redis hash to establish a "session" for the room 
  room.users(function (users) {
    for (var i = 0; i < users.length; i++) {
      redisdb.sadd("connected_users", users[i].name);
    }
    redisdb.sismember("connected_users", "Kittybot", function(err, value){
      if (value === 1) {
        console.log("Already in the room " + room.name);
      }
      else {
        console.log("Kittybot has joined the room " + room.name);
        room.join(); 
        room.speak("Meow.  I am here to serve.  Please type /help if you need assistance. kthxbye.");
        redisdb.sadd("connected_users", "Kittybot");
      }
    });
  });

  // Start listening for messages. Check every 2 seconds to see if we are listening.
  var listenInterval = setInterval(function() {
    if (!room.isListening()) {
      console.log("Listening to the room " + room.name);
      room.listen(function(message){ 

        // Session stuff
        if (message.type == "LeaveMessage") {
          client.user(message.userId, function (user) { 
            // When a user disconeccts. remove them from the redis set
            console.log(user.name + " has disconnected.");
            redisdb.srem("connected_users", user.name);
          });
        }

        if (message.type == "EnterMessage") {
          client.user(message.userId, function (user) { 
            // When a user connects. add them from the redis set
            console.log(user.name + " has connected.");
            redisdb.sadd("connected_users", user.name);
            room.speak("Meow. Hello " + user.name + ". Is it me you are looking for?");
            this.represent("bob");
          });
        }

        // Dismiss
        if (message.body === "/dismisskitty") {
          console.log("Kittybot has been requested to temporarily leave the room " + room.name);
          room.leave(); 
          setTimeout(function(){
            room.join();
          }, 5000);
        }

        // Nuke. WARNING THIS WILL REQUIRE A RESTART
        if (message.body === "/nukekitty") {
          client.user(message.userId, function(user) {
            if (user.name === "Bryan Mikaelian") {
              room.speak("NUCLEAR LAUNCH DETECTED. Kittybot destruction will now occur.");
              room.speak("Meow?");
              console.log("Kittybot has been marked for nuclear detonation in the room " + room.name);
              setTimeout(function() {
                room.leave();
                room.stopListening();
                clearInterval(listenInterval);
                console.log("Kittybot is no longer with us.");
                redisdb.srem("connected_users", "Kittybot");
              }, 5000);
            }
            else {
              room.speak("Not enough minerals.");
            }
          });
        }

        // Help
        if (message.body === "/help") {
          console.log("Someone requested help.");
          room.speak("Meow. I support the following commands: /dismisskitty, /meow, /purr, /jingyi, /rimshots, /sifters, /sifter <number>, /crs, /cr <number>, /catnip");
        }

        // Random cat noises
        if (message.body === "/meow") {
          console.log("Kittybot said meow.");
          room.speak("Meow!");
        }
        if (message.body === "/purr") {
          console.log("Kittybot purred.");
          room.speak("Purrrrrrr");
        }
        
        // Jingyi? 
        if (message.body === "/jingyi") {
          console.log("Kittybot told every to not be stupid.");
          room.speak("Don't be stupid!");
        }

        // catnip
        if(message.body === "/catnip"){
          console.log("Kittybot will take the next post and make it 1337 speak");
          room.speak("Can haz kittybot?  Yes, can haz. meowz.")
        }

        // Make sense?
        if (message.body != null) {
          if (message.body.length > 165) {
            console.log("Make sense?");
            room.speak("Make sense?");
          }
        }
        
        // Rimshot counter
        if (message.type === "SoundMessage" && message.body == "rimshot") {
          console.log("Someone played a rimshot");
          // Update redis
          redisdb.incr("total_rimshots");
          redisdb.get("total_rimshots", function(err, value) {
            total_rimshots = value;
            console.log("Redis has been updated.  The value for total_rimshots is " + total_rimshots);
          })
        }

        if (message.body === "/rimshots") {
          console.log("Someone requested the total rimshots");
          redisdb.get("total_rimshots", function(err, value) {
            room.speak("Meow. Total rimshots played: " + value);
          });
        }

        // Sifter
        if (message.body !== null) {
          sifterC.getSifter(true);
          sifterC.getSifter(false);
          var options = {
            host: 'fellowshiptech.sifterapp.com',
            path: '/api/projects/5348/issues?s=1-2',
            headers: {'X-Sifter-Token': 'b5c0c1aafc3a4db0d6aa55ed51731bd7'}
          };

          // Match on the /sifters command
          if (message.body === "/sifters") {
            console.log("Someone made a request to see all the sifters");

            // Make a request against the Sifter API
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

          // Match on the /sifter <number> command
          if (message.body.match(/\/sifter\s+(\d+)/)) {
            console.log("Someone made a request for a sifter");
            // Get the number
            var sifterNumber = message.body.replace(/\/sifter\s+(\d+)/i, "$1");

            // Hold the data for the specific sifter
            var sifter = null;

            //Make a request against the Sifter API
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
        } // Sifters Block

        // Change request
        if (message.body !== null) {
          var options = {
            host: 'fellowshiptech.sifterapp.com',
            path: '/api/projects/3624/issues?s=1-2',
            headers: {'X-Sifter-Token': 'b5c0c1aafc3a4db0d6aa55ed51731bd7'}
          };

          // Match on the /crs command
          if (message.body === "/crs") {
            console.log("Someone made a request to see all the change requests");

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
          if (message.body.match(/\/cr\s+(\d+)/)) {
            console.log("Someone made a request for a change request");
            // Get the number
            var sifterNumber = message.body.replace(/\/cr\s+(\d+)/i, "$1");

            // Hold the data for the specific sifter
            var sifter = null;

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
                    if (data['issues'][i]['number'].toString() === sifterNumber) {
                      sifter = data['issues'][i];
                    }
                  };

                  // If we found a sifter, let everyone know what that number is. Otherwise mention that it could not be found
                  if (sifter !== null) {
                    room.speak("Change Request #" + sifter['number'] + ": " + sifter['subject']);
                    room.speak("Assigned to: " + sifter['assignee_name']);
                    room.speak("State: " + sifter['category_name']);
                  }
                  else {
                    room.speak("Meow. I could not find that change request.");
                  }
                }
              });
            });
          }
        } // Change request block

      });
    }
  }, 2000);
});
