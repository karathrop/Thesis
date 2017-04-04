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

httpServer.listen(8875);  
console.log('Server listening on port 8875');

var io = require('socket.io').listen(httpServer);

// var socketIdA, socketIdB;

io.on('connection', 
	function (socket) {	
		console.log("We have a new client: " + socket.id);
				// socket.on('login',function(data){
				// 	if(data == 'a'){
				// 		socketIdA = socket.id;
				// 	}else if (data == 'b'){
				// 		socketIdB = socket.id;
				// 	}

		// 		// });
		// socket.on('left', function(data) {
		// 	console.log(data);
		// 	// var dataToSend = {
		// 	// 	'id':socket.id,
		// 	// 	'data':data
		// 	// }
		// 	io.sockets.emit("left", data);
		// });
	
		socket.on('sensor', function(data) {
			console.log(data);
			// var dataToSend = {
			// 	'id':socket.id,
			// 	'data':data
			// }
			io.sockets.emit("sensor", data);
		});
	}
);