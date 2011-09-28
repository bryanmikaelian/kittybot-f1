var http = require('http');
var https = require('https');
var client = require('ranger').createClient("fellowshiptech", "7bda324c83352c4839ee47e6ff842ed759aaf54b");
var rimshotCount = 0;

console.log('Meow. Is it is me you are looking for?');
console.log('Kittybot is alive and ready to serve.  Standing by.');

http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("Meow\n");
}).listen(Number(process.env.PORT) || 8000);



client.room(439862, function(room) {
  // Figure out if we need to join the room
  var kittyInRoom = false;
  room.users(function (users) {
    for (var i = 0; i < users.length; i++) {
      if(users[i].name === "Kitty Bot") {
        console.log("Kittybot is already in the room " + room.name);
        kittyInRoom = true;
      }
    }
    // If kitty is not in the room, join it
    if (!kittyInRoom) {
      console.log("Kittybot is joining room " + room.name);
      room.join();
    }
  });

  // Listen to the room
  room.listen(function(message)  {
    if (message.body === "/kitty") {
      room.speak("Hello.  Is it me you are looking for?");
      console.log("Kittybot responded to the command /kitty");
    }

    // Hello, user
    if (message.type === "EnterMessage") {
      client.user(message.userId, function(user) {
        if (user.name === "Kitty Bot") {
          room.speak("Meow.");
        }
        else {
          console.log(user.name + " connected.");
          room.speak("Well, how nice of you to join us " + user.name);
        }
      });
    }

    // Jenkins queue
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

    // Kill kitty
   if (message.body === "/killkitty") {
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

    // Sifters - Fellowship One Project
    if (message.body === "/sifters f1") {
        var options = {
        host: 'fellowshiptech.sifterapp.com',
        path: '/api/projects/5348/issues?s=1-2',
        headers: {'X-Sifter-Token': 'b5c0c1aafc3a4db0d6aa55ed51731bd7'}
      };

      https.get(options,function(res){
        res.on('data', function (chunk) {
          var data = JSON.parse(chunk);
          var issues = new Array();
          if (data['issues'].length === 0) {
            room.speak("There are currently no open issues for the Fellowship One project.");
          }
          else {
            for (var i = 0; i < data['issues'].length; i++) {
              issues.push(data['issues'][i]['number']);
            };
            room.speak("The current open sifters for the Fellowship One project are: " + issues.toString());
          }
        });
      });
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
});

