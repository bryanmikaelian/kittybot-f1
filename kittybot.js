var http = require('http');
var client = require('ranger').createClient("fellowshiptech", "7bda324c83352c4839ee47e6ff842ed759aaf54b");
var lol = require('./LOLTranslate');
var sifter = require('./sifter');
var kitty = require('./kitty');

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
        redisdb.sadd("connected_users", "Kittybot");
      }
    });
  });

  // Start listening for messages. Check every 2 seconds to see if we are listening.
  var listenInterval = setInterval(function() {
    if (!room.isListening()) {
      console.log("Listening to the room " + room.name);
      room.listen(function(message){ 

        // Session Module
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
            speak("Meow. Hello " + user.name + ". Is it me you are looking for?"); 
          });
        }

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
        kitty.respond(room, message.body, redisdb, function(response){
          speak(response);
        });

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

        // SoundMessage counts module
        if (message.type === "SoundMessage" && message.body == "rimshot") {
          console.log("Someone played a rimshot");
          // Update redis
          redisdb.incr("total_rimshots");
          redisdb.get("total_rimshots", function(err, value) {
            console.log("Redis has been updated.  The value for total_rimshots is " + value);
          })
        }

        // Rimshot count
        if (message.body === "/rimshots") {
          console.log("Someone requested the total rimshots");
          redisdb.get("total_rimshots", function(err, value) {
            speak("Meow. Total rimshots played: " + value);
          });
        }

        // Need to check to see if the message is not null since we are using .match
        if (message.body != null ) {

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
  var speak = function(message){
    if(catNipOn){
        room.speak(lol.LOLTranslate(message));
    }
    else{
      room.speak(message);
    }	
  }
});
