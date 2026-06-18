# Design System (DESIGN_SYSTEM.md)

This specification defines the visual primitives, token scales, and accessibility constraints for the **CMRIT Placement Portal**, heavily drawing inspiration from **Vercel**, **Linear**, and **Stripe**.

---

## 1. Color Palette

We transition from multiple bright gradients to a unified neutral palette. Gradients are removed except in small, subtle highlights.

### Primitives
* **Slate (Neutrals):**
  * `slate-50` (`#f8fafc`): App background, card hover fill
  * `slate-100` (`#f1f5f9`): Muted badges, input fields, border default
  * `slate-200` (`#e2e8f0`): Card borders, divider lines
  * `slate-300` (`#cbd5e1`): Disabled buttons, secondary text helper
  * `slate-500` (`#64748b`): Secondary labels, caption text
  * `slate-700` (`#334155`): Readability text, body copy
  * `slate-900` (`#0f172a`): Headers, high-contrast text, primary buttons
  * `slate-950` (`#020617`): Pure dark headers, dark mode highlights
* **Accent (Interactive):**
  * `blue-600` (`#2563eb`): Primary focus, active indicators, interactive links
  * `blue-700` (`#1d4ed8`): Primary hover states
* **Feedback (Alerts):**
  * `emerald-600` (`#059669`): Successful actions, active states
  * `red-600` (`#dc2626`): Error messages, warning actions

---

## 2. Typography Scale

Using **Inter** as the primary font with restricted font weights: `font-normal` (400), `font-medium` (500), and `font-semibold` (600). The weight `font-bold` (700) or `font-extrabold` (800) is reserved only for page titles.

| Token | Size | Line Height | Weights | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`text-3xl`** | 1.875rem (30px) | 2.25rem | 700 / 800 | Main Landing Page Header |
| **`text-xl`** | 1.25rem (20px) | 1.75rem | 600 | Card Section Titles, Login Header |
| **`text-base`** | 1rem (16px) | 1.5rem | 500 / 600 | Search input text, question title |
| **`text-sm`** | 0.875rem (14px) | 1.25rem | 400 / 500 | Body copy, secondary descriptions |
| **`text-xs`** | 0.75rem (12px) | 1rem | 500 / 600 | Badges, tags, copy details |

---

## 3. Borders, Corners & Shadows

To ensure consistency, we use a single border radius and border color style across all card and container modules.

* **Corner Radius (Border Radius):**
  * Small UI controls (Inputs, Buttons, Badges): `rounded-md` (6px) or `rounded-lg` (8px).
  * Card modules & Panels: `rounded-xl` (12px).
  * Chat widget, Google auth container: `rounded-2xl` (16px).
  * Avoid any `rounded-3xl` formatting to maintain sharp enterprise structures.
* **Borders:**
  * Standard: `border border-slate-200`
  * Stronger focus: `border border-slate-300`
  * Active/Focus: `ring-2 ring-blue-500/20 border-blue-500`
* **Shadows:**
  * Standard Card: `shadow-sm` (extremely subtle shadow).
  * Intercept overlays (Login, ChatBot window): `shadow-lg` (moderate shadow for depth).
  * No colorful glows or pulsing text shadows.

---

## 4. Spacing Scale

Rely on standard Tailwind margins/paddings matching standard multiples of 4px:
* `p-2` / `m-2` (8px): Inside badges, tight lists.
* `p-4` / `m-4` (16px): Standard padding inside small cards, navbar elements.
* `p-6` / `m-6` (24px): Standard padding inside main body cards, section layouts.
* `py-12` (48px): Spacing around page sections and headers.
