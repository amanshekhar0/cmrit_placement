import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Seo, { SITE } from "../components/Seo";
import PublicShell from "./PublicShell";
import { useQuestionData } from "../hooks/useQuestionData";
import { slugify } from "../utils/slug";
import { COMPANY_DOMAINS } from "../utils/companyDomains";
import { renderMarkdown } from "../utils/markdown";

const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "") : "";

function useSession() {
  // Guarded for the prerender pass, which renders this component in Node where
  // there is no localStorage.
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem("cmrit_user");
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function QuestionItem({ question, index, tone, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-xl border border-zinc-200/80 bg-white">
      <div className="flex gap-3 p-4">
        <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[11px] font-semibold tabular-nums ${tone}`}>
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] leading-relaxed text-zinc-700">{question}</p>
          {answer && (
            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              {open ? "Hide answer" : "Show answer"}
              <svg
                className={`h-3 w-3 transition-transform duration-200 ${open ?"rotate-180" :""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {answer && open && (
        <div className="prose-clean border-t border-zinc-100 bg-zinc-50/50 px-4 py-3.5 pl-12 text-[13px] leading-relaxed text-zinc-600">
          {renderMarkdown(answer)}
        </div>
      )}
    </li>
  );
}

function QuestionBlock({ heading, items, tone, answers }) {
  if (!items.length) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-[14px] font-semibold tracking-[-0.01em] text-zinc-800">
        {heading}
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-zinc-500">
          {items.length}
        </span>
      </h2>
      <ol className="space-y-2">
        {items.map((q, i) => (
          <QuestionItem
            key={`${heading}-${i}`}
            question={q}
            index={i}
            tone={tone}
            answer={answers?.[q]?.answer}
          />
        ))}
      </ol>
    </section>
  );
}

export default function CompanyPage() {
  const { slug, year } = useParams();
  const user = useSession();
  const { tech, hr, loading, error, companies } = useQuestionData(user?.token);

  const company = companies.find((c) => c.slug === slug);

  // Every raw spelling that maps to this slug, so casing variants in the data
  // ("PhonePe" / "Phonepe") all land on the one page.
  const entries = useMemo(() => {
    const techEntries = tech.filter((e) => slugify(e.company || "") === slug);
    const hrEntries = hr.filter((e) => slugify(e.company || "") === slug);
    return { techEntries, hrEntries };
  }, [tech, hr, slug]);

  const [answers, setAnswers] = useState(() => {
    if (typeof window === "undefined") return globalThis.__PRERENDER_ANSWERS__ || {};
    return window.__PRERENDER_DATA__?.answers || {};
  });

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    const token = user?.token;
    fetch(`${API_URL}/api/answers/company/${slug}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d?.success) setAnswers(d.answers || {}); })
      // Answers are an enhancement: a failure here must leave the questions
      // themselves readable rather than breaking the page.
      .catch(() => {});
    return () => { alive = false; };
  }, [slug, user?.token]);

  const scoped = useMemo(() => {
    const t = year
      ? entries.techEntries.filter((e) => e.year === year)
      : entries.techEntries;

    const technical = t.flatMap((e) => e.technical_questions || []);
    const programming = t.flatMap((e) => e.programming_questions || []);
    // HR entries carry a years array rather than a single year.
    const hrScoped = year
      ? entries.hrEntries.filter((e) => (e.years || []).includes(year))
      : entries.hrEntries;
    const hrQs = hrScoped.flatMap((e) => e.hr_questions || []);

    const locked =
      t.reduce((n, e) => n + (e.lockedCount || 0), 0) +
      hrScoped.reduce((n, e) => n + (e.lockedCount || 0), 0);

    return { technical, programming, hrQs, locked, years: [...new Set(entries.techEntries.map((e) => e.year).filter(Boolean))].sort() };
  }, [entries, year]);

  if (loading) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="h-7 w-52 animate-pulse rounded-lg bg-zinc-200/70" />
          <div className="mt-8 space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-100" />
            ))}
          </div>
        </div>
      </PublicShell>
    );
  }

  if (error || !company) {
    return (
      <PublicShell>
        <Seo title="Company not found | CMRIT Placement Portal" path={`/company/${slug}`} noindex />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-zinc-900">
            {error ? "Could not load questions" : "Company not found"}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-zinc-500">
            {error || "We do not have a record of this company recruiting at CMRIT."}
          </p>
          <Link
            to="/companies"
            className="mt-6 inline-block rounded-xl bg-zinc-900 px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Browse all companies
          </Link>
        </div>
      </PublicShell>
    );
  }

  const shownTotal = scoped.technical.length + scoped.programming.length + scoped.hrQs.length;
  const grandTotal = shownTotal + scoped.locked;
  const domain = COMPANY_DOMAINS[company.name] || company.variants.map((v) => COMPANY_DOMAINS[v]).find(Boolean);
  const path = year ? `/company/${slug}/${year}` : `/company/${slug}`;

  const title = year
    ? `${company.name} Interview Questions ${year} — CMRIT Campus Placement`
    : `${company.name} Interview Questions — CMRIT Placement (${grandTotal} Questions)`;

  const description = `${grandTotal} real interview questions asked by ${company.name} during CMRIT campus placements${
    year ? ` in ${year}` : company.years.length ? `, ${company.years[0]} to ${company.years[company.years.length - 1]}` : ""
  }. Technical, coding and HR rounds.`;

  // Only the questions actually on the page go into structured data. Marking up
  // content that is behind the paywall would be misrepresenting the page to
  // Google, which is exactly what the paywall markup below is there to declare.
  const visible = [
    ...scoped.technical.map((q) => ({ q, type: "Technical" })),
    ...scoped.programming.map((q) => ({ q, type: "Programming" })),
    ...scoped.hrQs.map((q) => ({ q, type: "HR" })),
  ];

  // Breadcrumbs are rendered visually below; this is the machine-readable twin,
  // which is what produces a "Home > Companies > X" trail under a search result
  // instead of a bare URL.
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Companies", item: `${SITE}/companies` },
      { "@type": "ListItem", position: 3, name: company.name, item: `${SITE}/company/${slug}` },
      ...(year
        ? [{ "@type": "ListItem", position: 4, name: year, item: `${SITE}/company/${slug}/${year}` }]
        : []),
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: title,
    url: `${SITE}${path}`,
    // Declares that part of this page is gated. This is Google's supported
    // mechanism for paywalled content; without it, showing crawlers more than
    // users would be cloaking.
    isAccessibleForFree: scoped.locked === 0,
    hasPart: scoped.locked
      ? { "@type": "WebPageElement", isAccessibleForFree: false, cssSelector: ".paywalled-questions" }
      : undefined,
    // Only questions with a real cached answer are marked up. A FAQPage whose
    // acceptedAnswer just restates where the question came from adds no value
    // and Google discounts it, so an unanswered question is better left out.
    mainEntity: visible
      .filter(({ q }) => answers[q]?.answer)
      .slice(0, 50)
      .map(({ q }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: answers[q].answer },
      })),
  };

  return (
    <PublicShell>
      <Seo title={title} description={description} path={path} jsonLd={jsonLd} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <nav className="mb-6 flex items-center gap-1.5 text-[12px] text-zinc-400">
          <Link to="/" className="transition-colors hover:text-zinc-700">Home</Link>
          <span>/</span>
          <Link to="/companies" className="transition-colors hover:text-zinc-700">Companies</Link>
          <span>/</span>
          <span className="text-zinc-600">{company.name}</span>
          {year && (<><span>/</span><span className="text-zinc-600">{year}</span></>)}
        </nav>

        <header className="mb-8 flex items-start gap-4">
          {domain && (
            <img
              src={`https://logos.hunter.io/${domain}`}
              alt=""
              className="mt-1 h-11 w-11 flex-shrink-0 rounded-xl border border-zinc-200/80 bg-white object-contain p-1.5"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div>
            <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-zinc-900">
              {company.name} Interview Questions
            </h1>
            <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-500">
              {grandTotal} question{grandTotal === 1 ? "" : "s"} from {company.name}&rsquo;s CMRIT
              campus drive{year ? ` in ${year}` : company.years.length > 1 ? "s" : ""}.
            </p>
          </div>
        </header>

        {scoped.years.length > 1 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-zinc-400">Filter by year:</span>
            <Link
              to={`/company/${slug}`}
              className={`rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-colors ${
 !year ?"border-zinc-900 bg-zinc-900 text-white" :"border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
 }`}
            >
              All
            </Link>
            {scoped.years.map((y) => (
              <Link
                key={y}
                to={`/company/${slug}/${y}`}
                className={`rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-colors ${
 year === y ?"border-zinc-900 bg-zinc-900 text-white" :"border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
 }`}
              >
                {y}
              </Link>
            ))}
          </div>
        )}

        <QuestionBlock heading="Technical" items={scoped.technical} tone="bg-blue-50 text-blue-600" answers={answers} />
        <QuestionBlock heading="Programming" items={scoped.programming} tone="bg-violet-50 text-violet-600" answers={answers} />
        <QuestionBlock heading="HR" items={scoped.hrQs} tone="bg-emerald-50 text-emerald-600" answers={answers} />

        {shownTotal === 0 && (
          <p className="rounded-xl border border-zinc-200/80 bg-white p-6 text-center text-[14px] text-zinc-500">
            No questions recorded for this selection yet.
          </p>
        )}

        {scoped.locked > 0 && (
          <div className="paywalled-questions rounded-2xl border border-zinc-200/80 bg-white p-7 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-zinc-900">
              {scoped.locked} more question{scoped.locked === 1 ? "" : "s"} from {company.name}
            </h2>
            <p className="mx-auto mt-1.5 max-w-[340px] text-[13px] leading-relaxed text-zinc-500">
              Unlock the full bank across all {companies.length} companies, plus notes,
              AI answers and mock interviews.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Unlock for &#8377;99 <span className="text-zinc-400">&middot; 2 months</span>
            </Link>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
