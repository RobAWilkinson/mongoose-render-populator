var pngcreate = require("../reusables/pngcreate");

var colors = []
for(var i=0;i<4;i++)
	colors[i] = [
		Math.round(Math.random()*255),
		Math.round(Math.random()*255),
		Math.round(Math.random()*255),
		Math.round(Math.random()*128+127)
	];


var width =200;
var height =200;

var pops = {
	width:width,
	height:height,
	filename:__dirname+"/../generated_files/random.png",
	pixleHandler:function(w,h){
		var average = []
		for(var i=0;i<4;i++){
		average[i] = colors[0][i]*w/width
		average[i] += colors[1][i]*(width-w)/width
		average[i] += colors[2][i]*h/height
		average[i] += colors[3][i]*(height-h)/height
		average[i] = Math.floor(average[i]/2);
		}
		return average;
	}
};

pngcreate(pops, function(){

console.log("done");

});

