function Mime64(mimetype, data){
  this.mimetype = "application/octet-stream";
  this.data = "";
  this.regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
	var ret;
  if(arguments.length == 0){
  }else if(arguments.length == 1){
    if(Buffer.isBuffer(mimetype)){
      ret = this._fromBuffer(mimetype);
    }else if(typeof mimetype == "string")
      ret = this._fromSource(mimetype);
    else if(typeof mimetype == "object"){
      console.log("_bsontype" in mimetype);

      if("_bsontype" in mimetype && mimetype._bsontype == "Binary"){
        console.log(mimetype._bsontype);
        ret = this._fromBuffer(mimetype.buffer);
      }else
        ret = this._fromJSON(mimetype);
    }
    if(typeof ret == "undefined")
      throw new Error("Mime64: Objects can only be created from valid strings, json or using arguments");
    this.mimetype = ret[0];
    this.data = ret[1];
  }else{
    if(typeof data == "undefined" || data == "" || data === null)
      this.data = "";
    else if(Buffer.isBuffer(data)){
      this.data = data;
    }else if(typeof data == "string"){
      if(!data.match(b64regex))
        throw new Error("Mime64: the data is not a valid base64 encoded string");
      this.data = new Buffer(data, "base64");
    }
  }

  this.size = this.data.length*8;

}

Mime64.prototype.HTTPRequest = function(res){
var zlib = require('zlib');
  console.log("sending");
console.log(this.data.readUInt16LE(0));
console.log(this.data.toString(0,1, "utf8"));
console.log(this.mimetype);
console.log(this.data.length);
console.log(this.size/8);
//console.log(this.data.toString("hex"));
  res.status(200);
  res.set({
  'Content-Type': this.mimetype,
  'Content-Length': this.data.length,
  'Content-Transfer-Encoding': '8bit'
  });
  res.send(this.data);
}

Mime64.prototype._fromBuffer = function(buff){
  var ret = [];
  var count = buff.slice(0,2);
  count = buff.readUInt16LE(0);
  ret[0] = buff.slice(2,count+2);
  ret[0] = ret[0].toString('utf-8', 0, ret[0].length);
  console.log(count);
  console.log(ret[0]);
  ret[1] = buff.slice(2+count,buff.length);
  return ret
}

Mime64.prototype._fromJSON = function(value){
  if(!(typeof value == "object"))
    throw new Error("Mime64: first argument needs to be a valid JSONObject when using fromJSON");
  if(!("mimetype" in value) || !("data" in value)){
    var err = "Missing Property when creating Mime64 object: ";
    if(!("mimetype" in value))
      err += "\nMissing property \"mimetype\"."
    if(!("data" in value))
      err += "\nMissing property \"data\"."
    throw new Error("Mime64: "+err);
  }
  var mimetype = value.mimetype;
  var data = "";
  if(Buffer.isBuffer(value.data))
    data = value.data;
  if(typeof value.data == "string"){
    if(value.data.match(b64regex))
      data = new Buffer(value.data, "base64");
    else
      throw new Error("Mime64: the data is not a valid base64 encoded string");
    data = value.data;
  }
  return [mimetype, data];
}

Mime64.prototype._fromSource = function(value){
  if(typeof value != "string")
    throw new Error("Mime64: first argument must be a string when using \"fromSource\" method")
  if(value.indexOf("data:") != 0)
    throw new Error("Mime64: Need to specify a header when storing a base64 string")
  var i = value.indexOf(';base64, ');
  if(i == -1)
    throw new Error("Mime64: Need to specify when the data begins");
  var mimetype = value.slice(0,i).substring(value.indexOf(":")+1);
  var data = value.slice(i+9);
  if(!data.match(this.regex))
    throw new Error("Mime64: The data is not a valid base64 encoded string");
  data = new Buffer(data, "base64");
  return [mimetype, data];
}

Mime64.prototype.asBuffer = function(){
  var count = this.mimetype.length;
  var buffed = new Buffer(count+this.mimetype.length);
  buffed.writeUInt16LE(count,0);
  buffed.write(this.mimetype, 2,2+this.mimetype.length,"utf8");
  return Buffer.concat([buffed,this.data],buffed.length+this.data.length);
}

Mime64.prototype.asSource = function(){
  return "data:"+this.mimetype+";base64, "+this.data;
}

if(typeof process != "undefined")
  module.exports = Mime64;

