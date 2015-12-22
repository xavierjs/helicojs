/*
spec : helico : instance of Helico

*/
var HelicoLeapController=(function() {
	var _settings={
		verticalSensibility: 1.5, //higher -> more sensitive
		forwardSensibility: 1.1, //higher -> more sensitive
		rotationSensibility: 1.1, //higher -> more sensitive
		vTrimMean: 71,
		vxMean: 0x50,
		vxThreshold: 0x10,
		vyThreshold: 0x20
	};

	var _modes={
		idle: 0,   //nothing to do
		waiting: 1, //1 closed hand
		pilot: 2
	};

	var _mode=_modes.idle;

	var _helico=false;
	var _palmPosition0=[0,0,0];
	var _palmEuler=[0,0,0];
	var _angle0=0;
	var _vx=0, _vy=0, _vz=0;

	var clamp=function(x,min,max){
		return Math.min(Math.max(x, min), max);
	};

	var landOn=function() {
		_vz=0;
		_vx=0;
		_vy=0;
	};

	var takeOff=function() {
		_vz=0xFF;
		_vx=0;
		_vy=0;
	};

	var process_verticalSpeed=function(palmPosition){
		var dy=_settings.verticalSensibility*(_palmPosition0[1]-palmPosition[1]);
		_vz=0xFF-clamp(Math.round(dy), 0, 0xFF);
		//console.log(_vz);
	};

	var process_forwardSpeed=function(tanPhi) {
		_vy=Math.round(-tanPhi*0xFF*_settings.forwardSensibility);
		_vy=clamp(_vy, -0xFF, 0xFF);
		//console.log(_vy);
	};

	var process_rotationSpeed=function(tanTheta) {
		_vx=Math.round(tanTheta*0xFF*_settings.rotationSensibility);
		_vx=clamp(_vx, -0xFF, 0xFF);
		//console.log(_vx);
	};



	var _controller, _isConnected=false;

	var that = {
		init: function(spec) {
			_controller = new Leap.Controller({enableGestures: false});

			_controller.on('deviceConnected', function() {
			  Console.log("LEAP MOTION CONNECTED YEAH !");
			  _isConnected=true;
			});

			_controller.on('deviceDisconnected', function() {
			  console.log("LEAP MOTION DISCONNECTED :(");
			  	_isConnected=false;
			});

			_controller.loop(function(frame) {
		        that.process(frame);		       
		    });
		}, //end init()

		is_connected: function() {
			return _isConnected;
		},

		process: function(data){
			switch(_mode){
				case _modes.idle:
					if (data.hands.length!==1) return;
					if (data.hands[0].fingers.length<3) {
						_mode=_modes.waiting;
						console.log('INFO in HelicoLeapController - process() : entering waiting mode...');
						landOn();
						return;
					}			
					break;

				case _modes.waiting:
					if (data.hands.length===0) {
						_mode=_modes.idle;
						console.log('INFO in HelicoLeapController - process() : go back idle mode...');
						return;
					}
					if (data.hands[0].fingers.length>=3){
						console.log('INFO in HelicoLeapController - process() : entering pilot mode - take off !');
						_palmPosition0[0]=data.hands[0].palmPosition[0];
						_palmPosition0[1]=data.hands[0].palmPosition[1];
						_palmPosition0[2]=data.hands[0].palmPosition[2];
						//_angle0=data.hands[0].fingers[0]
						_angle0=Math.atan2(data.hands[0].direction[2], data.hands[0].direction[0]); //   dz/dx
						takeOff();
						_mode=_modes.pilot;
					}
					break;

				case _modes.pilot:
					if (data.hands.length===0){
						console.log('INFO in HelicoLeapController - process() : go back idle mode... (no hand)');
						landOn();
						_mode=_modes.idle;
						return;
					}
					if (data.hands[0].fingers.length===0) {
						console.log('INFO in HelicoLeapController - process() : go back idle mode... (hand closed)');
						landOn();
						_mode=_modes.idle;
					}

					//compute euler angles of the palm
					var nx=data.hands[0].palmNormal[0];
					var ny=data.hands[0].palmNormal[1];
					var nz=data.hands[0].palmNormal[2];

					//compute alpha ( yaw correction )
					var alpha=Math.atan2(data.hands[0].direction[2], data.hands[0].direction[0])-_angle0;
					var ca=Math.cos(alpha), sa=Math.sin(alpha);

					//rotate n around(Oy)
					var nxa=ca*nx+sa*nz;
					var nya=ny;
					var nza=-sa*nx+ca*nz;					
					
					var tanTheta = nxa/nya; //theta -> roll
					var tanPhi = nza/nya;   //phi -> pitch

					//console.log(alpha);
					//console.log(tanTheta);
					//console.log(tanPhi);
					process_verticalSpeed(data.hands[0].palmPosition);
					process_forwardSpeed(tanPhi);
					process_rotationSpeed(tanTheta);

					break;	
			} //end switch mode
		}, //end process()

		get_msg: function() {

			//RIGHT OR LEFT
			var vBalance, vTrim,vx;
			var ga0=_vx/0xFF;
			if (Math.abs(_vx)<_settings.vxThreshold) {
				//no turn
				vTrim=_settings.vTrimMean;
				vBalance=4;
				vx=_settings.vxMean;
			} else if (_vx>0){
				//right turn
				vTrim=_settings.vTrimMean+ga0*(0xFF-_settings.vTrimMean);
				vx=_settings.vxMean+ga0*(0xFF-_settings.vxMean);
				vBalance=7;
				//_vx=_vxmin;
			} else if (_vx<0){
				//left turn
				vBalance=1;
				//_vx=_vxmax;
				vTrim=_settings.vTrimMean+ga0*_settings.vTrimMean;
				vx=_settings.vxMean+ga0*_settings.vxMean;
			}

			vx=Math.floor(vx);
			vTrim=Math.floor(vTrim);


			//FORWARD or BACKWARD
			var vyFront, vyBack;
			if (Math.abs(_vy)<_settings.vyThreshold){
				vyFront=0;
				vyBack=1;
			} else if (_vy>0){
				vyFront=3;
				vyBack=0;
			} else {
				vyFront=0;
				vyBack=3;
			}

			var vyCool=Math.abs(_vy);
			if (vyCool<_settings.vyThreshold){
				vyCool=0;
			} else {
				vyCool=0xFF*(vyCool-_settings.vyThreshold)/(0xFF-_settings.vyThreshold);
			}

			

			var msg=vx+'|'+_vz+'|'+Math.round(vyCool)+'|'+vTrim+'|'+vyFront+'|'+vyBack+'|'+vBalance;
			return msg;
		} //end get_msg()
	}; //end that
	return that;
}) ();
