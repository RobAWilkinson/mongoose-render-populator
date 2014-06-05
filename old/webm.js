var webmcreate = require("../reusables/webmcreate.js");
var wavcreate = require("../reusables/wavcreate");

var options = {
	length:10,
	width:100,
	height:100,
	num_channels:2,
	filename:__dirname+"/../generated_files/video.webm"
};

var dotposition = [
	Math.floor(Math.random()*options.width),
	Math.floor(Math.random()*options.height)
];
var lastframe = 0;

options.pixleHandler = function(frame, w, h){
	if(lastframe != frame){
		dotposition[0] += Math.round((.5-Math.random())*1.5);
		dotposition[1] += Math.round((.5-Math.random())*1.5);
		lastframe = frame;
	}
	if(dotposition[0] <= w+1 && dotposition[0] >= w-1
	&& dotposition[1] <= h+1 && dotposition[1] >= h-1){
		return [0,0,0,255];
	}else{
		return [255,255,255,255];
	}
};

var currentpitch = [
	wavcreate.randomPitch(),
	wavcreate.randomPitch()	
];

options.pitchHandler = function(time,channel){
	currentpitch[channel] += Math.round((Math.random()-.5)*2*time);
	return currentpitch[channel];
};
webmcreate(options, function(err,path){
	console.log("Video at: "+path);
});

