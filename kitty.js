var http = require('http');

var server = http.createServer(function(req, res){
  res.end();
}).listen(8100);

console.log('Meow. Is it is me you are looking for?');
