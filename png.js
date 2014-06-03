var numchunks = 64;
var width = 100;
var height = 100;

var temp;

var crc32 = require("buffer-crc32");
var oldcrc = crc32("");
function calculateCRC(buffer){
return oldcrc = crc32(buffer);
}
var zlib = require("zlib");


function a2hex(str) {
  var arr = [];
  for (var i = 0, l = str.length; i < l; i ++) {
    var hex = Number(str.charCodeAt(i)).toString(16);
    arr.push(hex);
  }
  return arr.join('');
}

function writeChunk(named,array){
var datasize = 0;
for(var i=0;i<array.length;i++){
	var parts = array[i].split("$");
	array[i] = {size:parseInt(parts[0])/8,data:parseInt(parts[1])};
	datasize += parseInt(parts[0])/8;
}
var buffed = [];
buffed[0] = new Buffer(4);
buffed[0].writeUInt32BE(datasize,0);
buffed[1] = new Buffer(4+datasize);
buffed[1].write(named,0,4,"ascii");
var curpos = 4;
for(var i=0;i<array.length;i++){
	if(array[i].size == 1){
		buffed[1].writeUInt8(
			array[i].data, 
			curpos
		);
	}else{
		buffed[1]["writeUInt"+(array[i].size*8)+"BE"](
			array[i].data, 
			curpos
		);
	}
	curpos += array[i].size;
}
buffed[2] = calculateCRC(buffed[1]);

console.log(named+": "+datasize);
return Buffer.concat(buffed);
}

function writeChunkBuff(named, buffer){
var datasize = buffer.length;
var buffed = [];
buffed[0] = new Buffer(4);
buffed[0].writeUInt32BE(datasize,0);
buffed[1] = new Buffer(4+datasize);
buffed[1].writeUInt32BE(parseInt(a2hex(named),16),0);
buffer.copy(buffed[1],4,0,datasize);
buffed[2] = calculateCRC(buffed[1]);

return Buffer.concat(buffed);

}

var butter = [];
butter[0] = new Buffer(8);
butter[0].writeUInt8(137,0);
butter[0].writeUInt8(80,1);
butter[0].writeUInt8(78,2);
butter[0].writeUInt8(71,3);
butter[0].writeUInt8(13,4);
butter[0].writeUInt8(10,5);
butter[0].writeUInt8(26,6);
butter[0].writeUInt8(10,7);

butter[1] = writeChunk("IHDR",[
	"32$"+width,
	"32$"+height,
	"8$"+8,
	"8$"+6,
	"8$"+0,
	"8$"+0,
	"8$"+0
]);


var datatotal = 0;
var async = require("async");
var ca = []; 
var scantots = 0;
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
	var pixles = [];
for(var nn=0;nn<width;nn++){
	var pixle = Buffer(4);
	var average = []
	for(var i=0;i<4;i++){
	average[i] = colors[0][i]*nn/width
	average[i] += colors[1][i]*(width-nn)/width
	average[i] += colors[2][i]*n/height
	average[i] += colors[3][i]*(height-n)/height
	average[i] = Math.floor(average[i]/2);
	console.log(average[i]);
	pixle.writeUInt8(average[i],i);
	}

	pixles[nn] = pixle;
}
pixles.unshift(new Buffer(1));
scanlines[n] = Buffer.concat(pixles);
}
scanlines = Buffer.concat(scanlines);
zlib.deflate(scanlines,function(err,result){
	butter[butter.length] = writeChunkBuff(
		"IDAT",
		result
	);
	butter[butter.length] = writeChunk("IEND",[]);
	finisher();
});

function finisher(){
	var finalBuff = Buffer.concat(butter);
	console.log(finalBuff.toString("hex"));
	var fs = require("fs");
	var fd = fs.openSync(__dirname+"/random.png", 'w');
	fs.writeSync(fd, finalBuff,0,finalBuff.length,0);
}

