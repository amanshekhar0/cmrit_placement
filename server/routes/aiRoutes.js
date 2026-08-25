const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');
const { attachAccess } = require('../middleware/subscriptionMiddleware');
const { AI } = require('../config/ai');

// Proxy for Groq chat completions.
//
// The old client-side call shipped VITE_GROQ_API_KEY inside the JS bundle,
// where anyone could read it out and spend the quota. The key now lives only
// on the server, and the route is gated on an active pass -- so AI answers are
// genuinely a paid feature rather than a paid-looking one.
//
// A student who brings their OWN Groq key still calls Groq directly from the
// browser (see useGroq.js): they are paying for those tokens themselves, so
// there is nothing to meter and no shared key at risk.

const MAX_MESSAGES = 40;
const MAX_CHARS = 24000;

function validate(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'messages must be a non-empty array';
  }
  if (messages.length > MAX_MESSAGES) {
    return `messages must contain at most ${MAX_MESSAGES} entries`;
  }
  let total = 0;
  for (const m of messages) {
    if (!m || typeof m.content !== 'string' || !['system', 'user', 'assistant'].includes(m.role)) {
      return 'each message needs a valid role and string content';
    }
    total += m.content.length;
  }
  if (total > MAX_CHARS) {
    return 'conversation is too long';
  }
  return null;
}

router.post('/chat', verifyToken, attachAccess, async (req, res) => {
  if (!req.access.questions) {
    return res.status(402).json({
      success: false,
      code: 'SUBSCRIPTION_REQUIRED',
      message: 'AI answers need an active CMRIT Placement Pass.',
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ success: false, message: 'AI is not configured on the server.' });
  }

  const { messages, heavy } = req.body || {};
  const invalid = validate(messages);
  if (invalid) {
    return res.status(400).json({ success: false, message: invalid });
  }

  try {
    const upstream = await fetch(AI.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: heavy ? AI.modelHeavy : AI.model,
        messages,
        stream: true,
        max_tokens: AI.maxTokens,
        temperature: AI.temperature,
        reasoning_effort: AI.reasoningEffort,
        reasoning_format: AI.reasoningFormat,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error('Groq upstream error:', upstream.status, detail.slice(0, 500));
      // Never forward the upstream body: it can echo request details and, on
      // some error paths, the model/key context. Keep it generic for the user.
      return res.status(502).json({
        success: false,
        message: 'The AI service is unavailable right now. Please try again.',
      });
    }

    // Pass the SSE stream straight through so the client keeps its
    // token-by-token rendering.
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    const reader = upstream.body.getReader();
    // Stop pulling from Groq if the client disconnects mid-answer, so an
    // abandoned tab does not keep burning tokens.
    let aborted = false;
    req.on('close', () => { aborted = true; reader.cancel().catch(() => {}); });

    while (!aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (error) {
    console.error('AI proxy error:', error);
    if (res.headersSent) return res.end();
    res.status(500).json({ success: false, message: 'Could not reach the AI service.' });
  }
});

// Lets the client show the right model name / availability without hardcoding it.
router.get('/config', verifyToken, attachAccess, (req, res) => {
  res.json({
    success: true,
    available: !!process.env.GROQ_API_KEY,
    hasAccess: req.access.questions,
    model: AI.model,
  });
});

module.exports = router;
