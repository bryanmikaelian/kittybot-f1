var http = require('http');
var https = require('https');
var client = require('ranger').createClient("fellowshiptech", "7bda324c83352c4839ee47e6ff842ed759aaf54b");

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require('redis'), redisdb = redis.createClient();
}

var roomNumber = 373588;
var joinRooms = true;
var kittyInRoom = false;
var total_rimshots;


console.log("Starting Kittybot...");

http.createServer(function(req, res) {
  console.log("An HTTP request has been made.");
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("Meow\n");
}).listen(Number(process.env.PORT) || 8000);

client.room(roomNumber, function(room) {

  // Join the room, if we allow it and kittybot is not in the room
  if (joinRooms && !kittyInRoom) {
    var joinInterval = setInterval(function(){ 
      if (!kittyInRoom) {
        console.log("Attempting to join the room " + room.name);
        room.users(function (users) {
          for (var i = 0; i < users.length; i++) {
            if(users[i].name === "Kittybot") {
              kittyInRoom = true;
              console.log("Already in the room " + room.name);
            }
          }

          // If kitty is not in the room, join it
          if (!kittyInRoom) {
            console.log("Kittybot has joined the room " + room.name);
            room.join(); 
            room.speak("Meow.  I am here to serve.  Please type /help if you need assistance. kthxbye.");
            kittyInRoom = true;
          }
        });
      }
    }, 5000);
  }

  // Start listening for messages. Check every 5 seconds to see if we are listening.
  var listenInterval = setInterval(function() {
    if (!room.isListening()) {
      console.log("Listening to the room " + room.name);
      room.listen(function(message){ 

        // Dismiss
        if (message.body === "/dismisskitty") {
          console.log("Kittybot has been requested to temporarily leave the room " + room.name);
          room.leave();
          console.log("Kittybot is no longer in the room " + room.name);
          kittyInRoom = false;
        }

        // Nuke. WARNING THIS WILL REQUIRE A RESTART
        if (message.body === "/nukekitty") {
          room.speak("NUCLEAR LAUNCH DETECTED. Kittybot destruction will now occur.");
          room.speak("Meow?");
          console.log("Kittybot has been marked for nuclear detonation in the room " + room.name);
          setTimeout(function() {
            room.leave();
            room.stopListening();
            clearInterval(listenInterval);
            clearInterval(joinInterval);
            console.log("Kittybot is no longer with us.");
          }, 5000);
        }

        // Help
        if (message.body === "/help") {
          console.log("Someone requested help.");
          room.speak("Meow. I support the following commands: /dismisskitty, /meow, /purr, /jingyi, /rimshots, /sifter <number>");
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

        // Make sense?
        if (message.body != null) {
          if (message.body.length > 150) {
            console.log("Make sense?");
            room.speak("Make sense?");
          }
        }

        // Hello user
        if (message.type === "EnterMessage") {
          client.user(message.userId, function(user) {
            if (user.name !== "Kittybot") {
              console.log(user.name + " connected.");
              room.speak("Meow. Hello " + user.name + ". Is it me you are looking for?");
            }
          });
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
          if (total_rimshots === undefined ) {
            room.speak("No rimshots have been played. Get on it Matthew.");
          }
          else {
            room.speak("Meow. Total rimshots played: " + total_rimshots);
          }
        }

        // Sifter
        if (message.body !== null) {
          // Match on the /sifter <number> command
          if (message.body.match(/\/sifter\s+(\d+)/)) {
            console.log("Someone made a request for a sifter");
            // Get the number
            var sifterNumber = message.body.replace(/\/sifter\s+(\d+)/i, "$1");

            // Make a request against the Sifter API
            var options = {
              host: 'fellowshiptech.sifterapp.com',
              path: '/api/projects/5348/issues?s=1-2',
              headers: {'X-Sifter-Token': 'b5c0c1aafc3a4db0d6aa55ed51731bd7'}
            };

            var sifter = null;

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
        }

      });
    }
  }, 8000);
});
