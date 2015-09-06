#!/bin/env node
//Using Expres 3.X
var express 	= require( 'express' );
var Pusher 		= require( 'pusher' )
var NodeCache  	= require( "node-cache" );
var app 		= express();
var myCache    	= new NodeCache();
var config = require( __dirname + '/config.json' );

//Get the environment variables we need.
var ipaddr  = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port    = process.env.OPENSHIFT_NODEJS_PORT || 8080;
app.use(express.bodyParser());///// Express 3.x
app.use(express.static(__dirname + '/public'));

app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );
//app.set( 'view engine', 'html' );//This is cause "Internal Server Error"

app.get( '/', function( req, res ) {
  res.render('index', { appKey: config.pusher.key } );
});

///////// 11/15/2014 /////////////////////
//Access indivual measurement
app.get('/temperature', function(req, res) {
	var obj = myCache.get( "temperature" );
	var t   = myCache.get( "time" );
 	//Response
	res.json({ message: 'temperature is ' +  obj.temperature.value + ' at last measured ' + t.time.value });	
});
app.get('/humidity', function(req, res) {
	var obj = myCache.get( "humidity" );
	var t   = myCache.get( "time" );
 	//Response
	res.json({ message: 'humidity is '  + obj.humidity.value + ' at last measured ' + t.time.value });	
});
app.get('/lightLevel', function(req, res) {
	var obj = myCache.get( "lightLevel" );
	var t   = myCache.get( "time" );
 	//Response
	res.json({ message: 'lightLevel is ' + obj.lightLevel.value + ' at last measured ' + t.time.value });	
});
app.get('/pressure', function(req, res) {
	var obj = myCache.get( "pressure" );
	var t   = myCache.get( "time" );

 	//Response
	res.json({ message: 'pressure is ' + obj.pressure.value + ' at last measured ' + t.time.value  });	
});
app.get('/altitude', function(req, res) {
	var obj = myCache.get( "altitude" );
	var t  = myCache.get( "time" );

 	//Response
	res.json({ message: 'altitude is ' + obj.altitude.value + ' at last measured ' + t.time.value });	
});
//router.get('/allmeasure', function(req, res) {
//        var obj = myCache.get( "allmeasure" );
//        var t = myCache.get( "time" );
        //console.log( obj );

        //Response
        //res.json({ message: 'all measure  ' + obj.allmeasure.value + ' last meas
//ured at ' + t.time.value});
//});
///////////End Access indivual measurement///////////////////

/////// 11/15/2014 ///////////////
////////////////////////////////////////
//Process measure post from Arduino YUN
///////////////////////////////////////
app.get('/measure', function(req, res) {
	//var led = req.param('led', null);
	
	var temp       = req.param('temperature', null);
	var humidity   = req.param('humidity', null);
	var lightLevel = req.param('lightLevel', null);
	var pressure   = req.param('pressure', null);
	var altitude   = req.param('altitude', null);
	var time   	   = req.param('time', null);

	
	//console.log('temperature: '+ temp);
	//console.log('humidity: '+humidity);
	//console.log('lightLevel: '+lightLevel);
	//console.log('pressure: '+pressure);
	//console.log('altitude:'+altitude);
 
	//Put it in cache
	var tempObj = { value: time };
    myCache.set('time', tempObj, 100000);

	var tempObj = { value: temp };
	myCache.set('temperature', tempObj, 100000);

	var humidityObj ={ value: humidity };
	myCache.set('humidity', humidityObj, 100000);

	var pressureObj =  { value: pressure };
	myCache.set('pressure', pressureObj, 100000);

	var lightLevelObj = { value: lightLevel };
	myCache.set('lightLevel', lightLevelObj, 100000);

	var altitudeObj = { value : altitude};
	myCache.set('altitude', altitudeObj, 100000);

	var allmeasure = 'temperature:'+temp+' humidity:'+humidity+' pressure:'+pressure+' lightLevel:'+lightLevel+' altitude:'+altitude;
    var allmeasureObj = { value : allmeasure };
    myCache.set('allmeasure', allmeasureObj, 100000);

 	//Response
	res.json({ message: 'hooray! welcome to our measure!' });	

});
/////// End Process measure //////////////////

