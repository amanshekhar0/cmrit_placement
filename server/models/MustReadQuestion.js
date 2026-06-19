const mongoose = require('mongoose');

// A single collection holding both kinds of "Must Read" content:
//  - type 'dsa'     : a coding problem (description, test case, Java solution, complexity)
//  - type 'concept' : a fundamentals Q&A (question + concise answer)
const mustReadSchema = new mongoose.Schema({
  type: { type: String, enum: ['dsa', 'concept'], required: true, index: true },
  category: { type: String, required: true, index: true },
  order: { type: Number, default: 0 },

  // concept fields
  question: { type: String },
  answer: { type: String },

  // dsa fields
  title: { type: String },
  leetcodeId: { type: Number },
  difficulty: { type: String },
  topic: { type: String },
  description: { type: String },
  testCase: {
    input: String,
    output: String,
    explanation: String,
  },
  pseudoCodeJava: { type: String },
  timeComplexity: { type: String },
  spaceComplexity: { type: String },
  leetcodeUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('MustReadQuestion', mustReadSchema);
