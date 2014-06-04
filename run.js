
var fs = require("fs");
var mongoose_path;
if(process.env.hasOwnProperty("mongoose_path"))
	dbpath = process.env.mongoose_path;
else
	dbpath = __root+"/..";

if(!fs.existsSync(dbpath))
	console.log("warning can't find path");
	if(!fs.existsSync(__dirname+"/"+dbpath)
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

fs.unlinkSync(dbpath+"/models/"+files);

});

var config = require(dbpath+"/config.json");

GLOBAL.__root = __dirname;
GLOBAL.__temp = generateString();
GLOBAL.__mongoose = dbpath;

fs.mkdirSync(__dirname+"/"+__temp);

require(mongoose_path+"/framework/database.js")(config.mongo,true,require("./populate"));

function generateString(){
var text = "";
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ";
for(var i=0;i<16;i++)
  text += possible.charAt(Math.floor(Math.random() * possible.length));
return text;
}