app.get( '/trigger', function( req, res ) {
  var pusher = new Pusher( config.pusher );
  
  ///
  var obj = myCache.get( "allmeasure" );
  var timeobj = myCache.get( "time" );
  var allmeasure = 'allmeasure  ' +obj.allmeasure.value;
  var timeval = timeobj.time.value;
  ///
  
  var data =  {
                message: 'From GET',
				action: 'browser click',
				allmeasure: allmeasure,    	// added for display button
				time: timeval  				// measure time for display button
              };
  pusher.trigger( 'homeautomation-channel', 'test-event', data, null, function( err, pusherReq, pusherRes ) {
      res.json( pusherRes.statusCode, { status: pusherRes.statusCode } );
  } );

} );

//// Using POST verb
app.post( '/trigger', function( req, res ) {
  var pusher = new Pusher( config.pusher );
  var myapikey = req.param('apikey', null); //req.params.apikey;
  var data =  {
                message: 'POST trigger',
				device: req.body.device,
				action: req.body.action,
				pin: req.body.pin,
				apikey: myapikey 
              };
  pusher.trigger( 'homeautomation-channel', 'test-event', data, null, function( err, pusherReq, pusherRes ) {
      res.json( pusherRes.statusCode, { status: pusherRes.statusCode } );
  } );

} );
//// Using POST verb



//// Using POST verb
app.post( '/sms', function( req, res ) {
	var pusher = new Pusher( config.pusher );
  
	//if(req.body.hasOwnProperty('message')) { //req.body.hasOwnProperty() may not working don't use it
	
	///
	if (req.body.AccountSid === 'ACfe87c151f274b943ad9b16120df06bbd' ) { // && req.body.From === '+19713126815'
	
			 
				 var obj = myCache.get( "allmeasure" );
			 
			 ///
			 var timeobj = myCache.get( "time" );
			 var allmeasure = 'allmeasure  ' +obj.allmeasure.value;
			 var timeval = timeobj.time.value;
			 /// 
			 
			
			 
			var data =  {
					message: 'SMS Request/POST from phone# ' +req.body.From, // + ' all measure  ' +obj.allmeasure.value,  
					from: req.body.From,
					account: req.body.AccountSid,
					action: req.body.Body,
					
					allmeasure: allmeasure,    	// added for display button
					time: timeval  				// measure time for display button					
				  };
				  
			pusher.trigger( 'homeautomation-channel', 'test-event', data, null, function( err, pusherReq, pusherRes ) {
			
			res.set('Content-Type', 'text/xml'); 
			//res.send(new Buffer('<Response><Sms>Thank you for submitting your message!</Sms></Response>'));
			res.send(new Buffer('<Response><Sms>'+ obj.allmeasure.value +'</Sms></Response>'));
			return;
	  } );
	
	}
	///
	
	/**
	var data =  {
					message: 'POST sms',  // ' + req.body.Body + ' ' + req.body.From + ' ' + req.body.AccountSid
					from: req.body.From,
					account: req.body.AccountSid,
					action: req.body.Body 
				  };
				  
	pusher.trigger( 'homeautomation-channel', 'test-event', data, null, function( err, pusherReq, pusherRes ) {
			//res.json( pusherRes.statusCode, { status: pusherRes.statusCode } );
			
			res.set('Content-Type', 'text/xml'); 
			res.send(new Buffer('<Response><Sms>Thank you for submitting your message!</Sms></Response>'));
			
	  } );
	  ***/
	
} );
//// Using POST verb


app.listen( port, ipaddr, function() {
 console.log( 'listening on port ' + port );
} );