// Groq model configuration.
//
// llama-3.1-8b-instant (the previous default) was retired by Groq -- every
// Llama chat model is gone from the catalogue, leaving only the prompt-guard
// classifiers. Calls to it now 404 with model_not_found. The gpt-oss family is
// the current fast tier.
//
// These are reasoning models: without reasoning_format they stream chain-of-
// thought into delta.reasoning and leave delta.content empty until the very
// end, which reads as a hang. 'hidden' suppresses that so only the answer
// streams, matching the old model's behaviour.
const AI = {
  // Fast default for chat and question answers.
  model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  // Stronger model for mock-interview feedback, where quality beats latency.
  modelHeavy: process.env.GROQ_MODEL_HEAVY || 'openai/gpt-oss-120b',

  reasoningEffort: process.env.GROQ_REASONING_EFFORT || 'low',
  reasoningFormat: 'hidden',

  maxTokens: parseInt(process.env.GROQ_MAX_TOKENS || '1024', 10),
  temperature: 0.7,

  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
};

module.exports = { AI };
