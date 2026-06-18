# CMRIT Placement PYQ Portal - Known Issues

This document cataloges all active runtime bugs, security vulnerabilities, design debt, and functional gaps in the **CMRIT Placement PYQ Portal**, structured by state.

---

## 1. Completed (Resolved Issues)

Issues that have been successfully resolved and validated in the codebase:

* **Search Performance Lag:** Flat array loops previously caused typing lag. Resolved by integrating fuzzy search indexes via `Fuse.js`.
* **State Loss on Refresh:** Bookmarked questions were lost on tab close. Resolved by syncing bookmark state with `localStorage`.
* **Long AI Blocking Delay:** Students had to wait 10+ seconds for AI answers to load. Resolved by implementing chunk streaming parsing in `useGroq.js` and rendering updates in real-time.
* **Orphaned Component Bloat:** Legacy files (`FilterPanel.jsx`, `StatsBar.jsx`, `App.css`) remained in the codebase. Resolved by auditing and deleting these files, reducing build size.
* **Deep URL Navigation:** Users could not share search queries or company selections. Resolved by syncing state variables (`q`, `company`, `bookmarks`) to `URLSearchParams` and `window.history.replaceState`.
* **Markdown Rendering Failures:** AI answers with lists and code blocks rendered raw tags. Resolved by implementing a zero-dependency React parser `renderMarkdown` in `src/utils/markdown.jsx`.
* **Groq API Connection Failures:** Unhandled rate-limiting or network drops caused loading freezes. Resolved by introducing a custom alert warning banner with a functional "Retry" trigger in `QuestionCard.jsx`.

---

## 2. In Progress (Currently Being Addressed)

Issues currently under active investigation or development:

* **MVP Concurrency Strategy:** Designing server-side API key proxy handlers to support **1,000+ students** simultaneously without hitting Groq API rate limits.

---

## 3. Missing Features (Functional Gaps)

Functional limitations and missing security integrations:

* **Authentication Lock:** The site lacks authentication (Google Auth). This is a gap for a college portal as any public user can access internal placement data. (Postponed for later release).
* **Funding Integration:** The portal does not have a payment gateway (Razorpay/Stripe) to accept contributions to fund API tokens. (Postponed for later release).
* **Pagination & Virtualization:** High results render all cards at once in the DOM, causing scroll lag on mobile viewports.

---

## 4. Bugs (Active Runtime Faults)

Active programming faults and UX bugs:

* *None currently registered. All known active bugs have been resolved in the MVP core.*

---

## 5. Technical Debt (Structural Risks)

Design flaws and codebase security vulnerabilities:

* **Direct Client API Key Vulnerability:**
  * **Risk:** The Groq key is fetched using client-side environmental references (`import.meta.env.VITE_GROQ_API_KEY`). Building the production app compiles this key into public bundles, exposing it to extraction.
* **JavaScript Type Flaws:** The project runs on standard JavaScript, leading to potential structural bugs if placement JSON data schemas change.
* **Static Memory Boot-Block:** The blocking `buildCards` function runs immediately on script execution, which slows down initial loading speeds.
