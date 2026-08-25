const mongoose = require('mongoose');

/**
 * A cached, pre-generated answer for one interview question.
 *
 * Keyed by a hash of the NORMALISED question text rather than by company, so
 * the ~40% of questions that recur across drives ("explain OOP pillars",
 * "difference between an abstract class and an interface") are generated and
 * stored exactly once instead of per-company.
 */
const answerSchema = new mongoose.Schema({
  // sha256 of the normalised question, truncated. Stable across runs.
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // The question as first seen, kept for auditing and regeneration.
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  // Which model produced it, so a future model upgrade can target stale rows.
  model: {
    type: String,
    required: true,
  },
  // Technical / Programming / HR — steers the prompt and the rendering.
  type: {
    type: String,
    enum: ['Technical', 'Programming', 'HR'],
    default: 'Technical',
  },
  tokensUsed: {
    type: Number,
    default: 0,
  },
  // Bumped when an answer is regenerated, so we can tell edits from first runs.
  revision: {
    type: Number,
    default: 1,
  },
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
