const { SAMPLING } = require('../config/products');

// Trim a question entry down to what the caller is allowed to see.
//
// The truncation happens HERE, server-side, so locked questions are never
// serialised into the response at all. A client-side blur or CSS overlay would
// still ship the real text to the browser, where anyone can read it out of the
// network tab -- the same reasoning behind the server-side blur on note
// previews in notesRoutes.js.
//
// With SAMPLING at its default of 0 nothing is shown to an unpaid caller, so
// every response is counts-only. That is why `counts` and `totalAvailable`
// are always present and always describe the FULL entry: they are the only
// thing the public pages have left to render, and they carry no question text.
function sampleTechnical(entry, hasAccess) {
  const doc = typeof entry.toObject === 'function' ? entry.toObject() : { ...entry };
  const tech = doc.technical_questions || [];
  const prog = doc.programming_questions || [];
  const total = tech.length + prog.length;
  // Always the full breakdown, regardless of what is shown below.
  const counts = { technical: tech.length, programming: prog.length, hr: 0, total };

  if (hasAccess) {
    return { ...doc, locked: false, lockedCount: 0, totalAvailable: total, counts };
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
    counts,
  };
}

function sampleHr(entry, hasAccess) {
  const doc = typeof entry.toObject === 'function' ? entry.toObject() : { ...entry };
  const all = doc.hr_questions || [];
  const counts = { technical: 0, programming: 0, hr: all.length, total: all.length };

  // FREE_HR_SAMPLE is null only when FREE_HR_SAMPLE=all is set in the
  // environment, which reopens the HR bank as fully public.
  if (hasAccess || SAMPLING.FREE_HR_SAMPLE === null) {
    return { ...doc, locked: false, lockedCount: 0, totalAvailable: all.length, counts };
  }

  const shown = all.slice(0, SAMPLING.FREE_HR_SAMPLE);
  return {
    ...doc,
    hr_questions: shown,
    locked: all.length > shown.length,
    lockedCount: all.length - shown.length,
    totalAvailable: all.length,
    counts,
  };
}

module.exports = { sampleTechnical, sampleHr };
