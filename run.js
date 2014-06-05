var fs = require("fs");
var ncp = require("ncp");
var async = require("async");
var mongoose_path;
if(process.env.hasOwnProperty("mongoose_path")){
	dbpath = process.env.mongoose_path;
	console.log(dbpath);	
}else
	dbpath = __root+"/..";

if(!fs.existsSync(dbpath))
	console.log("warning can't find path");
	if(!fs.existsSync(__dirname+"/"+dbpath))
		throw new Error("Non-exsistant path");
	else
		dbpath = __dirname+"/"+dbpath;

if(fs.readdirSync(dbpath+"/models").length > 0 
&& (!process.env.hasOwnProperty("force") || !process.env.force))
	throw new Error("In order to populate, its preferable to have a clean setup.\n"+
			"Especially since this be deleting all documents in your database.\n"+
			"If you don't care add -force=true");

var files = fs.readdirSync(dbpath+"/models");
files.forEach(function(file){
fs.unlinkSync(dbpath+"/models/"+file);
});

var config = require(dbpath+"/config.json");

GLOBAL.__root = __dirname;
GLOBAL.__mongoose = dbpath;

var files = fs.readdirSync(__dirname+"/models");

async.each(files,function(file, next){
	ncp(
		__dirname+"/models/"+file,
		__mongoose+"/models/"+file,
		function(){
			next();
		}
	);
},function(end){
require(__mongoose+"/framework/database.js")(config.mongo,true,require("./populate"));

});



