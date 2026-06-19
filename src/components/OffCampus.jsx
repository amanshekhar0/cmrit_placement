const SHEET_ID = "1F76IAJ9661keW37wFZqutIXOQf1vBJNx";
const GID = "116538532";
// /preview renders a read-only embed with no edit toolbar.
const EMBED_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/preview?gid=${GID}`;

export default function OffCampus() {
  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shadow-sm">
          <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="font-semibold text-zinc-900 text-[15px] tracking-tight">Apply Off Campus</h2>
          <p className="text-zinc-400 text-[12px]">Curated off-campus openings — view only, updated regularly</p>
        </div>
      </div>

      {/* Read-only sheet embed */}
      <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="relative w-full" style={{ height: "70vh", minHeight: 480 }}>
          <iframe
            src={EMBED_URL}
            title="Off Campus Opportunities"
            className="absolute inset-0 w-full h-full"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      </div>

      <p className="text-[11px] text-zinc-400 mt-3 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        This list is view-only — downloading and copying are disabled.
      </p>
    </div>
  );
}
