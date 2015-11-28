var main=function() {
	Console.init();
	Gamepad.init();
	Socket.init();

	setInterval(function() {
		Gamepad.animate_physics();
	}, 10);

}; //end main();



var Socket=(function() {
	var _socket,_initialized=false;
	var _server; //='http://localhost:9000';
	var _connecting=false, _connected=false;

	var that = {
		init: function() {
			_initialized=true;
			$('#coDiscoButton').click(function() {
				if (_connecting || !_initialized) return false;
				if (_connected){
					that.disconnect();
				} else {
					that.connect();
				}
			});

			/* $('#resetButton').click(function() {
				_connecting=false;
				if (_connected){
					that.disconnect();
				}
				$('#coDiscoButton').html('CONNECT').removeAttr('disabled');
			}); */
		}, //end init()

		connect: function() {
			if (_connected || _connecting) return;
			_connecting=true;
			$('#coDiscoButton').html('CONNECTING...').attr("disabled", "disabled");

			_mac=$('#mac').val();
			_server=$('#server').val();
			Console.log('Set server to '+_server);
			Console.log('Set mac to '+_mac);

			_socket = io.connect(_server);
			_socket.on('connect', function() {
				$('#coDiscoButton').html('DISCONNECT').removeAttr('disabled');
				_connecting=false;
				_connected=true;
				that.send('mac|'+_mac);
			});
			_socket.on('disconnect', function() {
				$('#coDiscoButton').html('CONNECT').removeAttr('disabled');
				Console.log('Connection lost');
				Gamepad.reset();
				_connected=false;
			});
			_socket.on('message', function(message) {
				console.log(message);
				Console.log("<div class='messageServer'>SERVER : "+message+'</div>');
			});
		}, //end connect()

		disconnect: function() {
			if (!_connected || _connecting || !_initialized) return;
			_socket.close();
			$('#coDiscoButton').html('CONNECT').removeAttr('disabled');
			_connected=false;
			_connecting=false;
		},

		send: function(msg){
			if (!_initialized || !_connected || _connecting) return;
			_socket.emit('message',msg);
			//console.log('sent to srv : ',msg);
		},

		change_server: function() {
			_initialized=false;
			that.init();
		},

		change_helico: function() {
			_mac=$('#mac').val();
			Console.log('Change mac to '+_mac);
			that.send('mac|'+_mac);
		}
	} //end that
	return that;
})(); //end Socket()


var Console=(function() {
	var _lines=new Array(40);
	var _jqConsole;

	return {
		init: function() {
			for (var i=0; i<_lines.length; ++i){
				_lines[i]='';
			}
			_jqConsole=$('#consoleInside');
			Console.log('Console initialized');			
		},

		log: function(msg){
			_lines.push(msg);
			_lines.shift();
			_jqConsole.html(_lines.join('<br/>'));
		}
	}
})(); //end Console()


var Gamepad=(function() {
	var _isGamepad=false, _chromeGamepad=false;
	var _vz=0, _vzmin=0, _vzmax=0xFF, _az=0x02; //up down
	var _vxMean=0x60, _vx=0, _vxmin=0, _vxmax=0xFF, _ax=0x04;  //left right
	var _vTrim=104, _vTrimMin=-0xF8, _vTrimMax=0xF8, _aTrim=0x08;
	var _vy=0, _vymin=0, _vymax=0xFF, _ay=0x05;
	var _counter=0;
	var _epsilonGamepad=0.01;


	_vx=_vxMean;

	var clamp=function(x,min,max){
		return Math.min(Math.max(x, min), max);
	}

	return {
		init: function() {

			//init gamepad
			window.addEventListener("gamepadconnected", function(e) {
			  Console.log("Contrôleur n°"+e.gamepad.index+" connecté : "+e.gamepad.id+".<br/>"+e.gamepad.buttons.length+" boutons, "+e.gamepad.axes.length+" axes.");
			  _isGamepad=true;
			  _chromeGamepad=('getGamepads' in navigator);
			  _gamepad=e.gamepad;
			});

			window.addEventListener("gamepaddisconnected", function(e) {
			  Console.log('Contrôleur n°'+e.gamepad.index+' déconnecté : '+e.gamepad.id);
			  _isGamepad=false;
			});
		}, //end init()

		animate_physics: function() {
			if (!_isGamepad) {
				if ('getGamepads' in navigator){
					var gamepads=navigator.getGamepads();
					if (typeof(gamepads[0])==='undefined'){
						return;
					} else {
						_isGamepad=true;
						_chromeGamepad=true;
						_gamepad=gamepads[0];
					}
				}
			}

			if (_chromeGamepad){
				_gamepad=navigator.getGamepads()[0];
			}

			window.gamepad=_gamepad;

			//UP or DOWN (main rotor)
			//_vz-=Math.round(_gamepad.axes[1])*_az;
			if (_gamepad.buttons[4].value===0 && _gamepad.buttons[6].value===1){
				_vz-=_az;
			}
			if (_gamepad.buttons[4].value===1 && _gamepad.buttons[6].value===0){
				_vz+=_az;
			}
			_vz=clamp(_vz, _vzmin, _vzmax);




			//TRIMMER
			if (_gamepad.buttons[5].value===0 && _gamepad.buttons[7].value===1){
				_vTrim-=_aTrim;
			}
			if (_gamepad.buttons[5].value===1 && _gamepad.buttons[7].value===0){
				_vTrim+=_aTrim;
			}
			_vTrim=clamp(_vTrim, _vTrimMin, _vTrimMax);



			//LEFT and RIGHT
			if (_gamepad.axes[0]*(_vx-_vxMean)>0) _vx=_vxMean;

			//_vx-=Math.round(_gamepad.axes[0])*_ax;
			_vx-=_gamepad.axes[0]*_ax;
			_vx=clamp(_vx, _vxmin, _vxmax);

			if (Math.abs(_gamepad.axes[0])<_epsilonGamepad && _vx!==_vxMean){
				_vx+=(_vx>_vxMean)?-_ax:_ax;
			}


			//GO FORWARD (second rotor)
			if (_gamepad.axes[1]*_vy>0) _vy=0;
			//_vy-=Math.round(_gamepad.axes[1])*_ay;
			_vy-=_gamepad.axes[1]*_ay;
			_vy=clamp(_vy, _vymin, _vymax);

			if (Math.abs(_gamepad.axes[1])<_epsilonGamepad && _vy!==0){
				_vy+=(_vy>0)?-_ay:_ay;
			}


			if (_gamepad.buttons[0].value===1) {
				Console.log('*** Helico UP MAX ***');
				_vz=_vzmax;
			}
			if (_gamepad.buttons[2].value===1) {
				Console.log('*** Helico DOWN MAX ***');
				_vz=_vzmin;
			}


			if (_counter%6===0){
				var msg=Math.round(_vx)+'|'+_vz+'|'+Math.round(_vy)+'|'+_vTrim;
				Socket.send(msg);
				if (counter%(6*4)===0){
					Console.log('speeds : ', msg);
				}
			}
			//console.log(_vx, _vz, _vy, _vTrim);

			++_counter;
		}, //end animate_physics();

		reset: function() {
			_vz=_vzmin;
		}
	}
})(); //end Gamepad()
