var http = require('http');
var ranger = require('ranger');

function kittybotrespond() {
  var client = ranger.createClient("fellowshiptech", "52d397ade97cfbfc96d58b50a00996842d785cd7");
  client.room(438825, function(room) {
    room.speak("hello world\n");
  });
}

var server = http.createServer(function(req, res){
  res.write('Hi there.\n');

  kittybotrespond();

  res.end();
}).listen(8100);


console.log('Meow. Is it is me you are looking for?');

