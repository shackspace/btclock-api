var config = require('config');
var bluetoothSerialPort = require('bluetooth-serial-port');
var express = require('express');

var btmac = config.get('BtClock.mac');
var btchannel = config.get('BtClock.channel');
var bttimeout = config.get('BtClock.timeout')*1;

var readonly = config.get('readonly');
var host = config.get('host');
var port = config.get('port');
var baseurl = config.get('baseurl');

for (var i=2;i<process.argv.length;i++) {
	var param = process.argv[i];

	switch(param) {
		case '--host':
			host = process.argv[++i];
			break;

		case '--port':
			port = process.argv[++i];
			break;

		case '--baseurl':
			baseurl = process.argv[++i];
			break;

		case '--mac':
			btmac = process.argv[++i];
			break;

		case '--channel':
			btchannel = process.argv[++i];
			break;

		case '--readonly':
			readonly = true;
			break;

		case '-h':
		case '--help':
		default:
			if (param != '-h' && param != '--help')
				console.log('Unknown parameter: ' + param);

			console.log('Usage:');
			console.log(process.argv[0] + ' ' + process.argv[1] + ' -- [--host <host>] [--port <port>] [--baseurl <base url>] [--readonly] [--mac <bluetooth address>] [--channel <bluetooth channel>]');
			console.log('	--host:	host ip to bind to. Default: ' + config.get('host'));
			console.log('	--port:	port to bind to. Default: ' + config.get('port'));
			console.log('	--baseurl:	base URL under which the api endpoints will be served. Default: ' + config.get('baseurl'));
			console.log('	--readonly:	if given, prevents the web api from sending bluetooth requests which change eeprom values in the btclock. Default: ' + config.get('readonly'));
			console.log('	--mac:	bluetooth address of the btclock. Default: ' + config.get('BtClock.mac'));
			console.log('	--channel:	bluetooth channel of the btclock to connect to. Default: ' + config.get('BtClock.channel'));
			console.log('	--timeout:	Timeout in ms after which a bluetooth request will be considered as unanswered. Default: ' + config.get('BtClock.timeout'));
			process.exit();
			break;
	}
}

var app = express();
var btClock = new (require('./bt-clock.js'))(btmac, btchannel, bttimeout);

function delay(value) {
	return new Promise( (resolve, reject) => { setTimeout( () => resolve(value), 500 ); } );
}

function readonlyGuard() {
	return new Promise( (resolve, reject) => {
		if (readonly)
			reject('readonly');
		resolve();
	});
}

app.get('/', function(req, res) {
	res.redirect(baseurl + '/datetime');
});

app.get(baseurl, function(req, res) {
	var response = {};
	var errorResponse = null;

	btClock.datetime.then( (v) => { response.datetime = v.datetime; } )
	.then( (v) => delay(v) )
	.then( (v) => btClock.blanktime.config ).then( (v) => { response.blanktime = v.blanktime; } )
	.then( (v) => delay(v) )
	.then( (v) => btClock.sequence.config ).then( (v) => { response.sequence = v.sequence; } )
	.then( (v) => delay(v) )
	.then( (v) => btClock.specialline.config ).then( (v) => { response.specialline = v.specialline; } )
	.then( (v) => delay(v) )
	.then( (v) => btClock.specialline.secondconfig ).then( (v) => { response.specialline.secondconfig = v.specialline.secondconfig; } )
	.then( (v) => delay(v) )
	.then( (v) => btClock.specialline[1] ).then( (v) => { response.specialline[1] = v.specialline[1]; } )
	.then( (v) => delay(v) )
	.then( (v) => btClock.specialline[2] ).then( (v) => { response.specialline[2] = v.specialline[2]; } )
	.then( (v) => delay(v) )
	.then( (v) => btClock.specialline[3] ).then( (v) => { response.specialline[3] = v.specialline[3]; } )
	.then( (v) => delay(v) )
	.then( (v) => btClock.specialline[4] ).then( (v) => { response.specialline[4] = v.specialline[4]; } )
	.then( (v) => delay(v) )
	.then( (v) => btClock.specialline[5] ).then( (v) => { response.specialline[5] = v.specialline[5]; } )
	.then( (v) => { res.type('json').send(JSON.stringify(response)); } )
	.catch( (e) => { res.status(500).send(e) } );
});

app.get(baseurl + '/datetime', function(req, res) {
	if (req.query.iso8601) {
		readonlyGuard()
		.then( () => btClock.setDateTime(new Date(req.query.iso8601)) )
		.then( (value) => { res.send('OK') } )
		.catch( (error) => { res.status(500).send(error) } )
	} else {
		btClock.datetime
		.then( (value) => { res.type('json').json(value) } )
		.catch( (error) => { res.status(500).send(error) } )
	}
});

app.get(baseurl + '/sequence', function(req, res) {
	if (req.query.config) {
		readonlyGuard()
		.then( () => btClock.setSequence(req.query.config) )
		.then( (value) => { res.send('OK') } )
		.catch( (error) => { res.status(500).send(error) } )
	} else {
		btClock.sequence.config
		.then( (value) => { res.type('json').json(value) } )
		.catch( (error) => { res.status(500).send(error) } )
	}
});

app.get(baseurl + '/blanktime', function(req, res) {
	if (req.query.config) {
		readonlyGuard()
		.then( () => btClock.setBlankTime(req.query.config) )
		.then( (value) => { res.send('OK') } )
		.catch( (error) => { res.status(500).send(error) } )
	} else {
		btClock.blanktime.config
		.then( (value) => { res.type('json').json(value) } )
		.catch( (error) => { res.status(500).send(error) } )
	}
});

app.get(baseurl + '/specialline', function(req, res) {
	var promise = null;
	if (req.query.config || req.query.secondconfig)
		promise = readonlyGuard();

	if (req.query.config ) {
		promise = promise
		.then( () => btClock.setSpecialLineConfig(req.query.config) )
	}
	if (req.query.secondconfig) {
		promise = promise.then( (v) => delay(v) )
		.then( () => btClock.setSpecialLineSecondConfig(req.query.secondconfig) )
	}

	if (promise != null) {
		promise
		.then( (value) => { res.send('OK') } )
		.catch( (error) => { res.status(500).send(error) } )
	} else {
		var response = {};
		var errorResponse = null;
		
		btClock.specialline.config.then( (v) => { response.specialline = v.specialline; } )
		.then( (v) => delay(v) )
		.then( (v) => btClock.specialline.secondconfig ).then( (v) => { response.specialline.secondconfig = v.specialline.secondconfig; } )
		.then( (v) => { res.type('json').send(JSON.stringify(response)); } )
		.catch( (e) => { res.status(500).send(e) } );
	}
});

app.get(new RegExp(baseurl + "/specialline/0"), function(req, res) {
	if (req.query.line) {
		btClock.setSpecialLine(0, req.query.line)
		.then( (value) => { res.send('OK') } )
		.catch( (error) => { res.status(500).send(error) } )
	} else {
		res.status(500).send('');
	}
});

app.get(new RegExp(baseurl + "/specialline/\([1-5]\)"), function(req, res) {
	if (req.query.line) {
		readonlyGuard()
		.then( () => btClock.setSpecialLine(req.params[0], req.query.line) )
		.then( (value) => { res.send('OK') } )
		.catch( (error) => { res.status(500).send(error) } )
	} else {
		btClock.specialline[req.params[0]]
		.then( (value) => { res.type('json').json(value) } )
		.catch( (error) => { res.status(500).send(error) } )
	}
});

app.listen(port, function() {
	console.log('Listening on host ' + host + ', port ' + port);
});

