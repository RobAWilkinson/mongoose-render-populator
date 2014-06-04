var sys = require('sys');
var fs = require("fs");
var child = require('child_process');
var exec = child.exec;
var spawn = child.spawn;
var pngcreate = require("./reusables/pngcreate");
var wavcreate = require("./reusables/wavcreate");

GLOBAL.__root = __dirname;

options = {
	width:100,
	height:100,
	length:10
}


if(typeof options == "undefined")
	var options = {};
if(!options.hasOwnProperty("length"))
	options.length = 1;
if(!options.hasOwnProperty("width"))
options.width = 100;

if(!options.hasOwnProperty("height"))
options.height =100;

options.appendix = Array(Math.floor(Math.log(options.length*24))).join("0");


var dotposition = [
	Math.floor(Math.random()*options.width),
	Math.floor(Math.random()*options.height)
];

handleVideo(options,dotposition,0);

//===============Create Video================
function handleVideo(options,dotposition,i){
var numseconds = options.length;
var totalnum = 24*numseconds;
if(totalnum == i)
	return process.nextTick(function(){
	handleAudio(options);
	});
//create a 100x100 png with a randomized object
var scanlines = [];
for(var h=0;h<options.height;h++){
	scanlines.push([]);
for(var w=0;w<options.width;w++){
	if(dotposition[0] <= w+1 && dotposition[0] >= w-1
	&& dotposition[1] <= h+1 && dotposition[1] >= h-1){
	scanlines[h][w] = [0,0,0,255];
	}else{
	scanlines[h][w] = [255,255,255,255];
	}
}
var current = (i+1).toString();
current = options.appendix.substring(0,options.appendix.length-(current.length+1))+current;

}
var buffer = pngcreate(scanlines, {filename:__root+"/temp/vp8png"+current+".png"}, 
function(err, file){
	if(err)
		throw err;
	dotposition[0] += Math.round((.5-Math.random())*1.5);
	dotposition[1] += Math.round((.5-Math.random())*1.5);

	i++;
	console.log("pic "+i+" of "+24*options.length+" done");
	process.nextTick(function(){
		handleVideo(options,dotposition,i);
	});

});
}
//======================Create Sound==============

function handleAudio(options){
var currentpitch = [
	wavcreate.randomPitch(),
	wavcreate.randomPitch()	
];
var sops = {
	filename: __root+"/temp/temp.wav",
	length: options.length,
	num_channels: 2,
	pitchHandler: function(time,channel){
		currentpitch[channel] += Math.round((Math.random()-.5)*2);
		return currentpitch[channel];
	}
};
wavcreate(sops,function(err){
	if(err)
		throw err;
	process.nextTick(function(){
		console.log("finished sound");
		encodeAndReturn(options);
	});
});

}
//===================Encode and return============

function encodeAndReturn(options){

var png2yuvcommand = "png2yuv -I p -f 24 -b 1 -n "+options.length*24+" -j \""+__root+"/temp/vp8png%0"+(options.appendix.length-1)+"d.png\" > \""+__root+"/temp/temp.yuv\"";
var makevideocommand = "vpxenc --good --cpu-used=0 --auto-alt-ref=1 --lag-in-frames=16 --end-usage=vbr --passes=2 --threads=2 --target-bitrate=3000 -o \""+__root+"/temp/temp.webm\" \""+__root+"/temp/temp.yuv\""
var addsoundcommand = "ffmpeg -i \""+__root+"/temp/temp.webm\" -i \""+__root+"/temp/temp.wav\" -map 0:0 -map 1:0 \""+__root+"/generated_files/video.webm\""
exec(png2yuvcommand, function(err, stdout, stderr){
if(stderr)
	console.log(stderr);
if(err)
	throw err;
console.log("yuv");
exec(makevideocommand, function(err, stdout, stderr){
if(err)
	throw err;
console.log("make video");

if(fs.existsSync(__root+"/generated_files/video.webm"))
	fs.unlinkSync(__root+"/generated_files/video.webm")
	

exec(addsoundcommand, function(err, stdout, stderr){
if(err)
	throw err;
console.log("removing");
files = fs.readdirSync(__root+"/temp");
files.forEach(function(file){
	fs.unlinkSync(__root+"/temp/"+file)
});
console.log("finished");
});
});

});

}
