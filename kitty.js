var http = require('http');
var client = require('ranger').createClient("fellowshiptech", "52d397ade97cfbfc96d58b50a00996842d785cd7");

console.log(process.env.PORT || 3000);

console.log('Meow. Is it is me you are looking for?');
client.room(439862, function(room) {
  room.listen(function(message)  {
    if (message.body === "/bot") {
      room.speak("Yes?");
      console.log("Someone made a request to the bot.");
    }
  });
});
