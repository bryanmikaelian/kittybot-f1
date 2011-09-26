var http = require('http');
var client = require('ranger').createClient("fellowshiptech", "7bda324c83352c4839ee47e6ff842ed759aaf54b");

console.log('Meow. Is it is me you are looking for?');
console.log('Kittybot is alive and ready to serve.  Standing by.');

client.room(439862, function(room) {
  // room.join();
  // room.speak("Hello.  Is it me you are looking for?");
  room.listen(function(message)  {
    /* Welcome */
    if (message.type === "EnterMessage") {
      client.user(message.userId, function(user) {
        console.log(user.name + " connected.");
        room.speak("Hello " + user.name);
      });
    }

    /* That's what she said */
    if (message.type === "TextMessage") {
      client.user(message.userId, function(user) {
        if (user.name === "Matthew Sneeden") {
          room.speak("That's what she said.");
        }
      });
    }

    /* Bot requests */
    if (message.body === "/bot") {
      room.speak("Yes?");
      console.log("Someone made a request to the bot.");
    }
  });
});
