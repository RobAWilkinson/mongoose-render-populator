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
  cockroach_videos: {
    type: "Video"
  }
});

module.exports = mongoose.model('ApartmentManager', schema);
