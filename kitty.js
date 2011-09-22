var http = require('http');

function kittybotrespond() {
  console.log('Kittybot has sent a response.');
}

var server = http.createServer(function(req, res){
  res.write('Hi there.\n');

  setTimeout(kittybotrespond, 3000);

  res.end();
}).listen(8100);


console.log('Meow. Is it is me you are looking for?');
