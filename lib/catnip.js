var lol = require('./LOLTranslate');
var catNipOn = false;

// Leet speak module
this.speak = function(room, message){
  if(catNipOn){
      room.speak(lol.LOLTranslate(message));
  }
  else{
    room.speak(message);
  }
}

this.configureLeetSpeak = function(option) {
  catNipOn = option;
  console.log("[Catnip] Leet speak is now set to " + catNipOn);
}
