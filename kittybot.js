var http = require('http');
var client = require('ranger').createClient("fellowshiptech", "7bda324c83352c4839ee47e6ff842ed759aaf54b");
var lol = require('./LOLTranslate');
var sifter = require('./sifter');

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis"), redisdb = redis.createClient(rtg.port, rtg.hostname);
  redisdb.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require('redis'), redisdb = redis.createClient();
}

var roomNumber = 373588;
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
        speak("Meow.  I am here to serve.  Please type /help if you need assistance. kthxbye.");
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
            speak("Meow. Hello " + user.name + ". Is it me you are looking for?"); 
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

        // Respond to messages
        kitty.respond(message, function(){
        });


        // Help
        if (message.body === "/help") {
          console.log("Someone requested help.");
          room.speak("Meow. I support the following commands: /dismisskitty, /meow, /purr, /jingyi, /rimshots, /sifters, /sifter <number>, /crs, /cr <number>, /catnip <on,off>, /agonycat, /rangers, /important, /418");
        }

        // Random cat noises
        if (message.body === "/meow") {
          console.log("Kittybot said meow.");
          speak("Meow!");
        }
        if (message.body === "/purr") {
          console.log("Kittybot purred.");
          speak("Purrrrrrr");
        }

        // Jingyi? 
        if (message.body === "/jingyi") {
          console.log("Kittybot told every to not be stupid.");
          speak("Don't be stupid!");
        }

        // agonycat
        if(message.body === "/agonycat"){
          console.log("Kittybot will find and post agony cat videos");

          agonycat = [
          "http://www.youtube.com/watch?v=yyOxT2rz77g",
          "http://www.youtube.com/watch?v=f_VdySnHsJY",
          "http://www.youtube.com/watch?v=Ck378EnrZIU",
          "http://www.youtube.com/watch?v=f88jm10REfA",
          "http://www.youtube.com/watch?v=CfW69rHtxIo"]

          speak("Meow. Code must be compiling, why don't you watch something while you wait... meow.");
          room.speak(agonycat[Math.floor(Math.random()*agonycat.length)]);

        }

        // afk
        if (message.body === "afk") {
          console.log("Someone went AFK");
          speak("Good luck on the interview bro.");
        }

        // brb
        if (message.body === "brb") {
          console.log("Someone said brb.");
          speak("I bet they aren't coming back...");
        }

        // rangers
        if (message.body === "/rangers") {
          console.log("Someone cheered for the rangers.");
          speak("Go Rangers!");
        }

        // important
        if (message.body === "/important") {
          console.log("Kittybot is a very important person.");
          speak("I don't think you guys understand. I. AM. A. VERY. IMPORTANT. PERSON.");
        }

        // I am a teapot
        if (message.body === "/418") {
          console.log("Kittybot is a teapot.");
          speak("I am a teapot.");
        }

        // Make sense?
        if (message.body != null) {
          if (message.body.length > 165) {
            console.log("Make sense?");
            speak("Make sense?");
          }
        }

        // Rimshot counter
        if (message.type === "SoundMessage" && message.body == "rimshot") {
          console.log("Someone played a rimshot");
          // Update redis
          redisdb.incr("total_rimshots");
          redisdb.get("total_rimshots", function(err, value) {
            console.log("Redis has been updated.  The value for total_rimshots is " + value);
          })
        }

        if (message.body === "/rimshots") {
          console.log("Someone requested the total rimshots");
          redisdb.get("total_rimshots", function(err, value) {
            speak("Meow. Total rimshots played: " + value);
          });
        }

        // Sifter and Change Requests
        // Match on the /sifters command or /crs command
        if (message.body === "/sifters" || message.body === "/crs") {
          sifter.processCommand(room, message.body);
        }

        if (message.body != null ) {
          // Match on the /sifter <number> command or /cr <number command
          if (message.body.match(/\/sifter\s+(\d+)/) || message.body.match(/\/cr\s+(\d+)/)) {
            sifter.processCommand(room, message.body);
          }

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
