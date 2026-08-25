import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets scroll position on navigation.
 *
 * The browser only restores scroll for real page loads; in an SPA the position
 * carries over, so following a link from halfway down /companies dropped you
 * into the middle of the company page you opened.
 *
 * Honours prefers-reduced-motion: smooth scrolling is a vestibular trigger for
 * some people, and an instant jump is the correct fallback.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduced ? "auto" : "instant" });
  }, [pathname]);

  return null;
}
