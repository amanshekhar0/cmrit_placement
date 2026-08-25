import { Link } from "react-router-dom";

/**
 * Chrome for the publicly crawlable pages.
 *
 * Kept separate from the signed-in dashboard shell: these pages must render
 * fully without a session, since they are the surface Google indexes.
 */
export default function PublicShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] font-sans text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-70">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-zinc-900">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4L3 8l9 4 9-4-9-4z" />
              </svg>
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.01em]">CMRIT Placement</span>
          </Link>

          <nav aria-label="Main" className="flex items-center gap-1">
            <Link
              to="/companies"
              className="hidden rounded-lg px-3 py-1.5 text-[13px] text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 sm:block"
            >
              Companies
            </Link>
            <Link
              to="/pricing"
              className="hidden rounded-lg px-3 py-1.5 text-[13px] text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 sm:block"
            >
              Pricing
            </Link>            <Link
              to="/login"
              className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>

      <footer className="border-t border-zinc-200/60 bg-white py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 text-[12px] text-zinc-400 sm:flex-row">
          <span>
            &copy; {new Date().getFullYear()} CMRIT ·{" "}
            <a
              href="https://amanshekhar.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-zinc-600"
            >
              by Aman Shekhar
            </a>
          </span>
          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link to="/companies" className="transition-colors hover:text-zinc-600">Companies</Link>
            <Link to="/pricing" className="transition-colors hover:text-zinc-600">Pricing</Link>
            <Link to="/terms" className="transition-colors hover:text-zinc-600">Terms</Link>
            <Link to="/privacy" className="transition-colors hover:text-zinc-600">Privacy</Link>
            <Link to="/refund" className="transition-colors hover:text-zinc-600">Refunds</Link>
            <Link to="/contact" className="transition-colors hover:text-zinc-600">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
