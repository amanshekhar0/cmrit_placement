const crypto = require('crypto');
const Answer = require('../models/Answer');
const { AI } = require('../config/ai');

/**
 * Stable key for a question.
 *
 * Normalises before hashing so trivial differences in how a question was typed
 * across two drives ("What is a Hash Map?" vs "what is a hash map") collapse to
 * one cached answer instead of paying for the same generation twice.
 */
function questionHash(question) {
  const normalised = String(question)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[?.!,:;]+$/g, '')
    .trim();
  return crypto.createHash('sha256').update(normalised).digest('hex').slice(0, 32);
}

const SYSTEM_PROMPT = `You are a placement-interview tutor for engineering students in India.

Answer the interview question at the depth a campus interview panel expects:
- Lead with the direct answer in one or two sentences.
- Then give the reasoning, key trade-offs, or a short example.
- Mention complexity or edge cases where they matter.
- Use plain prose. Short markdown (**bold**, \`code\`) is fine; do not use headings.
- Stay under 180 words. Do not pad, do not restate the question, do not add a preamble.

For HR questions, give a concrete framework for structuring the answer and one
worked example, rather than a script to memorise.`;

/** Generate one answer via Groq. Returns { answer, tokensUsed } or throws. */
async function generateAnswer(question, type = 'Technical') {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const res = await fetch(AI.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `[${type} round] ${question}` },
      ],
      max_tokens: 500,
      temperature: 0.5,
      reasoning_effort: AI.reasoningEffort,
      reasoning_format: AI.reasoningFormat,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    const err = new Error(`Groq ${res.status}: ${detail.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }

  const body = await res.json();
  const answer = body.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error('Groq returned an empty answer');

  return { answer, tokensUsed: body.usage?.total_tokens || 0 };
}

/** Fetch cached answers for a list of questions, keyed by hash. */
async function getCachedAnswers(questions) {
  const hashes = questions.map(questionHash);
  const rows = await Answer.find({ hash: { $in: hashes } }).select('hash answer type');
  const byHash = new Map(rows.map((r) => [r.hash, r]));

  const out = {};
  questions.forEach((q) => {
    const row = byHash.get(questionHash(q));
    if (row) out[q] = { answer: row.answer, type: row.type };
  });
  return out;
}

/** Generate and store an answer, or return the existing one. */
async function ensureAnswer(question, type = 'Technical', { force = false } = {}) {
  const hash = questionHash(question);
  const existing = await Answer.findOne({ hash });
  if (existing && !force) return { answer: existing, created: false };

  const { answer, tokensUsed } = await generateAnswer(question, type);

  // Built conditionally: an empty `$inc: {}` is rejected by MongoDB, so the
  // operator is only included when this is an actual regeneration.
  const update = {
    $set: { hash, question, answer, type, model: AI.model, tokensUsed },
  };
  if (existing) update.$inc = { revision: 1 };

  const saved = await Answer.findOneAndUpdate(
    { hash },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { answer: saved, created: !existing };
}

module.exports = { questionHash, generateAnswer, getCachedAnswers, ensureAnswer };
