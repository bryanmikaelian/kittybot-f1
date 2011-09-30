var https = require('https');
var sifter;

this.getSifter = getSifter;


function getSifter(isChangeRequest, callback) {

  if (isChangeRequest) {
    var options = {
      host: 'fellowshiptech.sifterapp.com',
      path: '/api/projects/3624/issues?s=1-2',
      headers: {'X-Sifter-Token': 'b5c0c1aafc3a4db0d6aa55ed51731bd7'}
    };
  }
  else {
    var options = {
      host: 'fellowshiptech.sifterapp.com',
      path: '/api/projects/5348/issues?s=1-2',
      headers: {'X-Sifter-Token': 'b5c0c1aafc3a4db0d6aa55ed51731bd7'}
    };
  }


}
