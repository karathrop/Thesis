/*
	This node script is a server which is paired with a serial client script 
	which when functioning together relay serial data from a single serial 
	device to multiple clients.
*/



var http = require('http');
var fs = require('fs');
var url =  require('url');


function handleIt(req, res) {
	console.log("The URL is: " + req.url);

	var parsedUrl = url.parse(req.url);
	console.log("They asked for " + parsedUrl.pathname);

	var path = parsedUrl.pathname;
	if (path == "/") {
		path = "index.html";
	}

	fs.readFile(__dirname + path,
		function (err, fileContents) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + req.url);
			}
			res.writeHead(200);
			res.end(fileContents);
  		}
  	);	
	
	console.log("Got a request " + req.url);
}


var httpServer = http.createServer(handleIt);

httpServer.listen(8899);  
console.log('Server listening on port 8899');

var io = require('socket.io').listen(httpServer);

// var socketIdA, socketIdB;

io.on('connection', 
	function (socket) {	
		console.log("We have a new client: " + socket.id);
		socket.on('click', function(){
			console.log("server click")
			io.sockets.emit('click');
		});

		socket.on('player1', function(){
			io.sockets.emit('throwBallLeft');
		});

		socket.on('player2', function(){
			io.sockets.emit('throwBallRight');
		});

        socket.on('datasensorLeft', function(data){
	        if(parseInt(data,10) == 1){
	        	io.sockets.emit('click', data);
	        }
	        if(parseInt(data, 10) > 5) {
	        	io.sockets.emit('throwBallRight', data);
				io.sockets.emit('throwBallLeft', data);
			}
	    }); 
	    socket.on('datasensorRight', function(data){
	        if(parseInt(data,10) == 1){
	        	io.sockets.emit('click', data);
	        }
	        if(parseInt(data, 10) > 5) {
				io.sockets.emit('throwBallRight', data);
				io.sockets.emit('throwBallLeft', data);
			}
	    }); 
	}
);
