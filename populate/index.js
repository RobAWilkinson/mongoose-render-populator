var mpath = require("mpath");
var async = require("async");
var buildDoc = require("./buildDoc");
var fs = require("fs");

var popular = function(mongoose){
  mongoose.connection.db.dropDatabase();
  var modelnames = mongoose.modelNames();
  var or = [];//{model_of_property_holder, id_of_property_holder, path_of_property}

  async.each(modelnames,function(modelname, next){
      var items = Math.random()*100;
      async.times(items,function(n, snext){
          buildDoc.builder(mongoose,modelname,function(doc,refs){
	    if(typeof refs != "undefined"){
		    or = or.concat(refs);
		}
	    if(typeof doc == "undefined")
		snext();
            doc.save(function(err, doc){
            if(err)
              throw err;
            snext();
            });
          });
      },function(){
          next();
      });
    },function(){
      buildDoc.secondPass(mongoose,or,function(){
          mongoose.disconnect();
          console.log("done");
          process.exit(1);
      });
    }
  );
};


module.exports = popular;
