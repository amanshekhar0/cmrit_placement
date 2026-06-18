import { useState } from "react";
import QuestionCard from "./QuestionCard";
import { COMPANY_DOMAINS } from "../utils/companyDomains";

function getInitials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function MiniProgressBar({ cards, completed }) {
  const total = cards.length;
  if (total === 0) return null;
  const done = cards.filter((c) => completed.has(c.id)).length;
  if (done === 0) return null;
  const pct = (done / total) * 100;

  return (
    <div className="w-full mt-2.5 space-y-1">
      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
        <div className="bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[9px] text-zinc-400 font-medium tabular-nums text-center">
        {done}/{total} done
      </p>
    </div>
  );
}

function CompanyCardButton({ company, count, isActive, onSelect, cards, completed }) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(company);
  const domain = COMPANY_DOMAINS[company] || COMPANY_DOMAINS[company.trim()];
  const logoUrl = domain ? `https://logos.hunter.io/${domain}` : null;

  return (
    <button
      onClick={onSelect}
      aria-pressed={isActive}
      className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200 text-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 ${
        isActive
          ? "border-zinc-900 bg-zinc-50 shadow-sm"
          : "border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-sm"
      }`}
    >
      {logoUrl && !imgError ? (
        <div className="w-11 h-11 rounded-xl bg-white p-1.5 border border-zinc-200/60 flex items-center justify-center flex-shrink-0 group-hover:scale-[1.03] transition-transform duration-200">
          <img
            src={logoUrl}
            alt={`${company} Logo`}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="w-11 h-11 rounded-xl bg-zinc-50 border border-zinc-200/60 flex items-center justify-center flex-shrink-0 group-hover:scale-[1.03] transition-transform duration-200">
          <span className="text-zinc-600 font-semibold text-[13px] tracking-tight">{initials}</span>
        </div>
      )}
      <div className="min-w-0 w-full text-center">
        <p className="text-[12px] font-medium leading-tight truncate text-zinc-700 group-hover:text-zinc-900 transition-colors" title={company}>
          {company}
        </p>
        <p className="text-[10px] text-zinc-400 font-medium mt-1 tabular-nums">{count} questions</p>
        {cards && completed && <MiniProgressBar cards={cards} completed={completed} />}
      </div>
      {isActive && (
        <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-zinc-900 rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

function DrawerHeader({ company, cards, completed }) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(company);
  const domain = COMPANY_DOMAINS[company] || COMPANY_DOMAINS[company.trim()];
  const logoUrl = domain ? `https://logos.hunter.io/${domain}` : null;

  const done = cards ? cards.filter((c) => completed.has(c.id)).length : 0;
  const total = cards ? cards.length : 0;

  return (
    <div className="flex items-center gap-3">
      {logoUrl && !imgError ? (
        <div className="w-9 h-9 bg-white p-1 rounded-lg flex items-center justify-center border border-zinc-200/60 shadow-sm flex-shrink-0">
          <img
            src={logoUrl}
            alt={`${company} Logo`}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="w-9 h-9 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-200/60 shadow-sm flex-shrink-0">
          <span className="text-zinc-600 font-semibold text-[11px]">{initials}</span>
        </div>
      )}
      <div className="text-left">
        <h2 className="text-zinc-900 font-semibold text-[15px] tracking-[-0.01em] leading-tight">{company}</h2>
        <p className="text-zinc-400 text-[11px] font-normal mt-0.5">
          {done > 0 ? `${done}/${total} completed · ` : ""}Placement interview questions
        </p>
      </div>
    </div>
  );
}

function CompanyQuestions({ cards, bookmarks, onToggleBookmark, completed, onToggleCompleted }) {
  const tech = cards.filter((c) => c.type === "Technical");
  const prog = cards.filter((c) => c.type === "Programming");
  const hr = cards.filter((c) => c.type === "HR");
  const [tab, setTab] = useState("all");

  const shown = tab === "technical" ? tech : tab === "programming" ? prog : tab === "hr" ? hr : cards;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-1 border-b border-zinc-100 pb-2">
        {[
          { key: "all", label: `All (${cards.length})` },
          { key: "technical", label: `Technical (${tech.length})`, count: tech.length },
          { key: "programming", label: `Programming (${prog.length})`, count: prog.length },
          { key: "hr", label: `HR (${hr.length})`, count: hr.length },
        ]
          .filter((t) => t.key === "all" || t.count > 0)
          .map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={`text-[12px] px-3 py-1.5 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200 ${
                tab === t.key
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100/60"
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>
      <div className="space-y-2.5">
        {shown.map((card) => (
          <QuestionCard
            key={card.id}
            card={card}
            bookmarked={bookmarks.has(card.id)}
            onToggle={() => onToggleBookmark(card.id)}
            isCompleted={completed.has(card.id)}
            onToggleCompleted={onToggleCompleted}
          />
        ))}
      </div>
    </div>
  );
}

export default function CompanyGrid({ companies, cardsByCompany, bookmarks, onToggleBookmark, activeCompany, onSelectCompany, completed, onToggleCompleted }) {
  const filteredCompanies = companies.filter((c) => c !== "General Question Bank");

  return (
    <div className="space-y-5">
      {/* Company Grid */}
      {!activeCompany && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredCompanies.map((company) => {
            const cards = cardsByCompany[company] || [];
            return (
              <CompanyCardButton
                key={company}
                company={company}
                count={cards.length}
                isActive={false}
                onSelect={() => onSelectCompany(company)}
                cards={cards}
                completed={completed}
              />
            );
          })}
        </div>
      )}

      {/* Active Company Detail */}
      {activeCompany && cardsByCompany[activeCompany] && (
        <div className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden animate-fadeIn">
          <div className="bg-zinc-50/80 px-5 py-3.5 flex items-center justify-between border-b border-zinc-200/60">
            <DrawerHeader company={activeCompany} cards={cardsByCompany[activeCompany]} completed={completed} />
            <button
              onClick={() => onSelectCompany(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-lg text-[12px] font-medium text-zinc-500 hover:text-zinc-700 shadow-sm transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
          </div>
          <div className="px-5 pb-5 pt-1">
            <CompanyQuestions
              cards={cardsByCompany[activeCompany]}
              bookmarks={bookmarks}
              onToggleBookmark={onToggleBookmark}
              completed={completed}
              onToggleCompleted={onToggleCompleted}
            />
          </div>
        </div>
      )}
    </div>
  );
}
