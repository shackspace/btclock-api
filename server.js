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

  btClock.datetime
   .then( (v) => new Promise( (res, rej) => { response.datetime = v.datetime; setTimeout(() => res(btClock.blanktime.config), 1000); } ) )
   .then( (v) => new Promise( (res, rej) => { response.blanktime = v.blanktime; setTimeout(() => res(btClock.sequence.config), 1000); } ) )
   .then( (v) => new Promise( (res, rej) => { response.sequence = v.sequence; setTimeout(() => res(btClock.specialline.config), 1000); } ) )
   .then( (v) => new Promise( (res, rej) => { response.specialline = v.specialline; setTimeout(() => res(btClock.specialline.secondconfig), 1000); } ) )
   .then( (v) => new Promise( (res, rej) => { response.specialline.secondconfig = v.specialline.secondconfig; setTimeout(() => res(btClock.specialline[1]), 1000); } ) )
   .then( (v) => new Promise( (res, rej) => { response.specialline[1] = v.specialline[1]; setTimeout(() => res(btClock.specialline[2]), 1000); } ) )
   .then( (v) => new Promise( (res, rej) => { response.specialline[2] = v.specialline[2]; setTimeout(() => res(btClock.specialline[3]), 1000); } ) )
   .then( (v) => new Promise( (res, rej) => { response.specialline[3] = v.specialline[3]; setTimeout(() => res(btClock.specialline[4]), 1000); } ) )
   .then( (v) => new Promise( (res, rej) => { response.specialline[4] = v.specialline[4]; setTimeout(() => res(btClock.specialline[5]), 1000); } ) )
   .then( (v) => { response.specialline[5] = v.specialline[5]; return response; } )
   .then( (v) => { res.type('json').send(JSON.stringify(v)); } )
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

