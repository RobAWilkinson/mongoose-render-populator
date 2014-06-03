var num_sec = 600;
var samplerate = 44100;
var bitspersample = 8;
var num_channels = 2;
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

var freqs = [];
var totalsamples = samplerate*num_sec;
var randoms = [];
for(var i=0;i<num_channels;i++){

	randoms[i] = false;
}
console.log(JSON.stringify(freqs));
var pi = Math.PI;
vol = .5;
console.log(totalsamples);
var temp = new Buffer(totalsamples*freqs.length*bitspersample/8);
for(var i=0;i<totalsamples;i++){
	var temp  = i%samplerate;
	for(var j = 0;j<randoms.length;j++){
	if(!randoms[j] || randoms[j] < i/samplerate){
		freqs[j] = newPitch();
		randoms[j] = i/samplerate+Math.random()*5;
	}
	var curpitch = 2*pi*freqs[j]/samplerate;
	var moment = Math.sin(temp*curpitch);
	moment *= Math.pow(2, bitspersample-1) -1*vol;
	moment = Math.floor(moment);
	buffed.writeInt8(moment, 44+i*(bitspersample/8)*2+j*(bitspersample/8));

	}
}
console.log(buffed.length);
console.log(	44-8+num_sec*samplerate*bitspersample/8*num_channels);
var fs = require("fs");
var fd = fs.openSync(__dirname+"/random.wav", 'w');
fs.writeSync(fd, buffed,0,buffed.length,0);

function newPitch(){
	var keyNumber = Math.floor(Math.random()*12);
	var octave = Math.floor(Math.random()*6)+3; 

	if (keyNumber < 3) {
	keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1; 
	} else {
	keyNumber = keyNumber + ((octave - 1) * 12) + 1; 
	}
	return 440 * Math.pow(2, (keyNumber- 49) / 12)
}
