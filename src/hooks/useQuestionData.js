import { useState, useEffect, useMemo } from "react";
import { groupCompanies, slugify } from "../utils/slug";

const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "") : "";

/**
 * Data available before any fetch resolves.
 *
 * Set two ways:
 *  - during prerendering, by scripts/prerender.mjs calling seedQuestionData()
 *    so the components render real content into static HTML rather than a
 *    loading skeleton;
 *  - in the browser, from the __PRERENDER_DATA__ blob embedded in that same
 *    static HTML, so the first paint shows content instead of flashing a
 *    skeleton before re-rendering it.
 *
 * The client still refetches on mount: the seed is anonymous free-tier data,
 * and a signed-in subscriber must get their fuller version.
 */
let seed = null;

export function seedQuestionData(data) {
  seed = data;
}

if (typeof window !== "undefined" && window.__PRERENDER_DATA__) {
  seed = window.__PRERENDER_DATA__;
}

// Module-level cache so navigating between the landing page, the company
// directory and a company page does not refetch the whole bank each time.
// Keyed by token, because the response differs for a subscriber.
let cache = { key: null, promise: null };

function fetchBank(token) {
  const key = token || "anon";
  if (cache.key === key && cache.promise) return cache.promise;

  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const promise = Promise.all([
    fetch(`${API_URL}/api/technical`, { headers }),
    fetch(`${API_URL}/api/hr`, { headers }),
  ]).then(async ([techRes, hrRes]) => {
    if (!techRes.ok || !hrRes.ok) throw new Error("Could not load the question bank.");
    const tech = await techRes.json();
    const hr = await hrRes.json();
    return {
      tech: tech.data || [],
      hr: hr.data || [],
      hasAccess: !!tech.hasAccess,
    };
  });

  cache = { key, promise };
  // A failed fetch must not be cached, or every later navigation replays the
  // same rejection with no way to retry.
  promise.catch(() => { if (cache.key === key) cache = { key: null, promise: null }; });
  return promise;
}

/** Clear the cache so the next read refetches (used after a successful purchase). */
export function invalidateQuestionData() {
  cache = { key: null, promise: null };
}

/**
 * Loads the question bank once and derives the merged company list.
 *
 * Works signed-out: the API returns the free sample to anonymous callers, which
 * is what the public company pages render.
 */
export function useQuestionData(token) {
  const key = token || "anon";
  // `loading` is derived by comparing the key we last STORED against the key we
  // were asked for, rather than being flipped by a synchronous setState in the
  // effect body. That extra set caused an immediate second render on every
  // mount (and trips react-hooks/set-state-in-effect).
  const [state, setState] = useState(() =>
    seed
      ? { key, tech: seed.tech || [], hr: seed.hr || [], hasAccess: false, error: null }
      : { key: null, tech: [], hr: [], hasAccess: false, error: null }
  );

  useEffect(() => {
    let alive = true;
    fetchBank(token)
      .then((data) => alive && setState({ key, ...data, error: null }))
      .catch((err) => alive && setState({ key, tech: [], hr: [], hasAccess: false, error: err.message }));
    return () => { alive = false; };
  }, [token, key]);

  const loading = state.key !== key;

  const companies = useMemo(() => {
    const names = [...state.tech.map((e) => e.company), ...state.hr.map((e) => e.company)];
    const grouped = groupCompanies(names);

    // Attach per-company counts and the years each one recruited in.
    //
    // `questionCount` is what the caller can actually READ; `totalCount` is how
    // many exist. With the free preview at zero those differ for every unpaid
    // visitor, and it is `totalCount` that the public pages advertise -- the
    // server sends it (as `counts`/`totalAvailable`) without sending the text.
    for (const entry of grouped.values()) {
      entry.years = new Set();
      entry.questionCount = 0;
      entry.lockedCount = 0;
      entry.counts = { technical: 0, programming: 0, hr: 0, total: 0 };
    }
    const addCounts = (g, c) => {
      if (!c) return;
      g.counts.technical += c.technical || 0;
      g.counts.programming += c.programming || 0;
      g.counts.hr += c.hr || 0;
      g.counts.total += c.total || 0;
    };
    for (const e of state.tech) {
      const g = grouped.get(slugify(e.company || ""));
      if (!g) continue;
      if (e.year) g.years.add(e.year);
      g.questionCount += (e.technical_questions || []).length + (e.programming_questions || []).length;
      g.lockedCount += e.lockedCount || 0;
      addCounts(g, e.counts);
    }
    for (const e of state.hr) {
      const g = grouped.get(slugify(e.company || ""));
      if (!g) continue;
      (e.years || []).forEach((y) => g.years.add(y));
      g.questionCount += (e.hr_questions || []).length;
      g.lockedCount += e.lockedCount || 0;
      addCounts(g, e.counts);
    }

    return [...grouped.values()]
      .map((e) => ({
        ...e,
        years: [...e.years].sort(),
        // Falls back to shown+locked for any payload that predates `counts`.
        totalCount: e.counts.total || e.questionCount + e.lockedCount,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [state.tech, state.hr]);

  const totals = useMemo(() => {
    const shown = companies.reduce((n, c) => n + c.questionCount, 0);
    const locked = companies.reduce((n, c) => n + c.lockedCount, 0);
    const total = companies.reduce((n, c) => n + c.totalCount, 0);
    const years = new Set();
    companies.forEach((c) => c.years.forEach((y) => years.add(y)));
    return { companies: companies.length, shown, locked, total, years: years.size };
  }, [companies]);

  return { ...state, loading, companies, totals };
}
