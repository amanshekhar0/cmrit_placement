import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Seo, { SITE } from "../components/Seo";
import PublicShell from "./PublicShell";
import { useQuestionData } from "../hooks/useQuestionData";
import { COMPANY_DOMAINS } from "../utils/companyDomains";

function CompanyCard({ company }) {
  const [imgError, setImgError] = useState(false);
  const domain =
    COMPANY_DOMAINS[company.name] ||
    company.variants.map((v) => COMPANY_DOMAINS[v]).find(Boolean);

  return (
    <Link
      to={`/company/${company.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white p-3.5 transition-all duration-200 hover:border-zinc-300 hover:shadow-sm"
    >
      {domain && !imgError ? (
        <img
          src={`https://logos.hunter.io/${domain}`}
          alt=""
          onError={() => setImgError(true)}
          className="h-8 w-8 flex-shrink-0 rounded-lg object-contain"
        />
      ) : (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-[13px] font-semibold text-zinc-400">
          {company.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-zinc-800 group-hover:text-zinc-900">
          {company.name}
        </p>
        <p className="mt-0.5 text-[11px] tabular-nums text-zinc-400">
          {company.totalCount} questions
          {company.years.length ? ` · ${company.years.length} season${company.years.length === 1 ? "" : "s"}` : ""}
        </p>
      </div>
    </Link>
  );
}

export default function Companies() {
  const { companies, totals, loading, error } = useQuestionData(null);
  const [filter, setFilter] = useState("");

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, filter]);

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Companies that recruit at CMRIT",
      url: `${SITE}/companies`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: companies.length,
        itemListElement: companies.slice(0, 100).map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          url: `${SITE}/company/${c.slug}`,
        })),
      },
    }),
    [companies]
  );

  return (
    <PublicShell>
      <Seo
        title={`All ${totals.companies || ""} Companies Recruiting at CMRIT — Interview Questions`}
        description="Browse previous year interview questions by company. Every recruiter that has visited CMR Institute of Technology, with technical, coding and HR rounds."
        path="/companies"
        jsonLd={jsonLd}
      />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-zinc-900">
          Companies recruiting at CMRIT
        </h1>
        <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-zinc-500">
          {loading
            ? "Loading the question bank…"
            : `${totals.companies} companies, ${totals.total.toLocaleString()} questions, ${totals.years} placement seasons.`}
        </p>

        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter companies…"
          aria-label="Filter companies"
          className="mt-5 w-full max-w-sm rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-[13px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
        />

        {error && (
          <p className="mt-6 rounded-xl border border-red-200/60 bg-red-50/70 px-4 py-3 text-[13px] text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-[62px] animate-pulse rounded-xl bg-zinc-100" />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((c) => (
                <CompanyCard key={c.slug} company={c} />
              ))}
            </div>
            {!shown.length && (
              <p className="mt-8 text-center text-[14px] text-zinc-400">
                No company matches &ldquo;{filter}&rdquo;.
              </p>
            )}
          </>
        )}
      </div>
    </PublicShell>
  );
}
