var wavcreate = require("../reusables/wavcreate")

var randoms =[];
var freqs = [];
for(var i=0;i<2;i++){
	randoms[i] = Math.random()/5;
	freqs[i] = randomPitch();
}

var sops = {
	filename: __dirname+"/../generated_files/random.wav",
	length: 10,
	num_channels: 2,
	pitchHandler: function(time,channel){
		if(randoms[channel] < time){
			freqs[channel] = wavcreate.randomPitch();
			randoms[channel] = time+Math.random()/5;
		}
		return freqs[channel];
	}
};
wavcreate(sops,function(err){
	if(err)
		throw err;
	process.nextTick(function(){
		console.log("finished sound");
	});
});

function randomPitch(){
	var keyNumber = Math.floor(Math.random()*12);
	var octave = Math.floor(Math.random()*6)+3; 
	return freqFromKey(keyNumber, octave);
}

function freqFromKey(keyNumber, octave){
	if (keyNumber < 3) {
	keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1; 
	} else {
	keyNumber = keyNumber + ((octave - 1) * 12) + 1; 
	}
	return 440 * Math.pow(2, (keyNumber- 49) / 12)
}

