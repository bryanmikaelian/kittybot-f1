if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis"), redisdb = redis.createClient(rtg.port, rtg.hostname);
  redisdb.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require('redis'), redisdb = redis.createClient();
}

this.update = function(soundName){

  // Rimshots
  if (soundName === "rimshot") {
    console.log("Someone played a rimshot");
    // Update redis
    redisdb.incr("total_rimshots");
    redisdb.get("total_rimshots", function(err, value) {
      console.log("Rimshot count updated. The new value is " + value);
    });
  }
}
