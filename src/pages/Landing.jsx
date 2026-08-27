import { useState, useMemo } from "react";
import { takeAuthNotice } from "../utils/session";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import PublicShell from "./PublicShell";
import { useQuestionData } from "../hooks/useQuestionData";
import { COMPANY_DOMAINS } from "../utils/companyDomains";

const FAQ = [
  {
    q: "Which companies recruit at CMRIT?",
    a: "Over 170 companies have run campus drives at CMR Institute of Technology across the last five placement seasons, including Deloitte, Cognizant, Capgemini, Accenture, PhonePe, Tata Elxsi, EY, GlobalLogic and Publicis Sapient. Every one of them has a page here with the questions students actually reported.",
  },
  {
    q: "Are these real interview questions?",
    a: "Yes. They are compiled from CMRIT students' recollections after their own campus drives, organised by company and placement season. Because they come from memory, wording can vary slightly from what was asked on the day.",
  },
  {
    q: "Is it free?",
    a: "Browsing is free: you can see every company, every placement season and exactly how many technical, coding and HR questions each one has, with no payment details required. Reading the questions themselves, along with the notes library, AI answers and mock interviews, is part of the ₹99 pass, which lasts 60 days.",
  },
  {
    q: "What kind of questions are asked in campus placements?",
    a: "Most drives run three rounds: an aptitude or online assessment, a technical interview covering DSA, OOP, DBMS, operating systems and networks, and an HR round. The questions here are split into Technical, Programming and HR so you can prepare for each round separately.",
  },
  {
    q: "Who can sign in?",
    a: "Sign-in is restricted to @cmrit.ac.in Google accounts. The public question pages are readable by anyone without signing in.",
  },
];

function Stat({ value, label, loading }) {
  return (
    <div className="text-center">
      <div className="text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-zinc-900">
        {loading ? "—" : value}
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-zinc-400">{label}</div>
    </div>
  );
}

function CompanyPill({ company }) {
  const [err, setErr] = useState(false);
  const domain =
    COMPANY_DOMAINS[company.name] ||
    company.variants.map((v) => COMPANY_DOMAINS[v]).find(Boolean);

  return (
    <Link
      to={`/company/${company.slug}`}
      className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-3 py-2 text-[12px] font-medium text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:text-zinc-900 hover:shadow-sm"
    >
      {domain && !err ? (
        <img
          src={`https://logos.hunter.io/${domain}`}
          alt=""
          onError={() => setErr(true)}
          className="h-4 w-4 flex-shrink-0 rounded object-contain"
        />
      ) : (
        <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded bg-zinc-100 text-[9px] font-semibold text-zinc-400">
          {company.name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="truncate">{company.name}</span>
    </Link>
  );
}

export default function Landing() {
  const { companies, totals, loading } = useQuestionData(null);

  // If the dashboard just dropped a session the server rejected, say so here --
  // this page is where that student lands, and without a word they would only
  // see themselves mysteriously signed out.
  const [authNotice] = useState(() => takeAuthNotice());

  // The most-documented companies lead, so the highest-value pages get the
  // strongest internal links. This grid is also how a crawler discovers every
  // company page in the first place.
  const featured = useMemo(
    () =>
      [...companies]
        .sort((a, b) => b.totalCount - a.totalCount)
        .slice(0, 36),
    [companies]
  );

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }),
    []
  );

  return (
    <PublicShell>
      <Seo
        title="CMRIT Placement Questions — Previous Year Interview Questions by Company"
        description="Real previous year interview questions from companies that recruited at CMR Institute of Technology. Technical, coding and HR rounds, organised by company and placement season."
        path="/"
        jsonLd={jsonLd}
      />

      {authNotice && (
        <div className="border-b border-amber-200/70 bg-amber-50/70">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 px-6 py-3 text-center text-[13px] text-amber-900">
            <span>{authNotice}</span>
            <Link to="/login" className="font-medium underline underline-offset-2">
              Sign in again
            </Link>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="border-b border-zinc-200/60 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-zinc-200/60 bg-zinc-50 px-3 py-1 text-[11px] font-medium text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Used by 500+ CMRIT students
          </div>

          <h1 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.03em] text-zinc-900 sm:text-[40px]">
            CMRIT placement interview questions,
            <br className="hidden sm:block" /> company by company
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-zinc-500">
            Every question students reported from campus drives at CMR Institute
            of Technology — technical, coding and HR — organised by company and
            placement season.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              to="/companies"
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-[14px] font-medium text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98]"
            >
              Browse questions
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-[14px] font-medium text-zinc-700 transition-colors hover:border-zinc-300"
            >
              Sign in with CMRIT email
            </Link>
          </div>

          <div className="mt-10 flex justify-center gap-8 border-t border-zinc-100 pt-7">
            <Stat loading={loading} value={totals.companies} label="Companies" />
            <Stat loading={loading} value={totals.total.toLocaleString()} label="Questions" />
            <Stat loading={loading} value={totals.years} label="Seasons" />
          </div>
        </div>
      </section>

      {/* Company grid: the crawl surface. */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-zinc-900">
              Browse by company
            </h2>
            <p className="mt-1 text-[13px] text-zinc-500">
              Questions from the recruiters with the most recorded drives.
            </p>
          </div>
          <Link
            to="/companies"
            className="flex-shrink-0 text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
          >
            All {totals.companies || ""} &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-[38px] animate-pulse rounded-xl bg-zinc-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((c) => (
              <CompanyPill key={c.slug} company={c} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="border-y border-zinc-200/60 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-zinc-900">
            How students use it
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                t: "Prepare for a specific drive",
                d: "Open the company you are interviewing with and read exactly what it asked in previous seasons, split by technical, coding and HR round.",
              },
              {
                t: "Get an answer, not just the question",
                d: "AI answers explain any question at interview depth, with the reasoning a panel expects rather than a one-line definition.",
              },
              {
                t: "Rehearse with your own resume",
                d: "The mock interviewer reads your resume in the browser and asks questions drawn from your own projects and stack, with follow-ups.",
              },
            ].map((f) => (
              <div key={f.t} className="rounded-xl border border-zinc-200/80 bg-[#fafafa] p-5">
                <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-zinc-900">{f.t}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ: real on-page text backing the FAQPage schema above. */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-zinc-900">
          Frequently asked questions
        </h2>
        <dl className="mt-6 space-y-5">
          {FAQ.map((f) => (
            <div key={f.q} className="border-b border-zinc-100 pb-5 last:border-0">
              <dt className="text-[14px] font-medium text-zinc-900">{f.q}</dt>
              <dd className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </PublicShell>
  );
}
