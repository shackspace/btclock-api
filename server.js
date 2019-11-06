var config = require('config');
var bluetoothSerialPort = require('bluetooth-serial-port');
var express = require('express');

const btmac = config.get('BtClock.mac');
const port = config.get('port');

var app = express();
var btSerial = new bluetoothSerialPort.BluetoothSerialPort();

app.get('/', function (req, res) {
  res.send('BTClock-api');
});

app.get('/v1/datetime', function(req, res) {
  var channel = 1;
  console.log('connecting to ' + btmac + ' on channel ' + channel);

  var btreply = "";    
  btSerial.connect(btmac, channel, function() {
    btSerial.write(Buffer.from('T?\n', 'utf-8'), function(err, bytesWritten) {
      if (err) console.log(err);
    });

    btSerial.on('data', function(buffer) {
      btreply += buffer.toString('utf-8');

      if (btreply.endsWith('\nOK\n')) {
        btreply = btreply.slice(0, -'\nOK\n'.length);
        res.send(btreply);
        btSerial.close();
      }
    });
  });
});

app.listen(port, function() {
  console.log('Listening on port ' + port + '!');
});

