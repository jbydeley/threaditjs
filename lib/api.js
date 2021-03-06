var limiter = require("express-rate-limit")({
	delayMs : 500,
	delayAfter : 10,
	message : "no not you again",
	max : 20
});

var threads = require("./threads.js");
threads.reset();

setInterval(function(){
	threads.reset();
}, 300000);




failChance = 0.05;
var fail = function() {
	return Math.random()<failChance;
};
var serverError = function(res) { 
	res.status(500).json({
		error: "insufficient success"
	});
};



var express = require("express");
var app = express();

var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Headers", "Content-Type");
	next();
});

app.use(limiter);

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/docs.html");
});

app.get("/threads/", function(req, res){
	if(fail()) {
		serverError(res);
		return;
	}
	res.json({data: threads.threads()});
});

app.get("/comments/:id", function(req, res) {
	var id = req.params.id;

	if(fail()) {
		serverError(res);
		return;
	}
	var thread = threads.comments(id);
	if(!thread||!id) {
		res.status(404).json({data: "not found"});
		return;
	}
	res.json({data: thread});
});

app.post("/threads/create", function(req, res) {
	var text = req.body.text;

	if(fail()) {
		serverError(res);
		return;
	}

	var newThread = threads.newThread(text);

	if(!newThread || fail()) {
		serverError(res);
		return;
	}
	res.status(200)
		.json({data:newThread});
});

app.post("/comments/create", function(req, res) {
	var parent = req.body.parent;
	var text = req.body.text;

	if(fail()) {
		serverError(res);
		return;
	}
	var comment = threads.newComment(parent, text);
	
	if(!comment || fail()) {
		serverError(res);
		return;
	}

	res.status(200)
		.json({data: comment});
});

module.exports = app;