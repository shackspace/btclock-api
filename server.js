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

app.get('/v1/datetime', function(req, res) {
  btClock.request('T?', function(success, reply, error) {
    if (!success) {
      res.status(500).send(error);
    } else {
      res.send(reply);
    }
  });
});

app.listen(port, function() {
  console.log('Listening on port ' + port + '!');
});

