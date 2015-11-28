var http = require('http');
var fs = require('fs');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log('Un client est connecté !');
    socket.on('message', function(message) {
    	var data=message.split('|');
    	var vx=parseFloat(data[0]);
    	var vz=parseFloat(data[1]);
	    //console.log('Le client a un message pour vous : ' + message);
	});
});



server.listen(9000); 
