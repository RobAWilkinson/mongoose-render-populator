var fs = require("fs");

var wavcreate =  function(options, next){

var num_sec = (options.hasOwnProperty("length"))?options.length:10;
var num_channels = options.hasOwnProperty("num_channels")?options.num_channels:1;
var samplerate = 44100;
var bitspersample = 8;

buffed = new Buffer(44+num_sec*samplerate*bitspersample/8*num_channels);
buffed.write("RIFF",0,4,"ascii");
buffed.writeUInt32LE(
	44-8+num_sec*samplerate*bitspersample/8*num_channels,
	4
);
buffed.writeUInt32BE(0x57415645,8);
buffed.writeUInt32BE(0x666d7420,12);
buffed.writeUInt32LE(16,16);
buffed.writeUInt16LE(1,20);
buffed.writeUInt16LE(num_channels,22);
buffed.writeUInt32LE(samplerate,24);
buffed.writeUInt32LE((samplerate * bitspersample/8 * num_channels),28);
buffed.writeUInt16LE(bitspersample/8*num_channels,32);
buffed.writeUInt16LE(bitspersample,34);
buffed.writeUInt32BE(0x64617461,36,4);
buffed.writeUInt32LE(num_sec*samplerate*bitspersample/8*num_channels,40)

var totalsamples = samplerate*num_sec;

var pi = Math.PI;
vol = .5;
var temp = new Buffer(totalsamples*num_channels*bitspersample/8);

var pitchhandler;

if(options.hasOwnProperty("pitchHandler"))
	pitchhandler = options.pitchHandler;
else
	pitchhandler = function(moment, channelnumber){
		return 440;
	}

for(var i=0;i<totalsamples;i++){
	var temp  = i%samplerate;
	for(var j = 0;j<num_channels;j++){
		var curpitch = pitchhandler(i/totalsamples, j);
		curpitch = 2*pi*curpitch/samplerate;
		curpitch = Math.sin(temp*curpitch);
		curpitch *= Math.pow(2, bitspersample-1) -1*vol;
		curpitch = Math.floor(curpitch);
		buffed.writeInt8(curpitch, 44+i*(bitspersample/8)*2+j*(bitspersample/8));
	}
}
if(options.hasOwnProperty("filename")){
	var fd = fs.openSync(options.filename, 'w');
	fs.write(fd, buffed,0,buffed.length,0, function(err){
		if(err)
			return next(err);
		next(void(0),options.filename);
	});
}else{
	next(void(0),buffed);
}
}

wavcreate.randomPitch = function(){
	var keyNumber = Math.floor(Math.random()*12);
	var octave = Math.floor(Math.random()*6)+3; 
	return wavcreate.waveFromKey(keyNumber, octave);
}

wavcreate.waveFromKey = function(keyNumber, octave){
	if (keyNumber < 3) {
	keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1; 
	} else {
	keyNumber = keyNumber + ((octave - 1) * 12) + 1; 
	}
	return 440 * Math.pow(2, (keyNumber- 49) / 12)
}

module.exports = wavcreate;
