import { Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import PublicShell from "./PublicShell";

/**
 * Real 404.
 *
 * Previously any unknown path rendered the landing page, which returns HTTP 200
 * with full content -- a "soft 404". Google indexes those as duplicates of the
 * homepage. A static host cannot send a 404 status for an SPA route, so the
 * next best signal is a distinct page carrying noindex.
 */
export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <PublicShell>
      <Seo
        title="Page not found | CMRIT Placement Portal"
        description="This page does not exist."
        path={pathname}
        noindex
      />

      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-[13px] font-medium tabular-nums text-zinc-300">404</p>
        <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-zinc-900">
          This page does not exist
        </h1>
        <p className="mx-auto mt-2 max-w-[320px] text-[14px] leading-relaxed text-zinc-500">
          The link may be out of date, or the company you are looking for has not
          run a drive at CMRIT yet.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Link
            to="/companies"
            className="rounded-xl bg-zinc-900 px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Browse companies
          </Link>
          <Link
            to="/"
            className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-[13px] font-medium text-zinc-700 transition-colors hover:border-zinc-300"
          >
            Go home
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
