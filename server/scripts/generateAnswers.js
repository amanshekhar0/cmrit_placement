/**
 * Pre-generates answers for the question bank and caches them in MongoDB.
 *
 * Answers are keyed by normalised question text, so duplicates across drives
 * cost one generation, not one per company.
 *
 *   node server/scripts/generateAnswers.js                 # dry run: what would it do
 *   node server/scripts/generateAnswers.js --commit        # generate everything missing
 *   node server/scripts/generateAnswers.js --commit --limit 50
 *   node server/scripts/generateAnswers.js --commit --only-free
 *
 * Resumable: already-cached questions are skipped, so an interrupted run picks
 * up where it stopped. Safe to re-run.
 *
 * --only-free generates just the questions visible to non-subscribers. Those
 * are the ones that appear on public company pages and feed the FAQPage schema,
 * so they are what actually matters for search. Start there.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const TechnicalQuestion = require('../models/TechnicalQuestion');
const HRQuestion = require('../models/HRQuestion');
const Answer = require('../models/Answer');
const { questionHash, generateAnswer } = require('../utils/answerService');
const { sampleTechnical, sampleHr } = require('../utils/sampleQuestions');
const { AI } = require('../config/ai');

const args = process.argv.slice(2);
const COMMIT = args.includes('--commit');
const ONLY_FREE = args.includes('--only-free');
const LIMIT = (() => {
  const i = args.indexOf('--limit');
  return i !== -1 && args[i + 1] ? parseInt(args[i + 1], 10) : Infinity;
})();

// Groq's free tier rate-limits aggressively; pace requests and back off on 429
// rather than hammering until the key is throttled.
const DELAY_MS = parseInt(process.env.ANSWER_GEN_DELAY_MS || '900', 10);
const MAX_RETRIES = 4;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, label) {
  let wait = 2000;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const retryable = err.status === 429 || (err.status >= 500 && err.status < 600);
      if (!retryable || attempt === MAX_RETRIES) throw err;
      console.log(`    retry ${attempt}/${MAX_RETRIES - 1} after ${wait}ms (${label}): ${err.message.slice(0, 80)}`);
      await sleep(wait);
      wait *= 2;
    }
  }
}

function collectQuestions() {
  return Promise.all([TechnicalQuestion.find(), HRQuestion.find()]).then(([tech, hr]) => {
    const out = new Map(); // hash -> { question, type }

    const addAll = (questions, type) => {
      for (const q of questions) {
        const text = String(q || '').trim();
        if (!text) continue;
        const h = questionHash(text);
        if (!out.has(h)) out.set(h, { question: text, type });
      }
    };

    for (const e of tech) {
      const scoped = ONLY_FREE ? sampleTechnical(e, false) : e;
      addAll(scoped.technical_questions || [], 'Technical');
      addAll(scoped.programming_questions || [], 'Programming');
    }
    for (const e of hr) {
      const scoped = ONLY_FREE ? sampleHr(e, false) : e;
      addAll(scoped.hr_questions || [], 'HR');
    }

    return out;
  });
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  if (COMMIT && !process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set');

  await mongoose.connect(process.env.MONGODB_URI);

  const all = await collectQuestions();
  const existing = new Set(
    (await Answer.find({ hash: { $in: [...all.keys()] } }).select('hash')).map((r) => r.hash)
  );

  const todo = [...all.entries()].filter(([h]) => !existing.has(h)).slice(0, LIMIT);

  console.log(`model:            ${AI.model}`);
  console.log(`scope:            ${ONLY_FREE ? 'free-tier questions only' : 'entire bank'}`);
  console.log(`unique questions: ${all.size}`);
  console.log(`already cached:   ${existing.size}`);
  console.log(`to generate:      ${todo.length}${LIMIT !== Infinity ? ` (capped at ${LIMIT})` : ''}`);

  if (!COMMIT) {
    console.log('\nDRY RUN. Nothing generated. Sample of what would run:');
    todo.slice(0, 5).forEach(([, v]) => console.log(`  [${v.type}] ${v.question.slice(0, 90)}`));
    console.log(`\nEstimated time at ${DELAY_MS}ms pacing: ~${Math.ceil((todo.length * DELAY_MS) / 60000)} min`);
    console.log('Re-run with --commit to generate.');
    await mongoose.disconnect();
    return;
  }

  let done = 0;
  let failed = 0;
  let tokens = 0;
  const startedAt = Date.now();

  for (const [hash, { question, type }] of todo) {
    try {
      const { answer, tokensUsed } = await withRetry(
        () => generateAnswer(question, type),
        question.slice(0, 40)
      );

      await Answer.findOneAndUpdate(
        { hash },
        { $set: { hash, question, answer, type, model: AI.model, tokensUsed } },
        { upsert: true, setDefaultsOnInsert: true }
      );

      done++;
      tokens += tokensUsed;
      if (done % 10 === 0 || done === todo.length) {
        const elapsed = Math.round((Date.now() - startedAt) / 1000);
        console.log(`  ${done}/${todo.length} generated  (${failed} failed, ${tokens} tokens, ${elapsed}s)`);
      }
    } catch (err) {
      failed++;
      console.error(`  FAILED: ${question.slice(0, 60)} -- ${err.message.slice(0, 120)}`);
    }
    await sleep(DELAY_MS);
  }

  console.log(`\nDone. ${done} generated, ${failed} failed, ${tokens} tokens used.`);
  if (failed) console.log('Re-run the same command to retry the failures (successes are skipped).');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('generateAnswers failed:', err);
  process.exit(1);
});
