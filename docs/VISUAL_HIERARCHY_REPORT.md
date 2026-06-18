# Visual Hierarchy Report (VISUAL_HIERARCHY_REPORT.md)

This report documents the architectural layering and focus priority system designed for the **CMRIT Placement Portal**.

---

## 1. Visual Focal Order (Priority System)

When a student lands on the authenticated placement portal, their eyes should follow a clear, intentional route:

1. **Page Context / Status Indicator:** The top navbar confirms the student's authenticated session, showing who they are logged in as.
2. **Search Input Bar:** Positioned centrally at the top of the workspace. This is the primary interactive tool to find questions quickly.
3. **Overview Statistics:** Muted, readable metric cards displaying portal-wide status.
4. **Primary Content Workspace:**
   * **State A (Browse):** Company Selection Grid. Cards present clear company logos and count information.
   * **State B (Selection / Focus):** Dedicated Company Profile questions view, hiding the company grid to avoid focus division.
5. **Interactive Question Row Details:** Clean, readable question strings with minor category/year tags.
6. **Detail Actions (Get AI Answer):** Interactive text-link triggers that reveal inline coaches when clicked.

---

## 2. Typographic Contrast Rules

Typography is the primary driver of visual hierarchy in the redesigned portal.

* **Contrast via Weight:** We restrict font weights to:
  * Headers: `font-semibold` (600)
  * Primary Text/Titles: `font-medium` (500)
  * Secondary Text/Labels: `font-normal` (400)
* **Contrast via Size & Color:**
  * Title sizes (`text-3xl`) are colored slate-900 to feel authoritative.
  * Card titles are `text-base` and colored slate-900.
  * Question texts are `text-sm` and colored slate-800 to ensure excellent readability.
  * Auxiliary tags and details are `text-xs` and colored slate-500.

---

## 3. Structural Layering (Borders vs. Shadows)

To prevent visual clutter, we replace overlapping drop-shadows with structural borders.

* **Layer 0 (Background):** Solid `bg-slate-50`. All components sit on this light gray foundation.
* **Layer 1 (Card Elements):** Pure white fill (`bg-white`), bordered with `border-slate-200`. Zero shadow or `shadow-sm`.
* **Layer 2 (Header / Sticky Elements):** Solid white `bg-white/95` with a subtle bottom border (`border-b border-slate-100`).
* **Layer 3 (Overlays / Modals):** Login container, Chatbot window. These elements float above content, so they receive a strong border and a medium shadow (`shadow-lg`).
