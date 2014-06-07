var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: {
    type:String,
    required:true
  },
  color: String,
  scale: Number,
  meow: "Sound"
});

var Cat = mongoose.model('Cat', schema);
module.exports = Cat;
