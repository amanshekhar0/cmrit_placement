import { useState, useRef } from "react";
import { useGroq } from "../hooks/useGroq";
import { renderMarkdown } from "../utils/markdown";
import { COMPANY_DOMAINS } from "../utils/companyDomains";

const TYPE_CONFIG = {
  Technical: {
    bg: "bg-zinc-100",
    text: "text-zinc-600",
    border: "border-zinc-200/60",
    icon: (
      <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  Programming: {
    bg: "bg-blue-50/60",
    text: "text-blue-600",
    border: "border-blue-100",
    icon: (
      <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3m8-6l3 3-3 3M14 4l-4 16" />
      </svg>
    ),
  },
};

export default function QuestionCard({ card, bookmarked, onToggle, isCompleted, onToggleCompleted }) {
  const { question, type, company, year } = card;
  const domain = COMPANY_DOMAINS[company] || COMPANY_DOMAINS[company.trim()];
  const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null;
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedQuestion, setCopiedQuestion] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const answerRef = useRef(null);
  const { chat } = useGroq();

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.Technical;

  const handleCopyQuestion = () => {
    navigator.clipboard.writeText(question);
    setCopiedQuestion(true);
    setTimeout(() => setCopiedQuestion(false), 2000);
  };

  const handleCopyAnswer = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const fetchAnswer = async () => {
    if (answer) { setOpen(v => !v); return; }
    setOpen(true);
    setLoading(true);
    setError("");
    setAnswer("");
    try {
      await chat(
        [
          { role: "system", content: "You are a concise technical interview coach helping CS students prepare for campus placements. Give clear, structured answers with examples where relevant. Use **bold** for key terms and `code` for inline code. Keep answers under 300 words unless a coding question requires more." },
          { role: "user", content: `Interview question (${type}, asked at ${company}):\n\n${question}\n\nProvide a clear, interview-ready answer.` },
        ],
        (_, full) => {
          setAnswer(full);
          if (answerRef.current) answerRef.current.scrollTop = answerRef.current.scrollHeight;
        }
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl border hover:border-zinc-300/80 transition-all duration-200 group ${isCompleted ? "border-emerald-200/80 bg-emerald-50/20" : "border-zinc-200/80"}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0 text-left">
            {/* Completion checkbox */}
            {onToggleCompleted && (
              <button
                onClick={() => onToggleCompleted(card.id)}
                title={isCompleted ? "Mark as not done" : "Mark as done"}
                aria-label={isCompleted ? "Mark as not done" : "Mark as done"}
                className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all duration-200 active:scale-[0.9] ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                    : "border-zinc-300 hover:border-zinc-400 text-transparent hover:bg-zinc-50"
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
            <div className="flex-1 min-w-0">
              {/* Tags row */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-[3px] rounded-md border ${config.bg} ${config.text} ${config.border}`}>
                  {config.icon} {type}
                </span>
                <span className="text-[11px] font-medium px-2 py-[3px] rounded-md bg-zinc-50 border border-zinc-200/60 text-zinc-500">
                  {year}
                </span>
              {company !== "General Question Bank" && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-[3px] rounded-md bg-zinc-50 text-zinc-500 max-w-[200px] truncate border border-zinc-200/60" title={company}>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt=""
                      onError={(e) => { e.target.style.display = 'none'; }}
                      className="w-3 h-3 object-contain rounded-sm flex-shrink-0"
                    />
                  ) : (
                    <svg className="w-3 h-3 text-zinc-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9h0M9 13h0M9 17h0" />
                    </svg>
                  )}
                  <span className="truncate">{company}</span>
                </span>
              )}
            </div>
            <p className={`text-[13px] font-normal leading-relaxed ${isCompleted ? "text-zinc-400 line-through" : "text-zinc-700"}`}>{question}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleCopyQuestion}
              title="Copy question"
              aria-label="Copy question text"
              className="flex-shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100/70 transition-all duration-200 md:opacity-0 group-hover:opacity-100 active:scale-[0.93]"
            >
              {copiedQuestion ? (
                <svg className="w-[17px] h-[17px] text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h6m-6 4h6m-6 4h1" />
                </svg>
              )}
            </button>
            
            <button
              onClick={onToggle}
              title={bookmarked ? "Remove bookmark" : "Save question"}
              aria-label={bookmarked ? "Remove bookmark" : "Save question"}
              className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 active:scale-[0.93] ${
                bookmarked
                  ? "text-amber-500 bg-amber-50/80"
                  : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100/70 md:opacity-0 group-hover:opacity-100"
              }`}
            >
              <svg className="w-[17px] h-[17px]" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Get AI Answer Button */}
        <button 
          onClick={fetchAnswer}
          className="mt-3 flex items-center gap-1 text-[12px] font-medium text-zinc-400 hover:text-zinc-700 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200 rounded"
        >
          <svg className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
          {open ? "Hide Answer" : "Get AI Answer"}
        </button>
      </div>

      {/* AI Answer Section */}
      {open && (
        <div className="border-t border-zinc-100 bg-zinc-50/50 px-4 py-3.5 animate-fadeIn rounded-b-xl overflow-hidden">
          {loading && !answer && (
            <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-400 py-1">
              <svg className="animate-spin h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Generating answer…</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50/60 border border-red-200/80 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px]">
              <div className="flex items-center gap-2 text-red-600">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span>{error}</span>
              </div>
              <button
                onClick={fetchAnswer}
                className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                Retry
              </button>
            </div>
          )}
          
          {answer && (
            <div ref={answerRef} className="text-[13px] text-zinc-600 leading-relaxed max-h-72 overflow-y-auto scrollbar-thin text-left">
              <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2 mb-2.5">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-700">
                  <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                  <span>AI Coach</span>
                </div>
                <button
                  onClick={handleCopyAnswer}
                  className="text-[11px] font-medium text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-zinc-200/80 shadow-sm active:scale-[0.96]"
                  title="Copy answer to clipboard"
                >
                  {copiedAnswer ? (
                    <>
                      <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h6m-6 4h6m-6 4h1" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="prose-clean max-w-none text-[13px] leading-relaxed">
                {renderMarkdown(answer)}
              </div>
              {loading && <span className="inline-block w-1 h-3.5 bg-zinc-300 animate-pulse ml-0.5 align-middle rounded-full"/>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
