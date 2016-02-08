var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');       
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var config = require('./config/config'); 
 
var app = express();

var allowCrossDomain = function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Content-Range, Content-Disposition, Content-Description');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
};
app.use(allowCrossDomain);

app.use(express.static(__dirname + '/public'));
mongoose.connect(config.mangoDB.url);

app.use(express.static(__dirname + '/public'));  
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
  
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
	
require('./routes/TodoRoute.js')(app);

app.listen(config.app.port, function(){console.log("listen to "+__dirname +":"+config.app.port)});