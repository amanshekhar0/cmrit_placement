const mongoose = require('mongoose');

const technicalQuestionSchema = new mongoose.Schema({
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
  year: {
    type: String,
    required: true,
    index: true
  },
  technical_questions: {
    type: [String],
    default: []
  },
  programming_questions: {
    type: [String],
    default: []
  },
  total_questions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'technical_questions'
});

// Compound index for common queries
technicalQuestionSchema.index({ company: 1, year: 1 });

module.exports = mongoose.model('TechnicalQuestion', technicalQuestionSchema);
