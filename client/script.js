var __timer, __hexaMode=false;
var main=function() {
	//$(window).load(function() {
		Console.init();
		Gamepad.init();
		Socket.init();
	//});
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

			_socket = io.connect(_server, {'force new connection': true});
			_socket.on('connect', function() {
				$('#coDiscoButton').html('DISCONNECT').removeAttr('disabled');
				_connecting=false;
				_connected=true;
				that.send('mac|'+_mac);
				console.log('Launch loop');
				Console.log('Start loop');
				__timer=setInterval(function() {
					Gamepad.animate_physics();
				}, 10);
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
			that.send('disconnect');
			Console.log('Disconnect');
			_socket.close();
			_socket.disconnect();
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
		},

		is_running: function() {
			return _initialized && _connected && !_connecting;
		},
	    
		is_connected: function() {
			return _connected;
		},
	    
		send_hexa: function() {
		  var hexa=$('#hexa').val();
		  __hexaMode=true;
		  Console.log('SET HEXA MODE TO 1');
		  that.send('hexa|'+parseInt(hexa, 16));
		  //clearInterval(_timer);
		}
	} //end that
	return that;
})(); //end Socket()


var Console=(function() {
	var _lines=new Array(40);
	var _jqConsole=false;

	return {
		init: function() {
			for (var i=0; i<_lines.length; ++i){
				_lines[i]='';
			}
			_jqConsole=$('#consoleInside');
			Console.log('Console initialized');			
		},

		log: function(msg){
			if (!_jqConsole) {
				console.log(msg);
				return false;
			}
			_lines.push(msg);
			_lines.shift();
			_jqConsole.html(_lines.join('<br/>'));
		}
	}
})(); //end Console()


var Gamepad=(function() {
	var _isGamepad=false, _chromeGamepad=false;
	var _vz=0, _vzmin=0, _vzmax=0xFF, _az=0x01; //up down
	var _vxMean=0x50, _vx=0, _vxmin=0, _vxmax=0xFF, _ax=0x04;  //left right
	var _vTrim, _vTrimMean=71, _vTrimMin=0, _vTrimMax=0xFF, _aTrim=0x04;
	var _vy=0, _vymin=-0xFF, _vymax=0xFF, _ay=0x02;
	var _counter=0;
	var _epsilonGamepad=0.01;
	var _vPrefixe=0x15, _vPrefixeMin=0x14, _vPrefixeMax=0xff;
	var _vyFront=0; _vyBack=0;
	var _vBalance=5;

	_vx=_vxMean;
	_vTrim=_vTrimMean;

	var clamp=function(x,min,max){
		return Math.min(Math.max(x, min), max);
	}

	var that = {
		init: function() {
			//that.refresh_vUseless();

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

		/*refresh_vUseless: function() {
			_vx=parseInt($('#vUseless').val());
			Console.log('CHANGE USELESS SPEED TO '+_vx);
		},*/

		animate_physics: function() {
			//console.log('animate_physics');
			if (!Socket.is_connected()) {
			    console.log('Stop main loop bkoz connection lost');
			    Console.log('Stop loop');
			    clearInterval(__timer);
			    return;
			}
			
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
			/*if (_gamepad.buttons[5].value===0 && _gamepad.buttons[7].value===1){
				_vTrim-=_aTrim;
			}
			if (_gamepad.buttons[5].value===1 && _gamepad.buttons[7].value===0){
				_vTrim+=_aTrim;
			}
			_vTrim=clamp(_vTrim, _vTrimMin, _vTrimMax);*/

			if (_gamepad.buttons[5].value===0 && _gamepad.buttons[7].value===1){
				--_vTrimMean;
			}
			if (_gamepad.buttons[5].value===1 && _gamepad.buttons[7].value===0){
				++_vTrimMean;
			}
			_vTrimMean=clamp(_vTrimMean, _vTrimMin, _vTrimMax);


			var ga0=_gamepad.axes[0];
			if (Math.abs(ga0)<_epsilonGamepad) {
				_vTrim=_vTrimMean;
				_vBalance=4; //5; 101
				_vx=Math.round((_vxmax+_vxmin)/2);
			} else if (ga0>0){
				//right turn -> OK
				_vTrim=_vTrimMean+ga0*(_vTrimMax-_vTrimMean);
				_vBalance=7; //111
				_vx=_vxmin;
				//ca marche de ce cote
			} else if (ga0<0){
				//left turn
				//vbalance=13; -> turn right, not good 1101
				//vbalance=1; -> not very good 0001
				_vBalance=1;//1; //111
				_vx=_vxmax;
				_vTrim=_vTrimMean-ga0*(_vTrimMin-_vTrimMean);
			}

			if (_vTrim>0) _vTrim=Math.floor(_vTrim);
			if (_vTrim<0) _vTrim=Math.ceil(_vTrim);

			//LEFT and RIGHT
			/*if (_gamepad.axes[0]*(_vx-_vxMean)>0) _vx=_vxMean;

			//_vx-=Math.round(_gamepad.axes[0])*_ax;
			_vx-=_gamepad.axes[0]*_ax;
			_vx=clamp(_vx, _vxmin, _vxmax);

			if (Math.abs(_gamepad.axes[0])<_epsilonGamepad && _vx!==_vxMean){
				_vx+=(_vx>_vxMean)?-_ax:_ax;
			}*/

			//GO FORWARD (second rotor)
			/*if (_gamepad.axes[1]*_vy>0) _vy=0;
			_vy-=_gamepad.axes[1]*_ay;
			_vy=clamp(_vy, _vymin, _vymax);

			if (Math.abs(_gamepad.axes[1])<_epsilonGamepad && _vy!==0){
				_vy+=(_vy>0)?-_ay:_ay;
			}*/
			_vy=(-_gamepad.axes[1]+1)/2;
			_vy=_vymin+_vy*(_vymax-_vymin);
			if (_vy>=0) _vy=Math.floor(_vy);
			if (_vy<0) _vy=Math.ceil(_vy);

			if (Math.abs(_vy)<_ay){
				_vyFront=0;
				_vyBack=1;
			} else if (_vy>0){
				_vyFront=3;
				_vyBack=0;
			} else {
				_vyFront=0;
				_vyBack=3;
			}
			//var vyNorm=(_vy-_vymin)/(_vymax-_vymin);
			//_vPrefixe=Math.floor(_vPrefixeMin+(_vPrefixeMax-_vPrefixeMin)*vyNorm);


			if (_gamepad.buttons[0].value===1) {
				Console.log('*** Helico UP MAX ***');
				_vz=_vzmax;
			}
			if (_gamepad.buttons[2].value===1) {
				if (__hexaMode) {
				  __hexaMode=false;
				  console.log('Disable hexa mode');
				  Console.log('Disable hexa mode');
				}
				Console.log('*** Helico DOWN MAX ***');
				_vz=_vzmin;
			}
      

			if (_counter%6===0 && Socket.is_running() && !__hexaMode){
				var msg=Math.round(_vx)+'|'+_vz+'|'+Math.abs(Math.round(_vy))+'|'+_vTrim+'|'+_vyFront+'|'+_vyBack+'|'+_vBalance;
				Socket.send(msg);
				if (_counter%(6*4)===0){
					Console.log('speeds : '+msg);
				}
			}
			//console.log(_vx, _vz, _vy, _vTrim);

			++_counter;
		}, //end animate_physics();

		reset: function() {
			_vz=_vzmin;
		}
	}; //end that

	return that;
})(); //end Gamepad()
