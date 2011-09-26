var http = require('http');
var net = require('net');
var client = require('ranger').createClient("fellowshiptech", "52d397ade97cfbfc96d58b50a00996842d785cd7");

var server = net.createServer(function (stream) {
  console.log('Meow. Is it is me you are looking for?');
  client.room(439862, function(room) {
    room.listen(function(message)  {
      if (message.type === "SoundMessage") {
        console.log("Someone played a sound.");
      }
    });
  });
});

server.port = process.env.PORT || 3000;


