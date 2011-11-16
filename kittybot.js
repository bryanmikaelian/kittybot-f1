var http = require('http');
var client = require('ranger').createClient("fellowshiptech", "7bda324c83352c4839ee47e6ff842ed759aaf54b");
var lol = require('./lib/LOLTranslate');
var sifter = require('./lib/sifter');
var kitty = require('./lib/kitty');
var session = require('./lib/session');
var roomNumber = 373588;
var catNipOn = false;
var sifterPollerOn = true;

console.log("Kittybot has been started");

http.createServer(function(req, res) {
  console.log("An HTTP request has been made.");
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("Meow\n");
}).listen(Number(process.env.PORT) || 8000);


var room = client.room(roomNumber, function(room) {
  // Begin session for this room
  session.init(room);

  // Start listening for messages. Check every 2 seconds to see if we are listening.
  var listenInterval = setInterval(function() {

  });

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
