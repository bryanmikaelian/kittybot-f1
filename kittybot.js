var http = require('http');
var client = require('ranger').createClient("activefaith", "7bda324c83352c4839ee47e6ff842ed759aaf54b");
var lol = require('./lib/LOLTranslate');
var sifter = require('./lib/sifter');
var kitty = require('./lib/kitty');
var session = require('./lib/session');
var roomNumber = 439862;
var catNipOn = false;
var sifterPollerOn = true;

console.log("Kittybot has been started");

http.createServer(function(req, res) {
  console.log("An HTTP request has been made.");
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("Meow\n");
}).listen(Number(process.env.PORT) || 8010);


var room = client.room(roomNumber, function(room) {
  // Begin session for this room
  session.init(room);

  // Session has been established.  Start listening to the room
  room.listen(function(message) {

    // Track when people enter and leave the room.  Upadte session accordingly
    if ((message.type == "EnterMessage" || message.type == "LeaveMessage") && message.userId !== null) {
      client.user(message.userId, function (user) { 
        session.update(room, message.type, user);
      });
    }
  });

  // Sync session to keep the streaming API connection alive.  This happens every 10 minutes
  setInterval(function() {
    session.sync(room);
  }, 600000);

});



