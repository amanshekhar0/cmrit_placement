import { useState } from "react";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("cmrit_bookmarks") || "[]"));
    } catch { return new Set(); }
  });

  const toggle = (id) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("cmrit_bookmarks", JSON.stringify([...next]));
      return next;
    });
  };

  return { bookmarks, toggle };
}
