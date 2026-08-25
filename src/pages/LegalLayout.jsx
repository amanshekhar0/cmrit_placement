import { Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import { BUSINESS, POLICY_LAST_UPDATED } from "./legalContent";

/** Shared chrome for the policy pages Razorpay requires to be publicly reachable. */
export default function LegalLayout({ title, subtitle, children }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Seo
        title={`${title} | ${BUSINESS.tradeName}`}
        description={subtitle}
        path={pathname}
      />
      <header className="border-b border-zinc-200/60 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-70">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-zinc-900">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4L3 8l9 4 9-4-9-4z" />
              </svg>
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.01em]">
              {BUSINESS.tradeName}
            </span>
          </Link>
          <Link
            to="/"
            className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
          >
            &larr; Back to portal
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-zinc-900">{title}</h1>
        {subtitle && <p className="mt-2 text-[14px] leading-relaxed text-zinc-500">{subtitle}</p>}
        <p className="mt-3 text-[12px] text-zinc-400">Last updated: {POLICY_LAST_UPDATED}</p>

        <div className="legal-prose mt-8 space-y-7">{children}</div>
      </main>

      <footer className="border-t border-zinc-200/60 bg-white py-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 text-[12px] text-zinc-400">
          <span>
            &copy; {new Date().getFullYear()} {BUSINESS.tradeName}
          </span>
          <nav className="flex flex-wrap gap-4">
            <Link to="/terms" className="transition-colors hover:text-zinc-700">Terms</Link>
            <Link to="/privacy" className="transition-colors hover:text-zinc-700">Privacy</Link>
            <Link to="/refund" className="transition-colors hover:text-zinc-700">Refunds</Link>
            <Link to="/pricing" className="transition-colors hover:text-zinc-700">Pricing</Link>
            <Link to="/contact" className="transition-colors hover:text-zinc-700">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/** A titled section within a policy page. */
export function Section({ heading, children }) {
  return (
    <section>
      <h2 className="mb-2.5 text-[15px] font-semibold tracking-[-0.01em] text-zinc-900">
        {heading}
      </h2>
      <div className="space-y-3 text-[14px] leading-[1.7] text-zinc-600">{children}</div>
    </section>
  );
}

/**
 * Flags a value that still needs the operator's real details.
 *
 * Rendering the placeholder loudly is deliberate: a policy page that silently
 * ships "TODO_SUPPORT_EMAIL" reads as complete and gets submitted to Razorpay
 * that way, which is a guaranteed activation rejection.
 */
export function Detail({ value, label }) {
  const missing = typeof value === "string" && value.startsWith("TODO");
  if (missing) {
    return (
      <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-900">
        [ set {label} in src/pages/legalContent.js ]
      </span>
    );
  }
  return <span>{value}</span>;
}
