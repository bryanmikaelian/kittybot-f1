var http = require('http');
var ranger = require('ranger');

/* Pick a random place to eat */
function randomPlaceToEat() {
  var placesToEat = ['Chipotle', 'Jimmy Johns', 'Chick Fil A', 'Whataburger', 'Firehouse Subs',  'Urban Eatz', 'Wendy\'s', 'Jersey Mikes', 'Five Guys'];
  var picker = Math.floor(Math.random() * (placesToEat.length - 1));
  var client = ranger.createClient("fellowshiptech","52d397ade97cfbfc96d58b50a00996842d785cd7");
  client.room(438825, function(room) {
    room.join(function() {
      room.speak("Might I suggest to eat at " + placesToEat[picker] + " for lunch today?");
    });
  });
}



console.log('Meow. Is it is me you are looking for?');
