if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis"), redisdb = redis.createClient(rtg.port, rtg.hostname);
  redisdb.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require('redis'), redisdb = redis.createClient();
}

this.processCommand = function(room, command, callback){
  // Kittybot generic command
  // Help
  if (command === "/help") {
    console.log("[General Module] Someone requested help.");
    callback("Meow. I support the following commands: /rimshots, /sifters, /sifter <number>, /catnip <on,off>, /agonycat");
  }

  // agonycat
  if(command === "/agonycat"){
    console.log("[General Module] Kittybot will find and post agony cat videos");

    agonycat = [
    "http://www.youtube.com/watch?v=yyOxT2rz77g",
    "http://www.youtube.com/watch?v=f_VdySnHsJY",
    "http://www.youtube.com/watch?v=Ck378EnrZIU",
    "http://www.youtube.com/watch?v=f88jm10REfA",
    "http://www.youtube.com/watch?v=CfW69rHtxIo"]

    callback("[General Module] Meow. Code must be compiling, why don't you watch something while you wait... meow.");
    callback(agonycat[Math.floor(Math.random()*agonycat.length)]);
  }

  // afk
  if (command === "afk") {
    console.log("[General Module] Someone went AFK");
    callback("Good luck on the interview bro.");
  }

  // brb
  if (command === "brb") {
    console.log("[General Module] Someone said brb.");
    callback("I bet they aren't coming back...");
  }

  // Make sense?
  if (command.length > 200) {
    console.log("[General Module] Make sense?");
    callback("Make sense?");
  }
}
