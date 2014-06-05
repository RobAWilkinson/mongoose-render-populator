var async = require("async");
var generateValue = require("./generatevalue.js");
var mpath = require("mpath");
module.exports = {

builder: function(mongoose,modelname, next){
  var secondpass = [];
  var model = mongoose.model(modelname);
  var paths = [];
  for(var i in model.schema.paths){
    paths.push(model.schema.paths[i]);
  }
  var newDoc = new model();
  async.each(paths,function(path,next){
    
    if(path.path.match(/^_/))
      return next();
    if(path.hasOwnProperty("caster")){
      var items = Math.random()*10;
      async.times(items,function(item,next){
        generateValue.call(newDoc, path, path.caster.instance,function(value, ref){
	  if(typeof ref != "undefined"){
	    secondpass.push(ref);
	    next();
	  }else
            next(value);
        });
      },function(values){
          mpath.set(path.path,values,newDoc);
          next();
      });
    }else
      generateValue.call(newDoc,path,path.instance,function(value,ref){
	if(typeof ref != "undefined"){
	  secondpass.push(ref);
	}else
	   mpath.set(path.path,value,newDoc);
        next();
      });
  },function(){
    console.log("completed doc")
    next(newDoc,secondpass);
  });
},
secondPass: function(mongoose,secondpass,next){
	console.log(secondpass.length);
      async.eachSeries(secondpass,function(item, next){
          var ci = item.instance;
          var cp = item.path;
          if(cp.hasOwnProperty("caster")){
            buildOID(cp.caster.options.ref, function(err,doc){
              if(err)throw err;
		console.log(cp.path);
		if(typeof ci[cp.path] == "undefined")
			ci[cp.path] = [];
              ci[cp.path].push(doc._id);
              ci.save(function(err){
		if(err) throw err;
                next();
              });
            });
          }else
            buildOID(cp.options.ref, function(err, doc){
              if(err)
                throw err;
              mpath.set(cp.path,doc._id,ci);
              ci.save(function(err){
                if(err)
                  throw err;
                next();
              });
            });
        }, function(){
          next();
        }
      );

function buildOID(modelname, next){
    var model = mongoose.model(modelname)
    model.count(function(err, count) {
      if (err) {
        throw err;
      }
      var rand = Math.floor(Math.random() * count);
      model.findOne().skip(rand).exec(next);
    });
  }
}

};

