if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis"), redisdb = redis.createClient(rtg.port, rtg.hostname);
  redisdb.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require('redis'), redisdb = redis.createClient();
}

this.respond = function(room, command, callback){
  // Kittybot generic command
  // Help
  if (command === "/help") {
    console.log("Someone requested help.");
    callback("Meow. I support the following commands: /dismisskitty, /meow, /purr, /jingyi, /rimshots, /sifters, /sifter <number>, /crs, /cr <number>, /catnip <on,off>, /agonycat, /rangers, /important, /418");
  }
  // Meow
  if (command === "/meow") {
    console.log("Kittybot said meow.");
    callback("Meow!");
  }

  // Purr
  if (command === "/purr") {
    console.log("Kittybot purred.");
    callback("Purrrrrrr");
  }


  // Jingyi? 
  if (command === "/jingyi") {
    console.log("Kittybot told every to not be stupid.");
    callback("Don't be stupid!");
  }

  // agonycat
  if(command === "/agonycat"){
    console.log("Kittybot will find and post agony cat videos");

    agonycat = [
    "http://www.youtube.com/watch?v=yyOxT2rz77g",
    "http://www.youtube.com/watch?v=f_VdySnHsJY",
    "http://www.youtube.com/watch?v=Ck378EnrZIU",
    "http://www.youtube.com/watch?v=f88jm10REfA",
    "http://www.youtube.com/watch?v=CfW69rHtxIo"]

    speak("Meow. Code must be compiling, why don't you watch something while you wait... meow.");
    callback.speak(agonycat[Math.floor(Math.random()*agonycat.length)]);

  }

  // afk
  if (command === "afk") {
    console.log("Someone went AFK");
    callback("Good luck on the interview bro.");
  }

  // brb
  if (command === "brb") {
    console.log("Someone said brb.");
    callback("I bet they aren't coming back...");
  }

  // rangers
  if (command === "/rangers") {
    console.log("Someone cheered for the rangers.");
    callback("Go Rangers!");
  }

  // important
  if (command === "/important") {
    console.log("Kittybot is a very important person.");
    callback("I don't think you guys understand. I. AM. A. VERY. IMPORTANT. PERSON.");
  }

  // I am a teapot
  if (command=== "/418") {
    console.log("Kittybot is a teapot.");
    callback("I am a teapot.");
  }

  // Make sense?
  if (command != null) {
    if (command.length > 165) {
      console.log("Make sense?");
      callback("Make sense?");
    }
  }

  // Dismiss
  if (command === "/dismisskitty") {
    console.log("Kittybot has been requested to temporarily leave the room " + room.name);
    room.leave(); 
    setTimeout(function(){
      room.join();
    }, 5000);
  }

  // Rimshot count
  if (command === "/rimshots") {
    console.log("Someone requested the total rimshots");
    redisdb.get("total_rimshots", function(err, value) {
      callback("Meow. Total rimshots played: " + value);
    });
  }
}
