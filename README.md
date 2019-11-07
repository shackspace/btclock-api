# BtClock-api

Nodejs api for accessing the BtClock

## Usage
*developement*
```
npm start
```
Starts http service on port 8081 using nodemon.

*production*
```
npm run start:production
```
Starts http service on port 80


## Endpoints
 * */v1*
 * */v1/datetime*
 * */v1/blanktime/config*
 * */v1/sequence/config*
 * */v1/specialline/[1-5]*
 * */v1/specialline/config*
 * */v1/specialline/secondconfig*

## Example
*http://apihost/v1*
```
{
 "datetime":"2019-11-07(03) 02:59:07",
 "blanktime":{
  "config":"0000-0000,1"
 },
 "sequence":{
  "config":"T10,D3"
 },
 "specialline":{
  "1":"leet",
  "2":"! 23 uhr 42 ",
  "3":"",
  "4":"",
  "5":"",
  "config":"2342-2343,2",
  "secondconfig":"0000-0000,1"}
}
```

