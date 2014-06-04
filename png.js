var pngcreate = require("./reusables/pngcreate");

var width = 200;
var height = 200;
var colors = []
for(var i=0;i<4;i++)
	colors[i] = [
		Math.round(Math.random()*255),
		Math.round(Math.random()*255),
		Math.round(Math.random()*255),
		Math.round(Math.random()*128+127)
	];
var scanlines = [];
for(var n=0;n<height;n++){
	scanlines.push([]);
for(var nn=0;nn<width;nn++){
	var average = []
	for(var i=0;i<4;i++){
	average[i] = colors[0][i]*nn/width
	average[i] += colors[1][i]*(width-nn)/width
	average[i] += colors[2][i]*n/height
	average[i] += colors[3][i]*(height-n)/height
	average[i] = Math.floor(average[i]/2);
	}
	scanlines[n][nn] = average;
}
}

pngcreate(scanlines,{filename:__dirname+"/generated_files/random.png"}, function(){

console.log("done");

});

