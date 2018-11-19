const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    required: true,
    minlength: 1
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
  }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = {
  Exercise
}