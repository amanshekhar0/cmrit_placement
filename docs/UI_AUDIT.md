# UI Audit Report (UI_AUDIT.md)

**Role:** Staff Product Designer Audit  
**Target:** CMRIT Placement PYQ Portal  
**Core Goal:** Standardize layout, clean up visual styling, establish enterprise SaaS clarity (Stripe/Linear aesthetics), and eliminate "vibe-coded" decorative patterns.

---

## 1. Executive Summary & Deficiencies

The current interface suffers from "vibe-coding" — where design decisions are made on a case-by-case basis using flashy, trending CSS patterns (like colorful card gradients, glowing neon dropshadows, rainbow tags, and multi-colored backgrounds) instead of relying on a cohesive, functional design system. While visually active, it lacks the restraint, consistency, and professional hierarchy found in products like Stripe, Linear, or GitHub Enterprise.

### Core Issues Identified:
1. **Color Chaos:** The application uses over 8 different colored gradients and badge styles (violet, fuchsia, rose, pink, teal, etc.) to display years and difficulty levels. This creates severe visual fatigue and lowers cognitive scannability.
2. **Branding Overload:** The dark Hero section with glowing gradient auras, radial mask grids, and floating glass cards feels like a marketing landing page rather than a high-frequency utility tool.
3. **Inconsistent Borders & Shadows:** Some components use borders, some use heavy shadows, and others use rounded-2xl or rounded-3xl corners. A standard border/shadow framework is missing.
4. **Weak Typography Hierarchy:** Too many font sizes and excessive use of `font-extrabold`. Headers and labels lack weight pairing, reducing reading efficiency.
5. **Vibe-Coded Chat Widget:** The ChatBot floating trigger has heavy multi-color gradients and pulsing glow animations, deviating from a professional assistant.

---

## 2. Detailed Audit Matrix

| Area | Current State (Vibe-Coded) | Target State (Enterprise SaaS) | Priority |
| :--- | :--- | :--- | :--- |
| **Color Palette** | 8+ gradient combinations, background colors for each year card. | Monochromatic neutral colors (`slate-50` to `slate-950`). Single accent color (`blue-600`) for primary actions. | **Critical** |
| **Typography Scale** | Unchecked font weight combinations, arbitrary scaling, heavy headers. | Strict 5-tier scale (12px, 14px, 16px, 20px, 32px), restricted weights (400, 500, 600). | **High** |
| **Card Components** | High-border radii (`rounded-2xl` & `rounded-3xl`), drop shadows, color borders. | Flat borders (`slate-200`), uniform radius (`rounded-lg` or `rounded-xl`), zero or minimal shadows. | **High** |
| **Hero Banner** | Dark radial glow layers, gradient headers, shiny background grids. | Low-noise headers, neutral background, functional alignment, clean search prominence. | **Medium** |
| **Company Grid** | Flashy colorful gradients matching name hashes, clearbit logo integrations. | Soft, flat neutral cards with clean typography. Clearbit logos rendered in flat white boxes with subtle borders. | **Medium** |
| **Chat Assistant** | Pulsing animations, heavy linear gradients, bright primary status tags. | Sleek collapsible slide-out panel, clean dark/light text separation, Notion-like clean inputs. | **Medium** |
| **Empty & Error States** | Basic text readouts, bright red alert containers. | Icon-based minimal states, soft red-gray muted containers, functional retry actions. | **Low** |
| **Micro-Interactions** | Dynamic bounce animations and color transitions. | Subtle, fast opacity transitions (`transition-colors duration-150`). | **High** |

---

## 3. Recommended Remediation Order

1. **Establish the Core Design System:** Formulate global color tokens, standard typography utilities, and standard border/shadow variables.
2. **Refactor App Shell & Layout:** Replace the heavy dark gradient Hero with a refined, high-end SaaS light dashboard header, integrating Google login directly.
3. **Redesign the Company Selection View:** Replace hash-color gradients on company cards with clean, grid-based card buttons featuring sharp borders and light gray fills.
4. **Streamline Question Cards:** Standardize padding, margin, font-size, and replace year/category tags with clean monochrome badges.
5. **Modernize the ChatBot and Google Auth Screens:** Standardize input boxes, message containers, and sign-in pages to match Stripe and Linear UI styles.
