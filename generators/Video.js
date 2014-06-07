var webmcreate = require("../reusables/webmcreate.js");
var Mime64 = require("../Mime64.js");
var options = {
	length:10,
	width:100,
	height:100,
	num_channels:2
};
module.exports = function(next){

var dotposition = [
	Math.floor(Math.random()*options.width),
	Math.floor(Math.random()*options.height)
];
var lastframe = 0;

options.pixleHandler = function(frame, x, y){
	if(lastframe != frame){
		dotposition[0] += Math.round((.5-Math.random())*1.5);
		dotposition[1] += Math.round((.5-Math.random())*1.5);
		lastframe = frame;
	}
	if(dotposition[0] <= w+1 && dotposition[0] >= w-1
	&& dotposition[1] <= h+1 && dotposition[1] >= h-1){
		scanlines[h][w] = [0,0,0,255];
	}else{
		scanlines[h][w] = [255,255,255,255];
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
webmcreate(options, function(err, data){
	if(err)
		throw err;
	var ret = {mimetype:"video/webm", data:data};
	next(ret);
});
}
