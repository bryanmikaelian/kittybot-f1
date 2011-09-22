var http, ranger, server;
http = require('http') 
ranger = require('ranger');
server = http.createServer(function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });

  console.log(ranger);

   return res.end("Meow.\n");
});

port = process.env.PORT || 3000;
server.listen(port);


console.log('Meow. Is it is me you are looking for?');
