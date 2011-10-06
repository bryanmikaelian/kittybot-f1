var sifter = require('./sifter');
var lol = require('./LOLTranslate');


this.respond = function(command, callback){
  // Kittybot generic command
  // 
  // Help
  if (command === "/help") {
    console.log("Someone requested help.");
    callback("Meow. I support the following commands: /dismisskitty, /meow, /purr, /jingyi, /rimshots, /sifters, /sifter <number>, /crs, /cr <number>, /catnip <on,off>, /agonycat, /rangers, /important, /418");
  }

}
