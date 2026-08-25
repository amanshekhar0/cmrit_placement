const express = require('express');
const router = express.Router();
const HRQuestion = require('../models/HRQuestion');
const escapeRegex = require('../utils/escapeRegex');
const { verifyAdmin } = require('../middleware/authMiddleware');
const { adminLimiter } = require('../middleware/rateLimiter');
const { optionalAuth, attachAccess } = require('../middleware/subscriptionMiddleware');
const { sampleHr } = require('../utils/sampleQuestions');


// GET /api/hr - Get all HR question entries
router.get('/', optionalAuth, attachAccess, async (req, res) => {
  try {
    const { company, page, limit } = req.query;
    const filter = {};
    if (company) filter.company = new RegExp(escapeRegex(company), 'i');

    let query = HRQuestion.find(filter).sort({ company: 1 });

    // Optional pagination
    if (page && limit) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      query = query.skip(skip).limit(parseInt(limit));
    }

    const data = await query;
    const total = await HRQuestion.countDocuments(filter);

    const paid = req.access.questions;
    res.json({
      success: true,
      count: data.length,
      total,
      hasAccess: paid,
      data: data.map((e) => sampleHr(e, paid)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/hr/:id - Get single entry by ID
router.get('/:id', optionalAuth, attachAccess, async (req, res) => {
  try {
    const entry = await HRQuestion.findOne({ id: req.params.id });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, hasAccess: req.access.questions, data: sampleHr(entry, req.access.questions) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/hr/company/:company - Get entries by company name
router.get('/company/:company', optionalAuth, attachAccess, async (req, res) => {
  try {
    const data = await HRQuestion.find({
      company: new RegExp(escapeRegex(req.params.company), 'i')
    }).sort({ company: 1 });

    const paid = req.access.questions;
    res.json({ success: true, count: data.length, hasAccess: paid, data: data.map((e) => sampleHr(e, paid)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/hr - Create new entry
router.post('/', adminLimiter, verifyAdmin, async (req, res) => {
  try {
    const entry = await HRQuestion.create(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Entry with this ID already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/hr/:id - Update entry by ID
router.put('/:id', adminLimiter, verifyAdmin, async (req, res) => {
  try {
    const entry = await HRQuestion.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/hr/:id - Delete entry by ID
router.delete('/:id', adminLimiter, verifyAdmin, async (req, res) => {
  try {
    const entry = await HRQuestion.findOneAndDelete({ id: req.params.id });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, message: 'Entry deleted', data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
