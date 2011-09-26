var http = require('http');

console.log('Meow. Is it is me you are looking for?');

server = http.createServer(function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  return res.end("Meow\n");
});

port = process.env.PORT || 3000;
server.listen(port);

