if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis"), redisdb = redis.createClient(rtg.port, rtg.hostname);
  redisdb.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require('redis'), redisdb = redis.createClient();
}


this.init = function(room) {
  room.users(function (users) {
    console.log("[Room " + room.name + "] Initializing session. Session is now being stored in set 'connected_users_" + room.id +"'");

    // Add all the users to a redis hash for that room to establish a session
    for (var i = 0; i < users.length; i++) {
      redisdb.sadd("connected_users_" + room.id, users[i].name);
    }
  });
}


this.start = function(room){
  // Purge the sessios DB to remove any outdated data
  this.purge();

  // Add all the current users to a redis hash to establish a "session" for the room 
  room.users(function (users) {
    console.log("Establishing a set of connected users for " + room.name);
    for (var i = 0; i < users.length; i++) {
      redisdb.sadd("connected_users", users[i].name);
      console.log(users[i].name + " is in the room.  Adding to session");
    }
  });
}

this.update = function(room, messageType, user, callback){
  // If someone joins the room, add them to the redis set and tell them hi
 
 var greetings = ['Sup', 'Hey', 'Word', 'Hello', 'Hey look, it is', 'Ni Hao', 'Hola', 'SUP BRO', 'Hey there.  Big fan of your work', 'Glad you could make it ', 'Thanks for joining us', 'Hi Scott..err', 'HEY WHAT IS UP ', 'Awesome. Glad you decided to jump in', 'Shhh! Everyone quit talking about', 'Hayyyyyyyyyyyyyyyyyyyyy']
  if (messageType == "EnterMessage") {
    console.log(user.name + " has connected.");
    redisdb.sadd("connected_users", user.name);
    // callback(greetings[Math.floor(Math.random()*greetings.length)] + " " + user.name);
  }
  // If someone leaves the room, remove them from the redis set
  if (messageType == "LeaveMessage") {
    console.log(user.name + " has disconnected.");
    redisdb.srem("connected_users", user.name);

    // If it is Kittybot that leaves, stop listening to the room
    if (user.name === "Kittybot") {
      room.stopListening();
      console.log("Kittybot is no longer listening to the room " + room.name);
    }
  }
}

this.purge = function() {
  redisdb.del("connected_users");
  console.log("Purging any existing session data.");
}

