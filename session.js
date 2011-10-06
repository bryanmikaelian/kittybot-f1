if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis"), redisdb = redis.createClient(rtg.port, rtg.hostname);
  redisdb.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require('redis'), redisdb = redis.createClient();
}

this.start = function(room){
  // Flush session when starting for the first time
  redisdb.del("connected_users");
  console.log("Set of connected users has been cleared");


  // Add all the current users to a redis hash to establish a "session" for the room 
  room.users(function (users) {
    console.log("Attempting to join the room " + room.name);
    for (var i = 0; i < users.length; i++) {
      redisdb.sadd("connected_users", users[i].name);
    }
    redisdb.sismember("connected_users", "Kittybot", function(err, value){
      if (value === 1) {
        console.log("Already in the room " + room.name);
      }
      else {
        console.log("Joining the room " + room.name);
        room.join(); 
        redisdb.sadd("connected_users", "Kittybot");
      }
    });
  });
}

this.update = function(messageType, user, callback){
  console.log("Beep");
  console.log(messageType);
  // If someone joins the room, add them to the redis set and tell them hi
  if (messageType == "EnterMessage") {
    console.log(user.name + " has connected.");
    redisdb.sadd("connected_users", user.name);
    callback("Sup " + user.name);
  }
  // If someone leaves the room, remove them from the redis set
  if (messageType == "LeaveMessage") {
    console.log(user.name + " has disconnected.");
    redisdb.srem("connected_users", user.name);
  }
}
