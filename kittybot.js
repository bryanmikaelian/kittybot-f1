var http = require('http');
var client = require('ranger').createClient("activefaith", "7bda324c83352c4839ee47e6ff842ed759aaf54b");
var lol = require('./lib/LOLTranslate');
var sifter = require('./lib/sifter');
var kitty = require('./lib/kitty');
var session = require('./lib/session');
var roomNumber = 439862;
var counts = require('./lib/counts');
// var leet = require('./lib/leet');
var sifterPollerOn = true;
var catNipOn = false;

console.log("Starting Kittybot...");

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
        speak(room, issue);
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
    if (message.userId != null && message.body != null) {

      // General Commands module
      kitty.processCommand(room, message.body, function(response){
        speak(room, response);
      });

      // SoundMessage counts module
      if (message.type === "SoundMessage") {
        counts.update(message.body);
      }

      /o If someone requested all the sifters, process the command
      if (message.body === "/sifters") {
        sifter.getAll(room, message.body, function(issues) {
          speak(room, issues);
        });
      }

      // If someone requested a specific sifter, process the command
      if (message.body.match(/\/sifter\s+(\d+)/)) {
        sifter.getSpecific(room, message.body, function(issue) {
          speak(room, issue);
        });
      }

      //  Catnip module
      // if (message.body.match(/\/catnip\s+(on)/)) {
      //   console.log("Kittybot is nommin some catnip");
      //   leet.configureLeetSpeak(true);
      // }
      // if (message.body.match(/\/catnip\s+(off)/)) {
      //   console.log("Kittybot has stopped nommin the catnip");
      //   leet.configureLeetSpeak(false);
      // }
    }
  });

  // Sync current users with session DB to keep the streaming API connection alive.  This happens every 10 minutes
  setInterval(function() {
    session.sync(room);
  }, 600000);


  this.speak = function(room, message){
    if(catNipOn){
        room.speak(lol.LOLTranslate(message));
    }
    else{
      room.speak(message);
    }
  }
});


// Heroku is dumb. Ping the app every 10 minutes to make sure kittybot doesn't die.
setInterval(function() {
  var options = {
    host: "kittybot.herokuapp.com",
    path: "/"
  };
  console.log("Pinging kittybot.herokuapp.com");
  http.get(options, function(res){
    res.on('data', function (chunk) {
    });
  });
},600000); 

