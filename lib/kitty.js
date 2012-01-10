var catnip = require('./catnip');

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
    callback("Meow. I support the following commands: /rimshots, /sifters, /sifter <number>, /agonycat, /achievements, /catnip <on, off>");
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

  // mitch
  // This spits out one of the many awesome Mitch Hedburg quotes
  // see: http://www.youtube.com/watch?v=2491LucLa1g
  // need to change this to fetch the quotes
  if(command === "/mitch"){
    console.log("[General Module] Kittybot will find and post Mitch Hedburg quotes");

    mitch = [
    "A severed foot is the ultimate stocking stuffer.",
    "I hope the next time I move I get a real easy phone number, something that's real easy to remember. Something like two two two two two two two. I would say \"Sweet.\" And then people would say, \"Mitch, how do I get a hold of you?\" I'd say, \"Just press two for a while and when I answer, you will know you have pressed two enough.",
    "My friend asked me if I wanted a frozen banana, I said \"No, but I want a regular banana later, so ... yeah\".",
    "On a traffic light green means 'go' and yellow means 'yield', but on a banana it's just the opposite. Green means 'hold on,' yellow means 'go ahead,' and red means, 'where did you get that banana ?'",
	"I'm against picketing, but I don't know how to show it.",
	"I think Bigfoot is blurry, that's the problem. It's not the photographer's fault. Bigfoot is blurry, and that's extra scary to me. There's a large, out-of-focus monster roaming the countryside. Run, he's fuzzy, get out of here.",
	"One time, this guy handed me a picture of him, he said,\"Here's a picture of me when I was younger.\" Every picture is of you when you were younger. ",
	"My fake plants died because I did not pretend to water them.",
	"I walked into Target, but I missed. I think the entrance to Target should have people splattered all around. And, when I finally get in, the guy says, \"Can I help you?\" \"Just practicing.\"",
	"When I was a boy, I laid in my twin-sized bed and wondered where my brother was.",
	"Is a hippopotamus a hippopotamus or just a really cool opotamus?",
	"If I had a dollar for every time I said that, I'd be making money in a very weird way.",
	"My belt holds up my pants and my pants have belt loops that hold up the belt. What's really goin on down there? Who is the real hero?",
	"I'm an ice sculptor - last night I made a cube.",
	"If you have dentures, don't use artificial sweetener, cause you'll get a fake cavity.",
	"I saw this dude, he was wearing a leather jacket, and at the same time he was eating a hamburger and drinking a glass of milk. I said to him \"Dude, you're a cow. The metamorphosis is complete. Don't fall asleep or I'll tip you over.\"",
	"A burrito is a sleeping bag for ground beef.",
	"Here's a thought for sweat shop owners: Air Conditioning. Problem solved.",
	"I saw a sheet lying on the floor, it must have been a ghost that had passed out... So I kicked it.",
    "The Kit-Kat candy bar has the name 'Kit-Kat' imprinted into the chocolate. That robs you of chocolate!"]

    callback(mitch[Math.floor(Math.random()*mitch.length)]);
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

  // Achievements
  if (command === "/achievements") {
    callback("Meow.  No achievements have been ear...wait.  That feature hasn't been built yet.  Soon.");
  }


  // Rimshot count
  if (command === "/rimshots") {
    redisdb.hget("counts", "rimshots", function(err, value) {
      console.log("[General Module] Someone requested the total rimshots count.");
      callback("Meow. Total rimshots played: " + value);
    });
  }

  // Catnip module
  if (command.match(/\/catnip\s+(on)/)) {
    console.log("Kittybot is nommin some catnip");
    catnip.configureLeetSpeak(true);
  }
  if (command.match(/\/catnip\s+(off)/)) {
    console.log("Kittybot has stopped nommin the catnip");
    catnip.configureLeetSpeak(false);
  }

}
