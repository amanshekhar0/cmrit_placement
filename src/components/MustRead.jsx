import { useState, useEffect, useMemo } from "react";

const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "") : "";

const DIFFICULTY_STYLES = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
  Medium: "bg-amber-50 text-amber-700 border-amber-200/70",
  Hard: "bg-red-50 text-red-700 border-red-200/70",
};

export default function MustRead() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeType, setActiveType] = useState("concept"); // 'concept' | 'dsa'
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIds, setOpenIds] = useState(() => new Set());

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/api/mustread`);
        const data = await res.json();
        if (data.success) setItems(data.data);
        else setError(data.message || "Failed to load.");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Categories available for the active type.
  const categories = useMemo(() => {
    const set = new Set(items.filter((i) => i.type === activeType).map((i) => i.category));
    return ["All", ...[...set].sort()];
  }, [items, activeType]);

  const visible = useMemo(() => {
    return items.filter(
      (i) => i.type === activeType && (activeCategory === "All" || i.category === activeCategory)
    );
  }, [items, activeType, activeCategory]);

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const switchType = (type) => {
    setActiveType(type);
    setActiveCategory("All");
    setOpenIds(new Set());
  };

  const counts = useMemo(() => ({
    concept: items.filter((i) => i.type === "concept").length,
    dsa: items.filter((i) => i.type === "dsa").length,
  }), [items]);

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shadow-sm">
          <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <h2 className="font-semibold text-zinc-900 text-[15px] tracking-tight">Must Read</h2>
          <p className="text-zinc-400 text-[12px]">Top interview questions — concepts &amp; DSA, with answers</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50/80 border border-red-200/60 rounded-xl text-[12px] text-red-600">{error}</div>
      )}

      {/* Type toggle */}
      <div className="inline-flex bg-zinc-100 rounded-xl p-1 mb-4">
        {[
          { key: "concept", label: `Concepts (${counts.concept})` },
          { key: "dsa", label: `DSA Problems (${counts.dsa})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => switchType(t.key)}
            className={`text-[12px] font-medium px-3.5 py-1.5 rounded-lg transition-colors ${
              activeType === t.key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Category chips */}
      {!loading && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                activeCategory === c
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-zinc-200/60 rounded-xl">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-100 border-t-zinc-800 animate-spin mb-3" />
          <p className="text-[12px] font-semibold text-zinc-700">Loading…</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((item) => {
            const isOpen = openIds.has(item._id);
            return (
              <div key={item._id} className="bg-white border border-zinc-200/80 rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggle(item._id)}
                  className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-zinc-50/50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      {item.difficulty && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${DIFFICULTY_STYLES[item.difficulty] || "bg-zinc-50 text-zinc-600 border-zinc-200"}`}>
                          {item.difficulty}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] font-semibold text-zinc-900 leading-snug">
                      {item.type === "dsa" ? item.title : item.question}
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-zinc-300 flex-shrink-0 mt-0.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 -mt-1 animate-fadeIn">
                    {item.type === "concept" ? (
                      <p className="text-[13px] text-zinc-600 leading-relaxed">{item.answer}</p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[13px] text-zinc-600 leading-relaxed">{item.description}</p>

                        {item.testCase && (
                          <div className="text-[12px] bg-zinc-50 border border-zinc-200/70 rounded-lg p-3 space-y-1">
                            <p><span className="text-zinc-400 font-medium">Input:</span> <code className="text-zinc-700">{item.testCase.input}</code></p>
                            <p><span className="text-zinc-400 font-medium">Output:</span> <code className="text-zinc-700">{item.testCase.output}</code></p>
                            {item.testCase.explanation && (
                              <p className="text-zinc-500">{item.testCase.explanation}</p>
                            )}
                          </div>
                        )}

                        {item.pseudoCodeJava && (
                          <pre className="text-[11.5px] bg-zinc-900 text-zinc-100 rounded-lg p-3 overflow-x-auto leading-relaxed scrollbar-thin">
                            <code>{item.pseudoCodeJava}</code>
                          </pre>
                        )}

                        <div className="flex items-center gap-3 flex-wrap text-[11px]">
                          {item.timeComplexity && (
                            <span className="text-zinc-500"><span className="text-zinc-400">Time:</span> <code className="text-zinc-700">{item.timeComplexity}</code></span>
                          )}
                          {item.spaceComplexity && (
                            <span className="text-zinc-500"><span className="text-zinc-400">Space:</span> <code className="text-zinc-700">{item.spaceComplexity}</code></span>
                          )}
                          {item.leetcodeUrl && (
                            <a href={item.leetcodeUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-900 font-medium ml-auto">
                              Open on LeetCode →
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {visible.length === 0 && (
            <p className="text-center py-12 text-[13px] text-zinc-400">No items in this category.</p>
          )}
        </div>
      )}
    </div>
  );
}
