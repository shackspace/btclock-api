var bluetoothSerialPort = require('bluetooth-serial-port');

module.exports = class BtClock {
	constructor(address, channel, timeout) {
		this.address = address;
		this.channel = channel;
		this.timeout = 5000;
		if (timeout > 0)
			this.timeout = timeout;
	}

	requestPromiseFactory(message, jsonFactory) {
		var btClockInstance = this;
		return () => new Promise(
			function(resolve, reject) {
				btClockInstance.request(message, function(success, reply, error) {
					if (!success)
						reject(error);
					else
						resolve(jsonFactory(reply));
				});
			});
	}

	sendPromiseFactory(message) {
		var btClockInstance = this;
		return () => new Promise(
			function(resolve, reject) {
				btClockInstance.request(message, function(success, reply, error) {
					if (!success)
						reject(error);
					else
						resolve();
				});
			});
	}

	get datetime() {
		return this.requestPromiseFactory('T?', (reply) => {
			// parse date string like 2019-11-07(03) 17:03:10
			var match, year, month, day, dayOfWeek, hour, minute, second;
			[match, year, month, day, dayOfWeek, hour, minute, second] = reply.match(
				/([0-9]{4})-([0-9]{2})-([0-9]{2})\(([0-9]{2})\) ([0-9]{2}):([0-9]{2}):([0-9]{2})/
			);

			dayOfWeek = [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ][parseInt(dayOfWeek)];
			var iso8601 = year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second;

			return {'datetime': { 'weekday': dayOfWeek, 'iso8601': iso8601 }};
		})();
	}

	setDateTime(date) {
		var year, month, day, hour, minute, second, dayOfWeek;

		year = date.getFullYear() % 100;
		if (year < 10)
			year = '0' + year;

		month = date.getMonth()+1;
		if (month < 10)
			month = '0' + month;

		day = date.getDate();
		if (day < 10)
			day = '0' + day;

		hour = date.getHours();
		if (hour < 10)
			hour = '0' + hour;

		minute = date.getMinutes();
		if (minute < 10)
			minute = '0' + minute;

		second = date.getSeconds();
		if (second < 10)
			second = '0' + second;

		dayOfWeek = date.getDay()-1;
		if (dayOfWeek < 0)
			dayOfWeek += 7;

		if (dayOfWeek < 10)
			dayOfWeek = '0' + dayOfWeek;

		return this.sendPromiseFactory('T=' + year + month + day + hour + minute + second + dayOfWeek)();
	}
	
	get blanktime() {
		var btClockInstance = this;
		return {
			get config() {
				return btClockInstance.requestPromiseFactory('B?', (reply) => { return {'blanktime': { 'config': reply }}; })();
			}
		}
	}

	setBlankTime(config) {
		return this.sendPromiseFactory('B=' + config)();
	}

	get sequence() {
		var btClockInstance = this;

		return {
			get config() {
				return btClockInstance.requestPromiseFactory('S?', (reply) => { return {'sequence': { 'config': reply }}; })();
			}
		}
	}

	setSequence(config) {
		return this.sendPromiseFactory('S=' + config)();
	}

	get specialline() {
		var btClockInstance = this;

		return {
			get 1() {
				return btClockInstance.requestPromiseFactory('1?', (reply) => { return {'specialline': { '1': { 'line': reply }}}; })();
			},

			get 2() {
				return btClockInstance.requestPromiseFactory('2?', (reply) => { return {'specialline': { '2': { 'line': reply } }}; })();
			},

			get 3() {
				return btClockInstance.requestPromiseFactory('3?', (reply) => { return {'specialline': { '3': { 'line': reply } }}; })();
			},

			get 4() {
				return btClockInstance.requestPromiseFactory('4?', (reply) => { return {'specialline': { '4': { 'line': reply } }}; })();
			},

			get 5() {
				return btClockInstance.requestPromiseFactory('5?', (reply) => { return {'specialline': { '5': { 'line': reply } }}; })();
			},

			get config() {
				return btClockInstance.requestPromiseFactory('C?', (reply) => { return {'specialline': { 'config': reply }}; })();
			},

			get secondconfig() {
				return btClockInstance.requestPromiseFactory('D?', (reply) => { return {'specialline': { 'secondconfig': reply }}; })();
			}
		}
	}

	setSpecialLine(n, line) {
		return this.sendPromiseFactory(n + '=' + line)();
	}

	setSpecialLineConfig(config) {
		return this.sendPromiseFactory('C=' + config)();
	}

	setSpecialLineSecondConfig(config) {
		return this.sendPromiseFactory('D=' + config)();
	}

	request(message, callback) {
		var btClockInstance = this;
		console.log('connecting...');

		var btSerial = new bluetoothSerialPort.BluetoothSerialPort();
		btSerial.connect(this.address, this.channel, function() {
			console.log('connected to ' + btClockInstance.address + ' on channel ' + btClockInstance.channel + '...');
			console.log('sending: "' + message + '"');

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

				if (reply.match( /(\n?)OK\n/ )) {
					clearTimeout(timeoutHandle);
					btSerial.close();
					btSerial.off('data', onData);
					console.log('connection closed');

					success = true;
					var linebreakIndex = reply.indexOf('\n');
					if (linebreakIndex >= 0)
						reply = reply.slice(0, linebreakIndex);
					callback(success, reply, error);
				}
				if (reply.match( /(\n?)No\|.*\n/ )) {
					clearTimeout(timeoutHandle);
					btSerial.close();
					btSerial.off('data', onData);
					console.log('connection closed');

					success = false;
					error = reply;
					reply = null;
					callback(success, reply, error);
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
			var error = 'cannot connect to bluetooth device';
			callback(success, reply, error);
		});
	}
};
