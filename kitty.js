var http = require('http');
var client = require('ranger').createClient("fellowshiptech", "52d397ade97cfbfc96d58b50a00996842d785cd7");

console.log(process.env.PORT || 3000);

console.log('Meow. Is it is me you are looking for?');
client.room(439862, function(room) {
  room.listen(function(message)  {
    /* Welcome */
    if (message.type === "EnterMessage") {
      client.user(message.userId, function(user) {
        console.log(user.name + " connected.");
        room.speak("Hello " + user.name);
      });
    }

    /* Bot requests */
    if (message.body === "/bot") {i
      room.speak("Yes?");
      room.play("rimshot");
      console.log("Someone made a request to the bot.");
    }
  });
});
