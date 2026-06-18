# Technical Debt and Code Quality Audit

This document identifies areas of high technical debt, performance limitations, and potential security issues within the current implementation of the **CMRIT Placement PYQ Portal**, alongside recommended mitigations.

---

## 1. High Risk: Client-Side API Key Exposure

### The Issue
In `src/hooks/useGroq.js`, the application connects directly to the Groq API endpoint from the browser:
```javascript
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
```
When compiled for production (`npm run build`), the environment variable is injected directly into the client-side bundle.

### Risk Analysis
* **Severity:** **HIGH**
* **Consequences:** Anyone loading the site can easily inspect the network tab or bundle source code, extract the active API key, and use it to execute arbitrary commands, leading to rapid key revocation, account suspension, or unexpected billing.

### Mitigation
1. **Backend Gateway:** Establish a lightweight server or serverless proxy function (such as Next.js API Routes, Vercel Serverless Functions, or a Node/Express backend) to store the API key securely.
2. **Proxy Completion Requests:** Update the frontend to query the local proxy endpoint (e.g. `/api/chat`), which attaches the key and forwards requests to Groq.

---

## 2. Orphaned Code & Dependency Bloat

### Unused Files
There are files included in the project directory that are fully defined but completely unused:
1. `src/components/FilterPanel.jsx`: Contains a sidebar filter panel using selectors for Year, Company, and Question Type. This file is not imported or rendered.
2. `src/components/StatsBar.jsx`: A sub-bar component designed to show search counts. It is not imported.
3. `src/App.css`: An empty CSS stylesheet that is not imported anywhere.

### Dependency Bloat
* `package.json` includes the dependency `"react-router-dom": "^7.18.0"`.
* **The Debt:** There is zero routing logic in the application. All view switches (Bookmarks, Search, Company view) are managed in-memory via React state flags inside `App.jsx`.

---

## 3. Lack of Client-Side URL Routing

### The Issue
Because states are handled through standard React state setters (`showBookmarks`, `activeCompany`, `query`), state is not mirrored in the URL.
* If a student accesses `http://portal/`, searches for a specific company, and shares that link, the recipient is sent to the clean landing page.

### Mitigation
Leverage `react-router-dom` (already in the dependencies) or use browser `URLSearchParams` inside `App.jsx` to synchronize the active company, bookmark state, and query text with the browser address bar (e.g., `/?company=Oracle` or `/?view=saved`).

---

## 4. Performance & Scale Bottlenecks

### 1. In-Memory Transforming of JSON Data
On boot, `App.jsx` executes `buildCards` which flattens the nested structures in `questions.json` in-memory.
* **Current state:** The dataset is ~58KB, which processes in fractions of a millisecond.
* **Scaling risk:** If the dataset grows to megabytes of historical questions over the next few placement cycles, this blocking process will cause measurable lag during initial page load.

### 2. Lack of DOM Virtualization/Pagination
In `QuestionList.jsx`, matching cards are rendered in the DOM using a simple `cards.map(...)`.
* **The Debt:** If a search query or a filter lists 200+ matches, all 200 DOM trees (along with cards, bookmarks, buttons, and state hooks) are initialized. This will degrade scroll performance and responsiveness.
* **Mitigation:** Implement list pagination or virtual scroll windowing.

---

## 5. Fragile Markdown Rendering

### The Issue
Both `QuestionCard.jsx` and `ChatBot.jsx` parse formatting tokens (bolding and inline code blocks) using manual string splitting:
```javascript
const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
```
### Technical Limitations
* If the LLM generates structured bulleted lists (`- item`), headers (`### Title`), code blocks with syntax tags, or links, this parser cannot handle them. The raw markdown characters will render directly on screen.

### Mitigation
Incorporate a lightweight React markdown parser library like `react-markdown` or a wrapper around `marked` to support standard markdown features safely.
