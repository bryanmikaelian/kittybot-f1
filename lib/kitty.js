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
    callback("Meow. I support the following commands: /dismisskitty, /meow, /purr, /jingyi, /rimshots, /sifters, /sifter <number>, /crs, /cr <number>, /catnip <on,off>, /agonycat, /rangers, /important, /418, /starfox, /chuck, /csb");
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

    callback("Meow. Code must be compiling, why don't you watch something while you wait... meow.");
    callback(agonycat[Math.floor(Math.random()*agonycat.length)]);
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

  // Starfox
  if (command === "/starfox") {
    console.log("Can't let you do that Kittybot.");
    callback("http://www.youtube.com/watch?v=05iiSzGDWY4");
  }

  // Chuck Testa
  if (command === "/chuck") {
    console.log("Just Chuck Testa");
    callback("http://www.youtube.com/watch?v=LJP1DphOWPs");
  }

  // Cool story bro
  if (command === "/csb") {
    console.log("Cool story bro.");
    coolstorybro = [ "http://s3.amazonaws.com/kym-assets/photos/images/original/000/061/294/1106514-cool_story_bro_super.jpg?1279885294",
      "http://s3.amazonaws.com/kym-assets/photos/images/original/000/003/376/1244741954750.jpg?1244744929",
      "http://s3.amazonaws.com/kym-assets/photos/images/original/000/097/164/coolstorybrostarwars.jpg?1296927064",
      "http://s3.amazonaws.com/kym-assets/photos/images/original/000/053/539/1275832084784.jpg?1276089537",
      "http://s3.amazonaws.com/kym-assets/photos/images/original/000/154/915/1311792525915.gif?1311815147"]

    callback(coolstorybro[Math.floor(Math.random()*coolstorybro.length)]);
  }

  // Make sense?
  if (command.length > 165) {
    console.log("Make sense?");
    callback("Make sense?");
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
