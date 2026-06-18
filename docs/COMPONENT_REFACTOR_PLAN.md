# Component Refactor Plan (COMPONENT_REFACTOR_PLAN.md)

This plan details the code changes required in each React component to remove visual noise and implement the updated design system.

---

## 1. App Shell & Authentication (`App.jsx`)
* **Refactor Hero Banner:**
  * Replace the dark purple/indigo marketing block with a clean, light-mode minimal dashboard header.
  * Neutral background (`bg-slate-50`), border layout (`border-b border-slate-200`).
  * Remove glowing radial indicators and decorative grids.
  * Use a clean typography scale for placement statistics. Align stat elements horizontally with simple text and borders.
* **Google Auth Login Intercept:**
  * If `user` state is null, render a high-end login overlay.
  * Minimalist layout: centered white login card (`max-w-md`), flat border (`border-slate-200`), clean slate typography.
  * Highlight the `@cmrit.ac.in` suffix requirement clearly using a neutral alert box.
  * Render the Google Sign-in button container.

---

## 2. Navigation Header (`Navbar.jsx`)
* **Header Style:**
  * Clean white background (`bg-white/95`) with a solid border bottom (`border-b border-slate-100`).
  * Remove rainbow shadows or strong background gradients.
* **User Information Details:**
  * Show user's profile avatar (Google avatar or initial letter badge) on the far right.
  * Display user's name next to the avatar (on desktop).
  * Render a subtle logout button (`onLogout`) next to the profile.
* **Saved Questions Action:**
  * Style the button with standard borders and neutral hover states. Remove the bright amber-to-orange gradient.

---

## 3. Company Selector Grid (`CompanyGrid.jsx`)
* **Company Cards:**
  * Strip out random name-hash background gradients (`COMPANY_COLORS`).
  * Use a uniform slate-50 hover background (`hover:bg-slate-50`) and a solid border (`border-slate-200`).
  * Render Clearbit logos in consistent, clean square wrappers.
* **Company Detail Panel Header:**
  * Change the background from a name-hash gradient to a solid slate-900 header block.
  * Make the "Back to Companies" button a clean, low-contrast secondary action.

---

## 4. Question Cards (`QuestionCard.jsx`)
* **Difficulty & Category Badges:**
  * Replace the multi-colored year tags (violet, fuchsia, sky, etc.) with a single, clean monochrome tag style: `bg-slate-100 text-slate-700 border-slate-200`.
  * Simplify Technical/Programming category tags to soft slate/blue tints rather than heavy colors.
* **Actions & Copy Controls:**
  * Make copy and bookmark icon triggers visible on hover (using standard utility classes) but low contrast.
* **AI Coach Answers:**
  * Style the answer card with a solid border, clear markdown text, and a standard loading indicator (remove pulsing bounce dots).

---

## 5. ChatBot Assistant (`ChatBot.jsx`)
* **Floating Trigger Icon:**
  * Remove the large, pulsing gradient circle.
  * Replace with a neat, slate-900 circle icon (`bg-slate-900 hover:bg-slate-800`) with a message SVG.
* **Chatbot Window Panel:**
  * Replace the deep indigo header with a solid slate-900 block.
  * Standardize messages: use light-gray bubbles for bot and light-blue or slate-100 for student.
  * Input textarea: border focus ring matching the standard design system.
