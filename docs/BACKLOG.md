# CMRIT Placement PYQ Portal - Backlog

This backlog registers and tracks all completed milestones, current progress, outstanding issues, and future requirements for the **CMRIT Placement PYQ Portal**, organized by implementation state.

---

## 1. Completed

These features are fully implemented, verified, and active in the codebase:

* **Interactive Company Grid:** Dynamic card representation with dynamic initials and custom gradients based on company name hashing.
* **Dual-Type Question Class:** Dynamic filtering of questions into "Technical" concepts and "Programming" (coding challenges).
* **Fuzzy Search Integration:** Client-side search powered by `Fuse.js` for instant matches across question texts and company names.
* **Persistent Bookmarks:** A custom React hook (`useBookmarks.js`) that persists bookmarked question IDs to browser `LocalStorage`.
* **Streaming AI Coach:** Real-time stream completion integration via Groq SDK endpoints (`llama-3.1-8b-instant`) under each question card.
* **PlacementBot Assistant:** Floating chatbot assistant with mock-interview rules, CSE-focused system prompts, and pre-packaged suggestions.
* **In-Memory Statistics:** Live count of companies, years (2019-2027), questions, and stream types shown in the landing Hero banner.
* **Orphaned Component Cleanup:** Legacy/orphaned components (`FilterPanel.jsx`, `StatsBar.jsx`) and styles (`App.css`) removed.
* **Zero-Dependency Markdown Parser:** Integrated `renderMarkdown` to cleanly format fenced code blocks, headers, bullet lists, bold text, and code spans in AI responses.
* **API Retry Handling:** Added structured alert boxes with a "Retry" button to recover from network drops or API rate limiting.
* **Deep Link URL Syncer:** Synchronized local state parameters (`q`, `company`, `bookmarks`) with `URLSearchParams` to enable copying and sharing search queries and selections.

---

## 2. In Progress

Active tasks currently being worked on or analyzed in the project scope:

* **MVP Concurrency Strategy:** Designing server-side API key proxy handlers to support **1,000+ students** simultaneously without hitting Groq API rate limits.

---

## 3. Missing Features

New capabilities planned for development to improve functionality, security, scaling, and monetize/support the platform:

* **Google Authentication (OAuth 2.0):** Implement college-domain login (e.g., `@cmrit.ac.in`) to authenticate users, restrict public access, and synchronize user bookmarks/notes to a DB. (Postponed for later release).
* **Payment Gateway Integration:** Integrate Razorpay or Stripe to allow students/alumni to donate and support hosting costs (API keys, compute, database billing). (Postponed for later release).
* **Advanced Pagination & Virtual Scroll:** Implement virtual list libraries (e.g., `react-window` or `react-virtualized`) to render only visible questions in the view, preventing browser lag.
* **Admin Ingestion Portal:** A secure dashboard allowing placement coordinators or student representatives to add questions and manage companies directly.
* **Advanced Subject Filters:** Multi-criteria dropdowns to filter questions by specific subjects (e.g., DBMS, OOPS, Operating Systems, Computer Networks).

---

## 4. Bugs

Active issues and behavioral flaws impacting usability:

* *None currently registered. All known active bugs have been resolved in the MVP core.*

---

## 5. Technical Debt

Internal code quality tasks and structural vulnerabilities:

* **Security: Exposed Client-Side API Key:** Groq API keys are fetched directly in the client bundle. This must be migrated to a backend proxy route.
* **Lack of Type-Safety:** The codebase uses vanilla JS/JSX. Migrating to TypeScript is required to define strict interfaces for question entries and components.
* **Unused Dependencies Cleanup:** Remove `react-router-dom` from dependencies as routing is now elegantly handled by client-side URL parameters.
* **Static Memory Boot-Block:** The blocking `buildCards` function runs immediately on script execution, which slows down initial loading speeds.
