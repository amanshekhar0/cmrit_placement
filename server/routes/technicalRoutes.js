const express = require('express');
const router = express.Router();
const TechnicalQuestion = require('../models/TechnicalQuestion');
const escapeRegex = require('../utils/escapeRegex');

// GET /api/technical - Get all technical question entries
router.get('/', async (req, res) => {
  try {
    const { company, year, page, limit } = req.query;
    const filter = {};
    if (company) filter.company = new RegExp(escapeRegex(company), 'i');
    if (year) filter.year = year;

    let query = TechnicalQuestion.find(filter).sort({ company: 1, year: 1 });

    // Optional pagination
    if (page && limit) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      query = query.skip(skip).limit(parseInt(limit));
    }

    const data = await query;
    const total = await TechnicalQuestion.countDocuments(filter);

    res.json({
      success: true,
      count: data.length,
      total,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/technical/:id - Get single entry by ID
router.get('/:id', async (req, res) => {
  try {
    const entry = await TechnicalQuestion.findOne({ id: req.params.id });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/technical/company/:company - Get entries by company name
router.get('/company/:company', async (req, res) => {
  try {
    const data = await TechnicalQuestion.find({
      company: new RegExp(escapeRegex(req.params.company), 'i')
    }).sort({ year: 1 });

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/technical/year/:year - Get entries by year
router.get('/year/:year', async (req, res) => {
  try {
    const data = await TechnicalQuestion.find({ year: req.params.year }).sort({ company: 1 });
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/technical - Create new entry
router.post('/', async (req, res) => {
  try {
    const entry = await TechnicalQuestion.create(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Entry with this ID already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/technical/:id - Update entry by ID
router.put('/:id', async (req, res) => {
  try {
    const entry = await TechnicalQuestion.findOneAndUpdate(
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

// DELETE /api/technical/:id - Delete entry by ID
router.delete('/:id', async (req, res) => {
  try {
    const entry = await TechnicalQuestion.findOneAndDelete({ id: req.params.id });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, message: 'Entry deleted', data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
