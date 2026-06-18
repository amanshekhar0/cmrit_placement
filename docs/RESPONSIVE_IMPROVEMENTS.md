# Responsive Improvements Report (RESPONSIVE_IMPROVEMENTS.md)

This document outlines the layout adaptations designed to ensure a seamless experience on all screen sizes, from mobile phones to high-resolution desktops.

---

## 1. Grid Column and Spacing Adaptations

* **Company Cards Grid:**
  * **Mobile:** 2 columns (`grid-cols-2`). Small padding (`p-3`) and smaller typography to maximize density.
  * **Tablet:** 3 to 4 columns (`sm:grid-cols-3 md:grid-cols-4`).
  * **Desktop:** 5 to 6 columns (`lg:grid-cols-5 xl:grid-cols-6`) with larger paddings.
* **Layout Padding:**
  * Outer main container padding: `px-4` on mobile, scaling to `px-6` or `px-8` on larger viewports.

---

## 2. Navigation Header Adaptation

* **Desktop View:**
  * Shows full CMRIT branding logo and name.
  * Displays user profile details: Google avatar image, user name, and email.
  * Displays a text-labeled "Saved Questions" bookmark button.
* **Mobile View (sm breakpoint):**
  * Hides the secondary subtitle and the user name/email text to save navbar space.
  * Keeps the Google avatar image and the logout action button.
  * Hides the text on the bookmark button, showing only the bookmark icon with the numeric count badge.

---

## 3. Statistics Grid Adaptation

* The placement overview statistics cards wrap cleanly onto multiple rows:
  * **Mobile:** Flex wrapping or double-row grid (`grid-cols-2` or `grid-cols-3` depending on sizing).
  * **Desktop:** Neat single row of 5 aligned metrics.
  * Values use tabular-numbers (`tabular-nums`) to prevent shifting when numbers change.

---

## 4. ChatBot Window Adaptation

* **Trigger Position:** Fixed at `bottom-6 right-6` for touch targets.
* **Window Size:**
  * **Desktop:** Fixed width of `370px` and height of `520px`.
  * **Mobile:** Adapts to window width (`max-w-[calc(100vw-24px)]`) and height, ensuring input boxes and scroll areas remain accessible.
