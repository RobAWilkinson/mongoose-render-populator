var crc32 = require("buffer-crc32");
var zlib = require("zlib");
var fs = require("fs");

var pngcreate = function(scanlines,options,next){
var numchunks = 64;
var width;
var height;
if(Array.isArray(scanlines[0])){

	options.width = scanlines[0].length;
	options.height = scanlines.length
	scanlines = scanlines2Array(scanlines);
}
if(typeof options == "undefined"){
	width=100;
	height=100;
}else{
	var width = options.hasOwnProperty("width")?options.width:100;
	var height = options.hasOwnProperty("height")?options.height:100;
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

zlib.deflate(getAsBuffer(scanlines),function(err,result){
	if(err){
		throw err
//		return next(err);
	}
	butter[butter.length] = writeChunk(
		"IDAT",
		result
	);
	butter[butter.length] = writeChunk("IEND",[]);
	var finalBuff = Buffer.concat(butter);
	if(options.hasOwnProperty("filename")){
		var fd = fs.openSync(options.filename, 'w');
		fs.write(fd, finalBuff,0,finalBuff.length,0, function(err){
			if(err)
				return next(err);
			next(void(0),options.filename);
		});
	}else{
		next(void(0),finalBuff);
	}
});

}

function writeChunk(named,array){
	var buffed = [];
	buffed[0] = new Buffer(4);
	var temp
	if(Buffer.isBuffer(array))
		temp = array;
	else
		temp = getAsBuffer(array);
	buffed[0].writeUInt32BE(temp.length,0);
	buffed[1] = new Buffer(4+temp.length);
	buffed[1].write(named,0,4,"ascii");
	temp.copy(buffed[1],4,0,temp.length);
	delete temp;
	buffed[2] = crc32(buffed[1]);
	return Buffer.concat(buffed);
}

function getAsBuffer(array){
var datasize = 0;
for(var i=0;i<array.length;i++){
	var parts = array[i].split("$");
	array[i] = {size:parseInt(parts[0])/8,data:parseInt(parts[1])};
	datasize += parseInt(parts[0])/8;
}
var curpos = 0;
var buffed = new Buffer(datasize);
for(var i=0;i<array.length;i++){
	if(array[i].size == 1){
		buffed.writeUInt8(
			array[i].data, 
			curpos
		);
	}else{
		buffed["writeUInt"+(array[i].size*8)+"BE"](
			array[i].data, 
			curpos
		);
	}
	curpos += array[i].size;
}
return buffed;
}

function scanlines2Array(scanlines){
	var initlength = scanlines.length
	for(var h=0;h<initlength;h++){
	scanlines.push("8$0");
		for(var w=0;w<scanlines[0].length;w++){
		scanlines.push(
			"8$"+scanlines[0][w][0],
			"8$"+scanlines[0][w][1],
			"8$"+scanlines[0][w][2],
			"8$"+scanlines[0][w][3]
		);
		}
	scanlines.shift();
	}

	return scanlines;
}

module.exports = pngcreate;

