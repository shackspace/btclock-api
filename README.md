# BtClock-api

Nodejs api for accessing the BtClock

## Usage

### developement

```
npm install
npm start
```
Starts http service on port 8081 using nodemon.

### production

```
npm install
npm run start:production
```
Starts http service on port 80 per default. If --readonly is given no changes can be made to the eeprom of the btclock.

### CLI parameters
```
Usage:
npm run start:production -- [--host <host>] [--port <port>] [--baseurl <base url>] [--readonly] [--mac <bluetooth address>] [--channel <bluetooth channel>]
	--host:	host ip to bind to. Default: 0.0.0.0
	--port:	port to bind to. Default: 80
	--baseurl:	base URL under which the api endpoints will be served. Default: /btclock
	--readonly:	if given, prevents the web api from sending bluetooth requests which change eeprom values in the btclock. Default: false
	--mac:	bluetooth address of the btclock. Default: 20:11:02:47:01:01
	--channel:	bluetooth channel of the btclock to connect to. Default: 1
	--timeout:	Timeout in ms after which a bluetooth request will be considered as unanswered. Default: 15000
```


## Endpoints
### read values (HTTP GET)
 * */btclock*
 * */btclock/datetime*
 * */btclock/blanktime*
 * */btclock/sequence*
 * */btclock/specialline*
 * */btclock/specialline/[1-5]*

### change values (HTTP GET query)
 * */btclock/datetime?iso8601=1970-01-01T00:00:00*

    sets the date and time on the btclock

 * */btclock/blanktime?config=...*

    configures the display blank time.
    
    i.e. *config=2200-0600,1* blanks out the display from 22pm to 6am
    
    i.e. *config=0600-0200,2* blanks out the display from 6am to 22pm
and during the weekend

 * */btclock/sequence?config=...*

    configures the display sequence.

    i.e. *config=T10,D3,110* shows the time for 10 seconds, then the date for 3 seconds and then specialline 1 for 10 seconds

 * */btclock/specialline?config=...&secondconfig=...*

    configures time ranges when a specific special line should be shown.

    i.e. *config=0000-0001,1* shows specialline 1 at midnight until one minute after midnight

    i.e. *secondconfig=1200-1201,5* shows specialline 5 at lunch unti one minute after lunch

 * */btclock/specialline/0?line=...*

    immediately shows the given specialline without storing it in eeprom

 * */btclock/specialline/[1-5]?line=...*

    stores the given line in eeprom for as specialline 1,2,3,4 or 5

    i.e. */specialline/1?line=hello%20world*

## Example
*http://apihost/btblock*
```
{
 "datetime": {
  "weekday":"Fri",
  "iso8601":"2019-11-07T02:59:07"
 },
 
 "blanktime":{
  "config":"0000-0000,1"
 },
 
 "sequence":{
  "config":"T10,D3"
 },
 
 "specialline":{
  "1":{
   "line":"leet"
  },
  "2":{
   "line":"! 23 uhr 42 "
  },
  "3":{
   "line":""
  },
  "4":{
   "line":""
  },
  "5":{
   "line":""
  },
  
  "config":"2342-2343,2",
  "secondconfig":"0000-0000,1"
 }
}
```

