if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis"), redisdb = redis.createClient(rtg.port, rtg.hostname);
  redisdb.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require('redis'), redisdb = redis.createClient();
}

var room_prefex;

this.init = function(room) {
  room_prefex = "[Room " + room.name + "]";
  console.log(room_prefex + " Kittybot has joined the room. ");
  room.join();
  console.log(room_prefex + " Initializing session. Session is now being stored in set 'connected_users_" + room.id +"'");
  room.users(function (users) {

    // Add all the users to a redis hash for that room to establish a session
    for (var i = 0; i < users.length; i++) {
      redisdb.sadd("connected_users_" + room.id, users[i].name);
    }

  });

  this.numberOfConnectedUsers("connected_users_" + room.id);

}

this.update = function(room, messageType, user){
  // If someone joins the room, add them to the redis set since to establish a session for that user
  if (messageType == "EnterMessage") {
    console.log(room_prefex + " " + user.name + " has connected.");
    redisdb.sadd("connected_users_"  + room.id, user.name);
    this.numberOfConnectedUsers("connected_users_" + room.id);
  }
  // If someone leaves the room, remove them from the redis set
  if (messageType == "LeaveMessage") {
    console.log(room_prefex + " " + user.name + " has disconnected.");
    redisdb.srem("connected_users_"  + room.id, user.name);

    this.numberOfConnectedUsers("connected_users_" + room.id);

    // If it is Kittybot that leaves, stop listening to the room
    if (user.name === "Kittybot") {
      room.stopListening();
      console.log(room_prefex + " Kittybot is no longer listening for messages.");
    }
  }
}

this.expire = function(room) {
  // Notify that session is being expired
  console.log(room_prefex + " Expiring session.");
  redisdb.del("connected_users_id" + room.id);

  // Re-init the session
  console.log(room_prefex + " Re initializing session.");
  this.init(room);
}

// Syncs all the users with redis.  Campfire's streaming API tends to time out.  This is the "workaround" to prevent that, according to the community
this.sync = function(room) {
  console.log(room_prefex + " Syncing session.");

  room.users(function (users) {
    // Add all the users to a redis hash for that room to establish a session
    for (var i = 0; i < users.length; i++) {
      redisdb.sadd("connected_users_" + room.id, users[i].name);
    }
  });
}

this.numberOfConnectedUsers = function(set) {
  redisdb.smembers(set, function(err, res){
    console.log(room_prefex + " Number of coneccted users: " +res.length);
  });
}



