var mongoose = require("mongoose");
var mpath = require("mpath");
var async = require("async");

var pgens = {};

var files = fs.readdirSync(__dirname+"/generators")
files.forEach(function(file){
pgens[file.substring(file.indexOf("."))] = require(__dirname+"/generators");
});

var popular = function(db){
  db.db.dropDatabase();
  var modelnames = mongoose.modelNames();
  var or = [];//{model_of_property_holder, id_of_property_holder, path_of_property}
  async.each(
    modelnames,
    function(modelname, next){
      var items = Math.random()*100;
      async.times(
        items,
        function(n, snext){
          buildDoc(modelname,function(doc){
            doc.save(function(err, doc){
            if(err)
              throw err;
            snext(void(0),doc);
            });
          }
        },
        function(){
          next();
        }
      );
    },
    function(){
      async.eachSeries(or,function(item, next){
          var ci = item.instance;
          var cp = item.path;
          if(cp.hasOwnProperty("caster")){
            buildOID(cp.caster.options.ref, function(err,doc){
              if(err)
                throw err;
              ci[cp.path].push(doc);
              ci.save(function(err){
                if(err)
                  throw err;
                next()
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
          //done
          mongoose.disconnect();
          console.log("done");
          process.exit(1);
        }
      );
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

function buildDoc(modelname){
  var model = mongoose.model(modelname);
  var paths = model.schema.paths;
  var newDoc = new model();
  async.each(paths,function(path,next){
    console.log(j);
    var path = paths[j];
    if(path.path.match(/^_/))
      next();
    if(path.hasOwnProperty("caster")){
      var items = Math.random()*10;
      async.each(items,function(item,next){
        generateValue.call(newDoc, path, path.caster.instance,function(value){
          next(void(0), value);
        });
      },function(err,values){
          mpath.set(path.path,values,newDoc);
          next();
      });
    }else
      generateValue.call(newDoc,path,path.instance,function(value){
        mpath.set(path.path,value,newDoc);
        next();
      });
  },function(values){
    return newDoc;
  });
}


function generateValue(path, type, next){
  var ran = Math.random();
  if(pgens.hasOwnProperty(type))
    return pgens[type](next);

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
      or.push({instance:this,path:path});
     return next();
  }
}

