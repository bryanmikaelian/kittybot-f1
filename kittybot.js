var http = require('http');
var client = require('ranger').createClient("activefaith", "7bda324c83352c4839ee47e6ff842ed759aaf54b");
var lol = require('./lib/LOLTranslate');
var sifter = require('./lib/sifter');
var kitty = require('./lib/kitty');
var session = require('./lib/session');
var roomNumber = 439862;
var catNipOn = false;
var sifterPollerOn = true;

console.log("Kittybot has been started");

http.createServer(function(req, res) {
  console.log("An HTTP request has been made.");
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("Meow\n");
}).listen(Number(process.env.PORT) || 8010);


var room = client.room(roomNumber, function(room) {
  // Begin session for this room
  session.init(room);

  // Enable/Disable the Sifter Polling module
  if (sifterPollerOn) {
    console.log("[Room " + room.name + "] Polling against the Sifter API is now enabled.");
    setInterval(function() { 
      sifter.pollAPI(function(issue) {
        speak(issue);
      });
    }, 60000);
  }
  else {
    console.log("[Room " + room.name + "]" + "Polling against the Sifter API is disabled.");
  }

  // Session has been established.  Start listening to the room
  room.listen(function(message) {

    // Track when people enter and leave the room.  Upadte session accordingly
    if ((message.type == "EnterMessage" || message.type == "LeaveMessage") && message.userId !== null) {
      client.user(message.userId, function (user) { 
        session.update(room, message.type, user);
      });
    }
    // If the message's userID is not null, that means someone said something.  If it is a command, process it.
    if (message.userId != null) {

      // If someone requested all the sifters, process the command
      if (message.body === "/sifters") {
        sifter.getAll(room, message.body, function(issues) {
          speak(issues);
        });
      }
      // If someone requested a specific sifter, process the command
      if (message.body.match(/\/sifter\s+(\d+)/)) {
        sifter.getSpecific(room, message.body, function(issue) {
          speak(issue);
        });
      }
    }
  });

  // Sync current users with session DB to keep the streaming API connection alive.  This happens every 10 minutes
  setInterval(function() {
    session.sync(room);
  }, 600000);

  // Leet speak module
  var speak = function(message){
    if(catNipOn){
        room.speak(lol.LOLTranslate(message));
    }
    else{
      room.speak(message);
    }
  }

});




