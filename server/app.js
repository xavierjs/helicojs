var http = require('http');
var fs = require('fs');
var helicoJS = require('./build/Release/helicoJS');


// Chargement du fichier index.html affiché au client
console.log('Create the HTTP server ...');
var server = http.createServer(function(req, res) {
    console.log('HTTP request URL : ', req.url);
    var allowedURLs=['/', '', '/index.html', '/socket.io.js', '/jquery-2.1.4.min.js', '/script.js', '/background.jpg', '/gamepad.png'];
    if (allowedURLs.indexOf(req.url)===-1) console.log('Security error : URL not allowed');
    var url=req.url;
    if (url==='' || url==='/') {
        url='/index.html';
    }

    var extension=url.split('.').pop();
    var encoding;

    if (extension==='jpg' || extension==='png') {
        encoding=null;
    } else {
        encoding='utf-8';
    }



    fs.readFile('../client'+url, encoding, function(error, content) {
        var contentType;
        switch(extension){
            case 'jpg':
                contentType='image/jpeg';
                break;

            case 'png':
                contentType='image/png';
                break;

            default:
                contentType='text/html';
                break;

        } //end switch extension
 
        res.writeHead(200, {"Content-Type": contentType});
        res.end(content);
    }); //end HTTP request callback
}); //end HTTP createServer

// Chargement de socket.io
var io = require('socket.io').listen(server);


var _is_MAC=false;

console.log('Wait for websocket connection...');
// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log('The client is connected :)');
    
    socket.on('message', function(message) {
    	var data=message.split('|');
        if (data[0]==='mac'){
            var mac=data[1];
            console.log('Set the mac address of the helico to ', mac);
            helicoJS.setMAC(mac);
            //connection Bluetooth
            console.log('Connect to the BT Helico');
            socket.emit('message', 'Connect to the bluetooth Helico...');
            helicoJS.connectBT();
            _is_MAC=false;
            setTimeout(function() {_is_MAC=true}, 500);
            return;
        } //end if set MAC addr

        if (!_is_MAC) return;

    	var vx=parseInt(data[0]);
    	var vz=parseInt(data[1]);
        var vy=parseInt(data[2]);
        var vTrim=parseInt(data[3]);

        //console.log(vx, vz);

        helicoJS.setBTDATA(vx, vz, vy, vTrim);
        // console.log('#');
        return;
	    //console.log('Le client a un message pour vous : ' + message);
	}); //end socket message rcv callback
}); //end on connection


console.log('Listen to port 9000...');
server.listen(9000); 

console.log('OPEN THIS PAGE IN YOUR WEB BROWSER : http://localhost:9000');
