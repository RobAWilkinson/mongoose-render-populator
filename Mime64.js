function Mime64(mimetype, data){
  this.mimetype = "application/octet-stream";
  this.data = "";
  this.regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;

  if(arguments.length == 0){
  }else if(arguments.length == 1){
    if(typeof mimetype == "string")
      ret = this._fromSource(mimetype);
    else if(value instanceof JSONObject)
      ret = this._fromJSON(mimetype);
    else
      throw new Error("Mime64: Objects can only be created from valid strings, json or using arguments");
    this.mimetype = ret[0];
    this.data = ret[1];
  }else{
    if(typeof data == "undefined" || data == "" || data === null)
      this.data = "";
    else if(Buffer.isBuffer(value.data))
      this.data = data.toString("base64");
    else if(typeof value.data == "string"){
      if(!data.match(b64regex))
        throw new Error("Mime64: the data is not a valid base64 encoded string");
      this.data = data;
    }
  }

  this.size = data.length*8;

}

Mime64.prototype.HTTPRequest = function(res){
 res.writeHead(200, {'Content-Type': this.mimetype, "Content-Length": this.data.length });
 res.end(this.data, 'base64');
}

Mime64.prototype._fromJSON = function(value){
  if(!(value instanceof JSONObject))
    throw new Error("Mime64: first argument needs to be a valid JSONObject when using fromJSON");
  if(!value.hasOwnProperty("mimetype") || !value.hasOwnProperty("data")){
    var err = "Missing Property when creating Mime64 object: ";
    if(!value.hasOwnProperty("mimetype"))
      err += "\nMissing property \"mimetype\"."
    if(!value.hasOwnProperty("data"))
      err += "\nMissing property \"data\"."
    throw new Error("Mime64: "+err);
  }
  var mimetype = value.mimetype;
  var data = "";
  if(Buffer.isBuffer(value.data))
    data = value.data.toString("base64");
  if(typeof value.data == "string"){
    if(!value.data.match(b64regex))
      throw new Error("Mime64: the data is not a valid base64 encoded string");
    data = value.data;
  }
  return [mimetype, data];
}

Mime64.prototype._fromSource = function(value){
  if(typeof value == "string")
    throw new Error("Mime64: first argument must be a string when using \"fromSource\" method")
  if(value.index("data:") == -1)
    throw new Error("Mime64: Need to specify a header when storing a base64 string")
  var i = value.indexOf(', ');
  var mimetype = value.slice(0,i).substring(head.indexOf(":"), head.indexOf(";"));
  var data = value.slice(i+2);
  if(!data.match(this.regex))
    throw new Error("Mime64: The data is not a valid base64 encoded string");
  return new [mimetype, data];
}

Mime64.prototype.asSource = function(){
  return "data:"+this.mimetype+";base64, "+this.data;
}

if(typeof process != "undefined")
  module.exports = Mime64;
