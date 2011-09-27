var http = require('http');
var client = require('ranger').createClient("fellowshiptech", "7bda324c83352c4839ee47e6ff842ed759aaf54b");
var rimshotCount = 0;

console.log('Meow. Is it is me you are looking for?');
console.log('Kittybot is alive and ready to serve.  Standing by.');

client.room(439862, function(room) {
    /* Figure out if we need to join the room */
  var kittyInRoom = false;
  room.users(function (users) {
    for (var i = 0; i < users.length; i++) {
      if(users[i].name === "Kitty Bot") {
        console.log("Kittybot is already in the room " + room.name);
        kittyInRoom = true;
      }
    };
    /* If kitty is not in the room, join it */
    if (!kittyInRoom) {
      console.log("Kittybot is joining room " + room.name);
      room.join();
    }
    monitorRoom(room);
  });
});

function monitorRoom(room) {
  // room.speak("Hello.  Is it me you are looking for?");
  room.listen(function(message)  {
    /* Generic logging */
    // console.log(message);

    /* Welcome */
    if (message.type === "EnterMessage") {
      client.user(message.userId, function(user) {
        if (user.name === "Kitty Bot") {
          room.speak("Hai guyz.  Wat is goin on in hurrr?");
        }
        else {
          console.log(user.name + " connected.");
        room.speak("Hello " + user.name);
        }
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

    /* Rimshot counts */
    if (message.type === "SoundMessage" && message.body === "rimshot") {
      rimshotCount++;
    }


    /* Bot requests */
    /* General request, just saying hi */
    if (message.body === "!kitty") {
      room.speak("Hello.  Is it me you are looking for?");
      console.log("Someone made a request to the bot.");
    }

    /* Rimshot count */
    if (message.body === "!rcount") {
      room.speak("Total rimshots played today: " + rimshotCount);
    }

    /* Help */
    if (message.body === "!help") {
      room.speak("Meow.  The commands I support are !help, !kitty and !rcount");
    }

    /* Kill */
    if (message.body === "!kill") {
      console.log("Kittybot has been ordered to be terminated.");
      room.speak("Meow?  WAIT...NO...SON OF A ...");
      // room.play("trombone");
      room.leave();
    }
  });
}
