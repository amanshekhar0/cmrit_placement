const mongoose = require('mongoose');

const hrQuestionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    index: true
  },
  years: {
    type: [String],
    default: []
  },
  hr_questions: {
    type: [String],
    default: []
  },
  total_questions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'hr_questions'
});

module.exports = mongoose.model('HRQuestion', hrQuestionSchema);
