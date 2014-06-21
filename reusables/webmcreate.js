var sys = require('sys');
var fs = require("fs");
var child = require('child_process');
var exec = child.exec;
var spawn = child.spawn;
var ncp = require("ncp");
var pngcreate = require("./pngcreate");
var wavcreate = require("./wavcreate");

var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";


module.exports = function(_options, next){

if(typeof _options == "undefined")
	throw new Error("need to specify options");
if(!_options.hasOwnProperty("length"))
	throw new Error("need to specify video length:options.length");
if(!_options.hasOwnProperty("width"))
	throw new Error("need to specify frame width:options.width");
if(!_options.hasOwnProperty("height"))
	throw new Error("need to specify frame height:options.height");
if(!_options.hasOwnProperty("pixleHandler"))
	throw new Error("need to specify a pixle Handler:options.pixleHandler");
if(!_options.hasOwnProperty("pitchHandler"))
	throw new Error("need to specify a pitch Handler:options.pitchHandler");
if(!_options.hasOwnProperty("num_channels"))
	throw new Error("need to specify number of channels:options.num_channels");
var options = {};
for(var i in _options){
	options[i] = _options[i];
}
options.appendix = Array(Math.floor(Math.log(options.length*24))).join("0");

options.callback = next;

while(true){
var __temp = "";
for(var i=0;i<16;i++)
__temp += possible.charAt(Math.floor(Math.random() * possible.length));

if(!fs.existsSync(__dirname+"/"+__temp)){
	fs.mkdirSync(__dirname+"/"+__temp);
	break;
}
}
options.temp = __dirname+"/"+__temp;

handleVideo(options,0);
}

//===============Create Video================
function handleVideo(options,i){
var __temp = options.temp;

var numseconds = options.length;
var totalnum = 24*numseconds;
if(totalnum == i)
	return process.nextTick(function(){
		handleAudio(options);
	});
var current = (i+1).toString();
current = options.appendix.substring(0,options.appendix.length-(current.length+1))+current;
var pops = {
	width:options.width,
	height:options.height,
	pixleHandler:function(w,h){
		return options.pixleHandler(i,w,h);
	},
	filename:__temp+"/vp8png"+current+".png"
};

var buffer = pngcreate(pops,
function(err, file){
	if(err)
		return options.callback(err);
	i++;
	console.log("pic "+i+" of "+24*options.length+" done at:"+file);
	process.nextTick(function(){
		handleVideo(options,i);
	});

});
}
//======================Create Sound==============

function handleAudio(options){
var __temp = options.temp;
var currentpitch = [
	wavcreate.randomPitch(),
	wavcreate.randomPitch()
];
var sops = {
	filename: __temp+"/temp.wav",
	length: options.length,
	num_channels: options.num_channels,
	pitchHandler: options.pitchHandler
};
wavcreate(sops,function(err){
	if(err)
		return options.callback(err);
	process.nextTick(function(){
		console.log("finished sound");
		encodeAndReturn(options);
	});
});

}
//===================Encode and return============

function encodeAndReturn(options){
var __temp = options.temp;
var png2yuvcommand = "png2yuv -I p -f 24 -b 1 -n "+options.length*24+" -j \""+__temp+"/vp8png%0"+(options.appendix.length-1)+"d.png\" > \""+__temp+"/temp.yuv\"";

var makevideocommand = "vpxenc --good --cpu-used=0 --auto-alt-ref=1 --lag-in-frames=16 --end-usage=vbr --passes=2 --threads=2 --target-bitrate=3000 -o \""+__temp+"/temp.webm\" \""+__temp+"/temp.yuv\""

var addsoundcommand = "-i \""+__temp+"/temp.webm\" -i \""+__temp+"/temp.wav\" -map 0:0 -map 1:0 \""+__temp+"/temp.webm\""

exec(png2yuvcommand, function(err, stdout, stderr){
if(stderr)
	console.log(stderr);
if(err)
	return options.callback(err);
console.log("yuv");
exec(makevideocommand, function(err, stdout, stderr){
if(err)
	return options.callback(err);
console.log("make video");
var addsound = spawn("ffmpeg", addsoundcommand);

addsound.on("error", function(e){
	console.log(e);
	throw new Error("Couldn't ocmbine sound and video");
});
addsound.on("message", function(e){
	console.log("S+V Progress: "+e);
});
addsound.on("close", function(e){
console.log("removing");

if(options.hasOwnProperty("filename")){
	return ncp(__temp+"/temp.webm", options.filename, function (err) {
		files = fs.readdirSync(__temp);
		files.forEach(function(file){
			fs.unlinkSync(__temp+"/"+file)
		});
		fs.rmdirSync(__temp);
		if (err) {
			return next(err);
		}
		options.callback(void(0), options.filename);
	});
}
var stats = fs.statSync(__temp+"/temp.webm");
var buffed = new Buffer(stats.size);
var fd = fs.openSync(__temp+"/temp.webm","r");
fs.readSync(fd,buffed,0,stats.size,0);
fs.closeSync(fd);

files = fs.readdirSync(__temp);
files.forEach(function(file){
	fs.unlinkSync(__temp+"/"+file)
});
fs.rmdirSync(__temp);

options.callback(void(0),buffed);
});
});

});

}
