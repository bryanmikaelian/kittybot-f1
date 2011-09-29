var http = require('http');
var https = require('https');
var client = require('ranger').createClient("fellowshiptech", "7bda324c83352c4839ee47e6ff842ed759aaf54b");
var redis = require('redis'), redisdb = redis.createClient(process.env.REDISTOGO_URL);
var roomNumber = 439862;
var joinRooms = true;
var kittyInRoom = false;

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
          room.speak("Meow. I support the following commands: /dismisskitty, /meow, /purr, /jingyi");
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
      });
    }
  }, 8000);
});

/*
  // Listen to the room
  setInterval(function(){
    if (!room.isListening()) {
        room.listen(function(message)  {
        if (message.body === "/kitty") {
          room.speak("Meow.");
          console.log("Kittybot responded to the command /kitty");
        }

        // Hello, user
        if (message.type === "EnterMessage") {
          client.user(message.userId, function(user) {
            if (user.name === "Kitty Bot") {
              room.speak("Meow?");
            }
            else {
              console.log(user.name + " connected.");
              room.speak("Well, how nice of you to join us " + user.name);
            }
          });
        }

        // Kill kitty       if (message.body === "/killkitty") {
         client.user(message.userId, function(user) {
            if (user.name === "Bryan Mikaelian") {
              console.log("Kitty termination has been requested and will be completed.");
              room.speak("KITTYBOT HAS BEEN MARKED FOR DEATH AND WILL RETURN SHORTLY.  MAKE SENSE?");
              setTimeout(function(){
                room.leave();
                console.log("Kittybot is leaving room " + room.name);
              }, 5000);

              setTimeout(function(){
                room.join();
              }, 10000);

            }
            else {
              room.speak("@" + user.name + " Lolz...y u try 2 do dat?");
            }
          });
        };

        // Jenkins
        if (message.body === "/jenkinsq") {
          var options = {
            host: 'hudson.dev.corp.local',
            port: 8080,
            path: '/queue/api/json'
          };
          http.get(options,function(res){
            res.on('data', function (chunk) {
              var data = JSON.parse(chunk);
              if (data['items'].length === 0) {
                room.speak("There are currently no jobs in the Jenkins queue.");
              }
              else {
                room.speak("Number of jobs in Jenkins queue:  " + data['items'].length);
              }
            });
          });
          console.log("Kittybot responded to the command /jenkinsq");
        }

        // Sifter
        switch(message.body) {
          case '/sifters f1':
            var options = {
              host: 'fellowshiptech.sifterapp.com',
              path: '/api/projects/5348/issues?s=1-2',
              headers: {'X-Sifter-Token': 'b5c0c1aafc3a4db0d6aa55ed51731bd7'}
            };
            console.log("Somone made a request for information from Sifter.");
            https.get(options,function(res){
              res.on('data', function (chunk) {
                var data = JSON.parse(chunk);
                var issues = new Array();
                if (data['issues'].length === 0) {
                  room.speak("There are currently no open issues for the Fellowship One project.");
                }
                else {
                  for (var i = 0; i < data['issues'].length; i++) {
                    issues.push("Sifter #" + data['issues'][i]['number']);
                  };
                  room.speak("Total issues for the Fellowship One project: " + issues.length);
                  room.speak("The open issues are: " + issues.join(", "));
                }
                });
              });
              break;

          case '/sifters cm':
            var options = {
              host: 'fellowshiptech.sifterapp.com',
              path: '/api/projects/3624/issues?s=1-2',
              headers: {'X-Sifter-Token': 'b5c0c1aafc3a4db0d6aa55ed51731bd7'}
            };
            console.log("Somone made a request for information from Sifter.");
            https.get(options,function(res){
              res.on('data', function (chunk) {
                var data = JSON.parse(chunk);
                var issues = new Array();
                if (data['issues'].length === 0) {
                  room.speak("There are currently no open change requests.");
                }
                else {
                  for (var i = 0; i < data['issues'].length; i++) {
                    issues.push("Sifter #" + data['issues'][i]['number']);
                  };
                  room.speak("Total change requests open: " + issues.length);
                  room.speak("The current open change requests are: " + issues.join(", "));
                }
              });
            });
            break;
        }

        // That's what she said, Matthew
        if (message.type === "TextMessage") {
          client.user(message.userId, function(user) {
            if (user.name === "Matthew Sneeden") {
              room.speak("That's what she said.");
            }
          });
        }
      });
    }
  }, 10000);
  */

