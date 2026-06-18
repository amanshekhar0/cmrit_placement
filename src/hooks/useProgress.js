import { useState, useCallback, useMemo } from "react";

const STORAGE_KEY = "cmrit_completed_questions";

function loadCompleted() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function useProgress() {
  const [completed, setCompleted] = useState(loadCompleted);

  const toggleCompleted = useCallback((id) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isCompleted = useCallback(
    (id) => completed.has(id),
    [completed]
  );

  /** Count how many cards in an array are completed */
  const countCompleted = useCallback(
    (cards) => cards.filter((c) => completed.has(c.id)).length,
    [completed]
  );

  return { completed, toggleCompleted, isCompleted, countCompleted };
}
