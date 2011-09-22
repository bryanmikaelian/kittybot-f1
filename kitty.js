var http = require('http');
var ranger = require('ranger');

console.log('Meow. Is it is me you are looking for?');

var client = ranger.createClient("fellowshiptech","52d397ade97cfbfc96d58b50a00996842d785cd7");
client.room(438825, function(room) {
  room.join(function() {
    room.listen(function(message) {
      if(message.type === "TextMessage" && message.body.match("Bot")) {
        room.speak("Bot is here to serve.");
      }
    });
  });
});
