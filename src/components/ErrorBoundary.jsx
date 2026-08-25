import { Component } from "react";

/**
 * Catches render-time crashes so a single bad component does not white-screen
 * the whole site.
 *
 * Without this, any thrown error in the tree unmounts everything and the user
 * sees a blank page with no way forward -- indistinguishable from the site
 * being down.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Kept as console output rather than a reporting service: there is no error
    // tracker wired up, and swallowing it silently would make production
    // crashes invisible.
    console.error("Render error:", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-6 font-sans">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-[14px] bg-zinc-900">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>

          <h1 className="text-[17px] font-semibold tracking-[-0.02em] text-zinc-900">
            Something broke on this page
          </h1>
          <p className="mx-auto mt-2 max-w-[280px] text-[13px] leading-relaxed text-zinc-500">
            This is a bug on our side, not something you did. Reloading usually
            gets you moving again.
          </p>

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Reload
            </button>
            <a
              href="/"
              className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-[13px] font-medium text-zinc-700 transition-colors hover:border-zinc-300"
            >
              Go home
            </a>
          </div>

          {import.meta.env.DEV && (
            <pre className="mt-5 max-h-40 overflow-auto rounded-lg bg-zinc-50 p-3 text-left text-[11px] leading-relaxed text-red-600">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
