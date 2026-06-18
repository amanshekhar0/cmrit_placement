export default function SearchBar({ query, onChange, onSearchSubmit }) {
  return (
    <div className="relative max-w-xl mx-auto w-full">
      <svg 
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-zinc-300 pointer-events-none"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
      </svg>
      <input 
        type="text" 
        value={query} 
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSearchSubmit) {
            onSearchSubmit();
          }
        }}
        placeholder="Search questions, companies, topics..."
        aria-label="Search questions, topics, companies"
        className="w-full pl-10 pr-9 py-2.5 rounded-xl text-[13px] bg-white border border-zinc-200 shadow-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all duration-200"
      />
      {query && (
        <button 
          onClick={() => onChange("")} 
          aria-label="Clear search" 
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors duration-200 focus-visible:outline-none rounded-full"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      )}
    </div>
  );
}
