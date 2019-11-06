var bluetoothSerialPort = require('bluetooth-serial-port');

module.exports = class BtClock {
	constructor(address, channel, timeout) {
		this.address = address;
		this.channel = channel;
		this.timeout = 5000;
		if (timeout > 0)
			this.timeout = timeout;
	}
	
	request(message, callback) {
		var btClockInstance = this;
		console.log('connecting...');

		var btSerial = new bluetoothSerialPort.BluetoothSerialPort();
		btSerial.connect(this.address, this.channel, function() {
			console.log('connected to ' + btClockInstance.address + ' on channel ' + btClockInstance.channel + '...');

			btSerial.write(Buffer.from(message + '\n', 'utf-8'), function(err, bytesWritten) {
				if (err) console.log(err);
			});

			var success = null;
			var reply = '';
			var error = '';
			var timeoutHandle = null;

			function onData(buffer) {
				reply += buffer.toString('utf-8');
				console.log('received so far: ' + reply);

				var linebreakIndex = reply.indexOf('\n');
				if (linebreakIndex >= 0) {
					if (reply.substr(linebreakIndex + 1, 3) == 'OK\n') {
						clearTimeout(timeoutHandle);
						btSerial.close();
						btSerial.off('data', onData);
						console.log('connection closed');

						success = true;
						reply = reply.slice(0, linebreakIndex);
						callback(success, reply, error);
					}
					if (reply.startsWith('No|')) {
						clearTimeout(timeoutHandle);
						btSerial.close();
						btSerial.off('data', onData);
						console.log('connection closed');

						success = false;
						error = reply.slice('No|'.length);
						reply = null;
						callback(success, reply, error);
					}
				}
			}

			timeoutHandle = setTimeout(function() {
				btSerial.close();
				btSerial.off('data', onData);
				console.log('timed out');
				console.log('connection closed');

				success = false;
				reply = null;
				error = 'timed out'
				callback(success, reply, error);
			}, btClockInstance.timeout);

			btSerial.on('data', onData);
		},
		function() {
			console.log('connection to ' + btClockInstance.address + ' on channel ' + btClockInstance.channel + ' failed');

			var success = false;
			var reply = null;
			var error = "cannot connect to bluetooth device";
			callback(success, reply, error);
		});
	}
};
