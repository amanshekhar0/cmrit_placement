const express = require('express');
const router = express.Router();
const TechnicalQuestion = require('../models/TechnicalQuestion');
const HRQuestion = require('../models/HRQuestion');

// GET /api/stats - Get aggregate statistics
router.get('/', async (req, res) => {
  try {
    // Get technical stats
    const techEntries = await TechnicalQuestion.countDocuments();
    const techCompanies = await TechnicalQuestion.distinct('company');
    const techYears = await TechnicalQuestion.distinct('year');
    const techQuestionsAgg = await TechnicalQuestion.aggregate([
      {
        $project: {
          techCount: { $size: '$technical_questions' },
          progCount: { $size: '$programming_questions' }
        }
      },
      {
        $group: {
          _id: null,
          totalTechnical: { $sum: '$techCount' },
          totalProgramming: { $sum: '$progCount' }
        }
      }
    ]);

    // Get HR stats
    const hrEntries = await HRQuestion.countDocuments();
    const hrCompanies = await HRQuestion.distinct('company');
    const hrQuestionsAgg = await HRQuestion.aggregate([
      {
        $project: {
          hrCount: { $size: '$hr_questions' }
        }
      },
      {
        $group: {
          _id: null,
          totalHR: { $sum: '$hrCount' }
        }
      }
    ]);

    // Combine unique companies from both collections
    const allCompanies = [...new Set([...techCompanies, ...hrCompanies])].sort();

    const techTotals = techQuestionsAgg[0] || { totalTechnical: 0, totalProgramming: 0 };
    const hrTotals = hrQuestionsAgg[0] || { totalHR: 0 };

    res.json({
      success: true,
      data: {
        technical: {
          entries: techEntries,
          companies: techCompanies.length,
          years: techYears.sort(),
          totalTechnicalQuestions: techTotals.totalTechnical,
          totalProgrammingQuestions: techTotals.totalProgramming
        },
        hr: {
          entries: hrEntries,
          companies: hrCompanies.length,
          totalHRQuestions: hrTotals.totalHR
        },
        combined: {
          totalCompanies: allCompanies.length,
          totalQuestions: techTotals.totalTechnical + techTotals.totalProgramming + hrTotals.totalHR,
          companies: allCompanies
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
