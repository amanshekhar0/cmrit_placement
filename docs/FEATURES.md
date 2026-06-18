# Core Features Documentation

This document provides a detailed breakdown of the user-facing capabilities, controls, and configurations of the **CMRIT Placement PYQ Portal**.

---

## 1. Browse by Company (Interactive Grid)

The default view of the portal provides a dashboard organized by companies to facilitate targeted preparation.

* **Visual Identity:** Each company is represented by a card styled with a dynamic gradient background. The color scheme is derived programmatically by hashing the company name, providing a curated visual color mapping (e.g., from blue/indigo/teal/emerald/violet ranges).
* **Detailed Drawer:** Clicking a company card expands a drawer detailing all past placement questions from that employer.
* **Tab-Based Classification:** Within the company drawer, students can toggle between three views:
  1. **All** questions.
  2. **Technical** questions (theory, databases, networks).
  3. **Programming** questions (coding challenges).
* **Grid Exclusions:** The "General Question Bank" is excluded from the grid display and kept as a separate classification to avoid clutter.

---

## 2. Fuzzy Search Engine

The portal implements high-performance fuzzy searching on the client side using `Fuse.js`.

* **Fuzzy Matches:** Handles typographical errors and partial keywords gracefully.
* **Configured Search Fields:** Queries search against both the `question` text and `company` name.
* **Search Thresholds:**
  * **Global Questions Search:** Configured with a threshold of `0.35` (lower is stricter, higher is fuzzier) to prioritize relevant question matches.
  * **Company Name Search:** Configured with a threshold of `0.4` to filter matching company listings.
* **Co-Search Company Chips:** When a user types a query, the application dynamically displays matching company chips above the results. Clicking a chip redirects the user to that company's specific placement list.

---

## 3. Question-Level AI Coach

Each question card contains an AI helper designed to explain concepts and code on the spot.

* **Trigger:** The student clicks "Get AI Answer" under any question card.
* **Direct Integration:** Queries the Groq API stream directly using the `llama-3.1-8b-instant` model.
* **Formatting Engine:** Parses and displays basic markdown delimiters in real time, supporting:
  * `**bold**` text for emphasizing keywords.
  * `` `code` `` tags with monospaced background formatting for programming syntax.
* **Specialized System Prompt:** The AI is pre-configured with rules to act as a *technical placement tutor*. It limits answers to under 300 words, enforces structural headers, and gives mock-interview-ready explanations.

---

## 4. Floating PlacementBot

A dedicated general chatbot widget floats on the bottom-right corner of the UI.

* **PlacementBot Assistant:** Pre-configured with a system prompt specifying its role as a guide for CMRIT CSE placement topics (DSA, OOP, SQL, OS, Networking, HR/behavioral questions).
* **Quick Suggestions:** On the first interaction, the bot displays pill-shaped shortcuts for common placement questions, allowing students to test the assistant with one click.
* **Streaming Responses:** Chat responses stream in word-by-word, displaying a pulsing cursor indicator until completed.
* **Context Preservation:** Keeps track of the active chat thread session in local state.

---

## 5. Bookmark Management

Allows students to save questions across sessions for targeted review.

* **Mechanism:** Clicking the bookmark icon on any Question Card saves its unique ID (e.g., `2023-24_1_T2`).
* **Persistence:** Saved questions are kept in the browser's `localStorage` database under the key `cmrit_bookmarks` so they persist across page refreshes.
* **Access Control:** The "Saved" button in the sticky Navbar displays a live count badge of bookmarked questions. Clicking it toggles a view displaying only the saved question cards.

---

## 6. Live Dashboard Statistics

The Hero section functions as an analytics dashboard displaying metrics calculated in-memory from `questions.json`:
* **Questions:** Total count of individual technical and programming questions.
* **Companies:** Total count of unique company entities (excluding General Question Bank).
* **Years:** Number of distinct placement seasons archived.
* **Technical:** Total questions classified as technical concept questions.
* **Programming:** Total questions classified as coding/programming tasks.
