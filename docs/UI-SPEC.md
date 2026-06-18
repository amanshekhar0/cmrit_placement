# UI Design Specification (UI-SPEC.md)

This specification defines the visual standards, design systems, assets, and component states implemented for the **CMRIT Placement PYQ Portal**. It defines a modern, premium enterprise design to replace any "vibe-coded" initials.

---

## 1. Visual Brand Identity

### Design Language
* **Theme Vibe:** Premium SaaS dashboard. Refined dark headers/Hero transitions combined with soft, readable content listings in light-mode slates.
* **Palette Tokens:**
  * **Brand Primary:** Deep Royal Indigo (`from-slate-950 via-blue-950 to-indigo-950`) for Hero backgrounds.
  * **Interactive Accents:** Brand Blue (`#2563eb`), Brand Indigo (`#4f46e5`), and Amber/Orange (`#f59e0b` / `#ea580c`) for active states.
  * **Backgrounds:** Slate base (`#f8fafc`) with pure white modules (`#ffffff`) to allow visual separation.

### Typography
* **Primary Font:** Inter (loaded from Google Fonts).
  * Page Title: `font-extrabold tracking-tight` with text gradients.
  * Badges & Counters: `font-extrabold uppercase text-[10px] tracking-wider`.
  * Question text: `text-slate-800 text-sm leading-relaxed`.

---

## 2. Company Identity & Logo Strategies

To avoid placeholder initials, the application dynamically resolves official corporate logos using a domain-mapping registry:

### 1. Registry Mapping (`src/utils/companyDomains.js`)
Stores a mapping of company names (as they appear in `questions.json`) to their official corporate web domains.
* *Example:* `"PhonePe": "phonepe.com"`, `"Oracle": "oracle.com"`, `"Accenture": "accenture.com"`.

### 2. Loading Strategy & Error Recovery
* **API Endpoint:** Queries Hunter.io Logo API (`https://logos.hunter.io/{domain}`) to fetch high-resolution transparent PNG files.
* **Isolated Sub-Components:** Grid cards and panel drawers wrap image elements in isolated components (`CompanyCardButton`, `DrawerHeader`, and `CompanyChip`).
* **Fallback State:** If a logo image fails to load (due to rate-limits or missing domains), the `onError` hook triggers a fallback state displaying beautiful name-hashed color gradients and initials, preventing broken images.

---

## 3. Interactive Utilities & Micro-States

### 1. Copy-to-Clipboard
* **Copy Question:** Positioned next to the bookmark trigger in the card header.
* **Copy Answer:** Located inside the expanded AI Coach container next to the section title.
* **Visual States:** Clicking a copy button copies raw text using the Clipboard API and updates the state. The icon toggles to a checkmark accompanied by an emerald `"Copied!"` message for 2 seconds.

### 2. Bookmarks Indicator
* Toggling bookmark swaps states dynamically. Saves and restores question IDs to browser `LocalStorage`.

---

## 4. Component Layout Specifications

### 1. Navigation Header
* **Style:** frosted glass overlay (`bg-white/80 backdrop-blur-md sticky border-slate-200/80`).
* **Branding:** Logo icon scale transition on parent hover (`group-hover:scale-[1.03]`).

### 2. Hero Statistics Section
* **Style:** Dark deep slate gradient. Contains subtle background grids and radial light glows.
* **Stat Blocks:** Wrapped in glass panels (`bg-white/[0.02] border-white/[0.06] backdrop-blur-md`) that scale slightly on hover.

### 3. ChatBot Widget
* **Trigger:** Floating widget with pulsing shadow gradients.
* **UI Window:** Smooth slide-up animation. Custom royal-indigo header containing a live green status pulse.
