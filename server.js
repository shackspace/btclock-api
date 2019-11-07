var config = require('config');
var bluetoothSerialPort = require('bluetooth-serial-port');
var express = require('express');

const btmac = config.get('BtClock.mac');
const btchannel = config.get('BtClock.channel');
const bttimeout = config.get('BtClock.timeout')*1;

const port = config.get('port');

var app = express();
var btClock = new (require('./bt-clock.js'))(btmac, btchannel, bttimeout);

app.get('/', function (req, res) {
  res.send('BTClock-api');
});

app.get('/v1', function(req, res) {
  var response = {};
  var errorResponse = null;

  function delay() {
    return function(value) {
      return new Promise( (resolve, reject) => { setTimeout( () => resolve(value), 300 ); } );
    }
  }

  btClock.datetime.then( (v) => { response.datetime = v.datetime; } )
  .then( delay() )
  .then( (v) => btClock.blanktime.config ).then( (v) => { response.blanktime = v.blanktime; } )
  .then( delay() )
  .then( (v) => btClock.sequence.config ).then( (v) => { response.sequence = v.sequence; } )
  .then( delay() )
  .then( (v) => btClock.specialline.config ).then( (v) => { response.specialline = v.specialline; } )
  .then( delay() )
  .then( (v) => btClock.specialline.secondconfig ).then( (v) => { response.specialline.secondconfig = v.specialline.secondconfig; } )
  .then( delay() )
  .then( (v) => btClock.specialline[1] ).then( (v) => { response.specialline[1] = v.specialline[1]; } )
  .then( delay() )
  .then( (v) => btClock.specialline[2] ).then( (v) => { response.specialline[2] = v.specialline[2]; } )
  .then( delay() )
  .then( (v) => btClock.specialline[3] ).then( (v) => { response.specialline[3] = v.specialline[3]; } )
  .then( delay() )
  .then( (v) => btClock.specialline[4] ).then( (v) => { response.specialline[4] = v.specialline[4]; } )
  .then( delay() )
  .then( (v) => btClock.specialline[5] ).then( (v) => { response.specialline[5] = v.specialline[5]; } )
  .then( (v) => { res.type('json').send(JSON.stringify(response)); } )
  .catch( (e) => { res.status(500).send(e) } );
});

app.get('/v1/datetime', function(req, res) {
  btClock.datetime
   .then( (value) => { res.type('json').json(value) } )
   .catch( (error) => { res.status(500).send(error) } )
});

app.get('/v1/sequence/config', function(req, res) {
  btClock.sequence.config
   .then( (value) => { res.type('json').json(value) } )
   .catch( (error) => { res.status(500).send(error) } )
});

app.get('/v1/blanktime/config', function(req, res) {
  btClock.blanktime.config
   .then( (value) => { res.type('json').json(value) } )
   .catch( (error) => { res.status(500).send(error) } )
});

app.get('/v1/specialline/config', function(req, res) {
  btClock.specialline.config
   .then( (value) => { res.type('json').json(value) } )
   .catch( (error) => { res.status(500).send(error) } )
});

app.get('/v1/specialline/secondconfig', function(req, res) {
  btClock.specialline.secondconfig
   .then( (value) => { res.type('json').json(value) } )
   .catch( (error) => { res.status(500).send(error) } )
});

app.get(/\/v1\/specialline\/([1-5])/, function(req, res) {
  btClock.specialline[req.params[0]]
   .then( (value) => { res.type('json').json(value) } )
   .catch( (error) => { res.status(500).send(error) } )
});

app.listen(port, function() {
  console.log('Listening on port ' + port + '!');
});

