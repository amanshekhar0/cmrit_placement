const express = require('express');
const router = express.Router();

const TechnicalQuestion = require('../models/TechnicalQuestion');
const HRQuestion = require('../models/HRQuestion');
const Answer = require('../models/Answer');
const { optionalAuth, attachAccess } = require('../middleware/subscriptionMiddleware');
const { verifyAdmin } = require('../middleware/authMiddleware');
const { adminLimiter } = require('../middleware/rateLimiter');
const { getCachedAnswers, ensureAnswer } = require('../utils/answerService');
const { sampleTechnical, sampleHr } = require('../utils/sampleQuestions');
const { slugify } = require('../utils/slug');

// GET /api/answers/company/:slug
//
// Answers for the questions the caller is actually allowed to see on that
// company's page. The visible set is recomputed here through the SAME sampling
// helper the question routes use -- deriving it independently would let the two
// drift and start leaking answers to locked questions.
router.get('/company/:slug', optionalAuth, attachAccess, async (req, res) => {
  try {
    const { slug } = req.params;
    const paid = req.access.questions;

    const [techAll, hrAll] = await Promise.all([
      TechnicalQuestion.find(),
      HRQuestion.find(),
    ]);

    const tech = techAll
      .filter((e) => slugify(e.company || '') === slug)
      .map((e) => sampleTechnical(e, paid));
    const hr = hrAll
      .filter((e) => slugify(e.company || '') === slug)
      .map((e) => sampleHr(e, paid));

    const visible = [
      ...tech.flatMap((e) => e.technical_questions || []),
      ...tech.flatMap((e) => e.programming_questions || []),
      ...hr.flatMap((e) => e.hr_questions || []),
    ].filter(Boolean);

    if (!visible.length) {
      return res.json({ success: true, count: 0, answers: {} });
    }

    const answers = await getCachedAnswers(visible);
    res.json({ success: true, count: Object.keys(answers).length, answers });
  } catch (error) {
    console.error('answers/company error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/answers/stats — coverage, for the admin panel and the generator.
router.get('/stats', async (req, res) => {
  try {
    const [tech, hr, generated] = await Promise.all([
      TechnicalQuestion.find().select('technical_questions programming_questions'),
      HRQuestion.find().select('hr_questions'),
      Answer.countDocuments(),
    ]);

    const total =
      tech.reduce(
        (n, e) => n + (e.technical_questions || []).length + (e.programming_questions || []).length,
        0
      ) + hr.reduce((n, e) => n + (e.hr_questions || []).length, 0);

    res.json({
      success: true,
      // `total` counts every occurrence; `generated` counts unique questions,
      // so coverage can look low even when every distinct question is done.
      totalQuestionInstances: total,
      uniqueAnswersGenerated: generated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/answers/generate — admin-only single generation, for spot fixes.
router.post('/generate', adminLimiter, verifyAdmin, async (req, res) => {
  try {
    const { question, type = 'Technical', force = false } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ success: false, message: 'question is required' });
    }
    const { answer, created } = await ensureAnswer(question, type, { force });
    res.json({ success: true, created, data: { question: answer.question, answer: answer.answer } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
