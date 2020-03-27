var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const https = require('https');
var cron = require("node-cron");

var indexRouter = require('./routes/index');
var licencesRouter = require('./routes/licences');
var task_rest = require('./config/task_rest');
var app = express();
var fs = require('fs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/licences', licencesRouter);

console.log('routing dne');

cron.schedule("*/15 * * * *", function (){
    try{
		https.get(task_rest.assign, (resp) => {
						
			// The whole response has been received. Print out the result.
			resp.on('end', () => {
				console.log('done');
			});
		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	}catch(e){
			console.log("Error: " + e.message);
	}
	try{
		https.get(task_rest.mailing, (resp) => {
			
			// The whole response has been received. Print out the result.
			resp.on('end', () => {
				console.log('done');
			});
		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	}catch(e){
		console.log("Error: " + e.message);
	}
});

module.exports = app;
