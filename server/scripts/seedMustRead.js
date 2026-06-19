// Seeds the MustReadQuestion collection from the DSA JSON + conceptual Q&A.
// Run once (and after content changes):  node scripts/seedMustRead.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const MustReadQuestion = require('../models/MustReadQuestion');
const dsaData = require('../data/must_read_questions.json');
const concepts = require('../data/conceptualQuestions.js');

async function seed() {
  await connectDB();
  await MustReadQuestion.deleteMany({});

  const dsaDocs = (dsaData.questions || []).map((q, i) => ({
    type: 'dsa',
    category: q.topic || 'DSA',
    order: q.id || i + 1,
    title: q.title,
    leetcodeId: q.leetcodeId,
    difficulty: q.difficulty,
    topic: q.topic,
    description: q.description,
    testCase: q.testCase,
    pseudoCodeJava: q.pseudoCodeJava,
    timeComplexity: q.timeComplexity,
    spaceComplexity: q.spaceComplexity,
    leetcodeUrl: q.leetcodeUrl,
  }));

  const conceptDocs = concepts.map((c, i) => ({
    type: 'concept',
    category: c.category,
    order: i + 1,
    question: c.question,
    answer: c.answer,
  }));

  const all = [...dsaDocs, ...conceptDocs];
  await MustReadQuestion.insertMany(all);

  console.log(`✅ Seeded ${dsaDocs.length} DSA problems + ${conceptDocs.length} concepts = ${all.length} must-read items`);
  const byCat = await MustReadQuestion.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
  byCat.forEach((c) => console.log(`   ${c._id}: ${c.n}`));

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); });
