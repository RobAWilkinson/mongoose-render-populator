var pngcreate = require("../reusables/pngcreate");
var Mime64 = require("../Mime64.js");

var width = 200;
var height = 200;

module.exports = function(next){
var colors = []
for(var i=0;i<4;i++)
	colors[i] = [
		Math.round(Math.random()*255),
		Math.round(Math.random()*255),
		Math.round(Math.random()*255),
		Math.round(Math.random()*128+127)
	];



var pops = {
	filename:__root+"/generated_files/random.png",
	pixleHandler:function(nn,n){
		var average = []
		for(var i=0;i<4;i++){
		average[i] = colors[0][i]*nn/width
		average[i] += colors[1][i]*(width-nn)/width
		average[i] += colors[2][i]*n/height
		average[i] += colors[3][i]*(height-n)/height
		average[i] = Math.floor(average[i]/2);
		}
		return average;
	}
};

pngcreate(pops, function(err,path){
if(err)
	throw err;
var ret = new Mime64(path);
fs.unlinkSync(path);
next(ret);
});
}
