const { SAMPLING } = require('../config/products');

// Trim a question entry down to what the caller is allowed to see.
//
// The truncation happens HERE, server-side, so locked questions are never
// serialised into the response at all. A client-side blur or CSS overlay would
// still ship the real text to the browser, where anyone can read it out of the
// network tab -- the same reasoning behind the server-side blur on note
// previews in notesRoutes.js.
//
// The response keeps `lockedCount` so the UI can say "38 more questions"
// without ever having received them.
function sampleTechnical(entry, hasAccess) {
  const doc = typeof entry.toObject === 'function' ? entry.toObject() : { ...entry };
  const tech = doc.technical_questions || [];
  const prog = doc.programming_questions || [];
  const total = tech.length + prog.length;

  if (hasAccess) {
    return { ...doc, locked: false, lockedCount: 0, totalAvailable: total };
  }

  const n = SAMPLING.FREE_TECH_SAMPLE;
  // Sample technical first, then spill into programming if budget remains.
  const shownTech = tech.slice(0, n);
  const shownProg = prog.slice(0, Math.max(0, n - shownTech.length));
  const shown = shownTech.length + shownProg.length;

  return {
    ...doc,
    technical_questions: shownTech,
    programming_questions: shownProg,
    locked: total > shown,
    lockedCount: total - shown,
    totalAvailable: total,
  };
}

function sampleHr(entry, hasAccess) {
  const doc = typeof entry.toObject === 'function' ? entry.toObject() : { ...entry };
  const all = doc.hr_questions || [];

  // FREE_HR_SAMPLE is null by default: HR questions stay fully public because
  // they are the highest-search-volume, lowest-exclusivity content we have,
  // and they are what pulls organic traffic to the paid technical bank.
  if (hasAccess || SAMPLING.FREE_HR_SAMPLE === null) {
    return { ...doc, locked: false, lockedCount: 0, totalAvailable: all.length };
  }

  const shown = all.slice(0, SAMPLING.FREE_HR_SAMPLE);
  return {
    ...doc,
    hr_questions: shown,
    locked: all.length > shown.length,
    lockedCount: all.length - shown.length,
    totalAvailable: all.length,
  };
}

module.exports = { sampleTechnical, sampleHr };
