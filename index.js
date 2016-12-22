/**
 * Module dependencies.
 **/
var express = require("express"),
	bodyParser = require('body-parser'),
	path = require("path"),
	app = express(),
	router = express.Router(),
	config = require('./config');
	require('./routes')(router);
	
app.use(express.static(path.join(__dirname,'assets')));
app.set('views', path.join(__dirname,'views')); //set default view path for routes
app.set('view engine', 'ejs'); //set default template engine
app.engine('.html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));

//server settings
app.use('/',router);

console.log("App is running in enviornment:- ", process.env.NODE_ENV);
var server = app.listen(config.port, function(){
	console.log("Server listening at http://localhost: "+config.port);
});


module.exports = server ;