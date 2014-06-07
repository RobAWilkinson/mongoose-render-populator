var pngcreate = require("../reusables/pngcreate");
var Mime64 = require("../Mime64.js");

var width = 100;
var height = 100;

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
	width:width,
	height:height,
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

pngcreate(pops, function(err,data){
if(err)
	throw err;
var ret = {mimetype:"image/png",data:data};
next(ret);
});
}
