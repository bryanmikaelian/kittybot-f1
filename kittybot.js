var http = require('http');
var client = require('ranger').createClient("activefaith", "7bda324c83352c4839ee47e6ff842ed759aaf54b");
var lol = require('./lib/LOLTranslate');
var sifter = require('./lib/sifter');
var kitty = require('./lib/kitty');
var session = require('./lib/session');
<<<<<<< .merge_file_VppW05
var roomNumber = 373588;
var catNipOn = false;
=======
var counts = require('./lib/counts');
// var leet = require('./lib/leet');
var roomNumber = 439862;
>>>>>>> .merge_file_Df8usR
var sifterPollerOn = true;
var catNipOn = false;

console.log("Starting Kittybot...");

http.createServer(function(req, res) {
  console.log("An HTTP request has been made.");
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("Meow\n");
}).listen(Number(process.env.PORT) || 8010);


var room = client.room(roomNumber, function(room) {

  // Start the session for the room
  session.start(room);

<<<<<<< .merge_file_VppW05
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
          if (message.body === "/sifters" || message.body === "/crs" || message.body.match(/\/sifter\s+(\d+)/) || message.body.match(/\/cr\s+(\d+)/)) {
            sifter.processCommand(room, message.body, function(response){
              speak(response);
            });
          }

          // Catnip module
          if (message.body.match(/\/catnip\s+(on)/)) {
            console.log("Kittybot is nommin some catnip");
            catNipOn = true;
          }
          if (message.body.match(/\/catnip\s+(off)/)) {
            console.log("Kittybot has stopped nommin the catnip");
            catNipOn = false;
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
        speak(issue['opener_name'] + " has opened the following sifter: Sifter #" + issue['number'] + ": " + issue['subject']);
      });
    }, 60000);
  }
  else {
    console.log("Polling against the Sifter API is disabled.");
  }
=======
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
    if (message.userId != null && message.body != null) {

      // General Commands module
      kitty.processCommand(room, message.body, function(response){
        speak(room, response);
      });

      // SoundMessage counts module
      if (message.type === "SoundMessage") {
        counts.update(message.body);
      }

      // If someone requested all the sifters, process the command
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

>>>>>>> .merge_file_Df8usR
});




