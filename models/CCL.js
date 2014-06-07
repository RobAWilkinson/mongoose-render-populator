var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: {
    first:{
      type: String,
      required: true
    },
    last:{
      type: String,
      required: true
    }
  },
  location: {
    latitude:{
      type: Number,
      required: true
    },
    longitude:{
      type: Number,
      required: true
    }
  },
  Cats: [{type: mongoose.Schema.Types.ObjectId, ref:"Cat"}],
  grimy_window: "Image"
});

var CrazyCatLady = mongoose.model('CrazyCatLady', schema);
module.exports = CrazyCatLady;
