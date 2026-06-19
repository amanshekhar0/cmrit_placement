const express = require('express');
const router = express.Router();
const MustReadQuestion = require('../models/MustReadQuestion');

// GET /api/mustread — all must-read items (public, read-only, like /api/technical).
// Optional ?type=dsa|concept and ?category=Frontend filters.
router.get('/', async (req, res) => {
  try {
    const { type, category } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;

    const data = await MustReadQuestion.find(filter).sort({ type: 1, category: 1, order: 1 });

    // Category list for building tabs on the client.
    const categories = await MustReadQuestion.distinct('category');

    res.json({ success: true, count: data.length, categories: categories.sort(), data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
