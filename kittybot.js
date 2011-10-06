var http = require('http');
var client = require('ranger').createClient("fellowshiptech", "7bda324c83352c4839ee47e6ff842ed759aaf54b");
var lol = require('./LOLTranslate');
var sifter = require('./sifter');
var kitty = require('./kitty');
var session = require('./session');
<<<<<<< HEAD

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis"), redisdb = redis.createClient(rtg.port, rtg.hostname);
  redisdb.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require('redis'), redisdb = redis.createClient();
}

var roomNumber = 373588;
=======
var counts = require('./counts');
var roomNumber = 439862;
>>>>>>> development
var catNipOn = false;
var sifterPollerOn = true;

console.log("Starting Kittybot...");

http.createServer(function(req, res) {
  console.log("An HTTP request has been made.");
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("Meow\n");
}).listen(Number(process.env.PORT) || 8000);


var room = client.room(roomNumber, function(room) {

  // Start the session for the room
  session.start(room);

  // Start listening for messages. Check every 2 seconds to see if we are listening.
  var listenInterval = setInterval(function() {
    if (!room.isListening()) {
      console.log("Listening to the room " + room.name);
      room.listen(function(message){

        // Update session as needed
        if (message.type == "EnterMessage" || message.type == "LeaveMessage") {
          client.user(message.userId, function (user) { 
            session.update(message.type, user, function(msg){
              speak(msg);
            });
          });
        }

        // Need to check to see if the message is not null since we are using .match
        if (message.body != null ) {

          // General Commands module
          kitty.respond(room, message.body, function(response){
            speak(response);
          });

          // SoundMessage counts module
          if (message.type === "SoundMessage") {
            counts.update(message.body);
          }

          // Sifters module
          if (message.body === "/sifters" || message.body === "/crs") {
            sifter.processCommand(room, message.body);
          }
          if (message.body.match(/\/sifter\s+(\d+)/) || message.body.match(/\/cr\s+(\d+)/)) {
            sifter.processCommand(room, message.body);
          }

          // Catnip module
          if (message.body.match(/\/catnip\s+(on)/)) {
            console.log("Kittybot is nommin some catnip");
            catNipOn = true;
            sifter.catNipOn = true;
          }
          if (message.body.match(/\/catnip\s+(off)/)) {
            console.log("Kittybot has stopped nommin the catnip");
            catNipOn = false;
            sifter.catNipOn = false;
          }
        }
      });
    }
  }, 2000);
  // Leet speak module
  var speak = function(message){
    if(catNipOn){
        room.speak(lol.LOLTranslate(message));
    }
    else{
      room.speak(message);
    }
  }

  // Sifter API polling module
  if (sifterPollerOn) {
    console.log("Polling against the Sifter API is now enabled.");
    setInterval(function() {
      sifter.pollAPI(function(issue) {
        console.log("Polling the Sifter API...");
        speak(issue['opener_name'] + " has opened the following sifter: Sifter #" + issue['number'] + ": " + issue['subject']);
      });
    }, 60000);
  }
  else {
    console.log("Polling against the Sifter API is disabled.");
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
}, 600000);
