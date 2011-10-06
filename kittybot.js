var http = require('http');
var client = require('ranger').createClient("fellowshiptech", "7bda324c83352c4839ee47e6ff842ed759aaf54b");
var lol = require('./LOLTranslate');
var sifter = require('./sifter');
var kitty = require('./kitty');
var session = require('./session');

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis"), redisdb = redis.createClient(rtg.port, rtg.hostname);
  redisdb.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require('redis'), redisdb = redis.createClient();
}

var roomNumber = 439862;
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
          // Nuke. WARNING THIS WILL REQUIRE A RESTART
          if (message.body === "/nukekitty") {
            client.user(message.userId, function(user) {
              if (user.name === "Bryan Mikaelian") {
                speak("NUCLEAR LAUNCH DETECTED. Kittybot destruction will now occur.");
                speak("Meow?");
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
                speak("Not enough minerals.");
              }
            });
          }

          // General Commands module
          kitty.respond(room, message.body, function(response){
            speak(response);
          });

          // SoundMessage counts module
          if (message.type === "SoundMessage") {
            if (message.body == "rimshot") {
              console.log("Someone played a rimshot");
              // Update redis
              redisdb.incr("total_rimshots");
              redisdb.get("total_rimshots", function(err, value) {
                console.log("Rimshot count updated. The new value is " + value);
              })
            }
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
  // Leet speak controller
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
      sifter.pollAPI(redisdb, function(issue) {
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
  https.get(options, function(res){
    res.on('data', function (chunk) {
      console.log("Kittybot says: " res.statusCode);
    });
  });
}, 600000);

