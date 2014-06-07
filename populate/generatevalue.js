var fs = require("fs");

var pgens = {};

var files = fs.readdirSync(__root+"/generators");
files.forEach(function(file){
pgens[file.substring(0,file.indexOf("."))] = require(__root+"/generators/"+file);
});



module.exports = function (path, type, next){
  var ran = Math.random();
	if(typeof type == "undefined"){
		throw new Error("undefined path type");
	}
console.log(type);

console.log(pgens.hasOwnProperty(type));
  if(pgens.hasOwnProperty(type)){
    return pgens[type](next);
  }
  switch(type){
    case "Mixed":
      var nm = ["Boolean", "Number", "String", "Date", "ObjectID"];
      ran = Math.floor(ran*4);
      return generateValue(nm[ran],next);
    case "Boolean":
      return next(ran < .5);
    case "Number":
      ran *= 5000;
      return next(ran);
    case "String":
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ";
      for(var i=0;i<16;i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      return next(text);
    case "Date":
      return next(new Date());
    case "ObjectID":
     return next(void(0),{instance:this,path:path});
  }
}
