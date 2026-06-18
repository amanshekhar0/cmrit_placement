import { useState, useEffect } from "react";

export default function Navbar({ bookmarkCount, showBookmarks, onToggleBookmarks, user, onLogout, onGoHome }) {
  const [showSettings, setShowSettings] = useState(false);
  const [navApiKey, setNavApiKey] = useState(() => localStorage.getItem("cmrit_groq_api_key") || "");

  const handleSaveApiKey = (val) => {
    setNavApiKey(val);
    if (val.trim()) {
      localStorage.setItem("cmrit_groq_api_key", val.trim());
    } else {
      localStorage.removeItem("cmrit_groq_api_key");
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setNavApiKey(localStorage.getItem("cmrit_groq_api_key") || "");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Close settings on outside click
  useEffect(() => {
    if (!showSettings) return;
    const handle = (e) => {
      if (!e.target.closest("[data-settings-panel]") && !e.target.closest("[data-settings-trigger]")) {
        setShowSettings(false);
      }
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [showSettings]);

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between relative">
        {/* Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 select-none text-left focus-visible:outline-none group"
        >
          <div className="w-8 h-8 bg-zinc-900 rounded-[10px] flex items-center justify-center shadow-sm group-hover:bg-zinc-800 transition-colors">
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4L3 8l9 4 9-4-9-4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 10v3c0 2 2.2 3.5 5 3.5s5-1.5 5-3v-3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l4-4 3 3 6-6m0 0h-4m4 0v4" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-zinc-900 text-[13px] tracking-[-0.01em] group-hover:text-zinc-600 transition-colors">CMRIT Placement</p>
          </div>
        </button>
        
        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              {/* Bookmark Toggle */}
              <button
                onClick={onToggleBookmarks}
                aria-pressed={showBookmarks}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 ${
                  showBookmarks
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/80"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill={showBookmarks ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
                <span className="hidden sm:inline">Saved</span>
                {bookmarkCount > 0 && (
                  <span className={`text-[10px] rounded-md min-w-[18px] h-[18px] px-1 flex items-center justify-center font-semibold tabular-nums ${
                    showBookmarks 
                      ? "bg-white/20 text-white" 
                      : "bg-zinc-200/70 text-zinc-600"
                  }`}>{bookmarkCount}</span>
                )}
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-zinc-200/80 mx-1 hidden sm:block" />

              {/* User Profile */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {user.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-7 h-7 rounded-full ring-1 ring-zinc-200 flex-shrink-0" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center font-semibold text-[11px] ring-1 ring-zinc-200 flex-shrink-0">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
                <div className="hidden md:block leading-none">
                  <p className="text-[12px] font-medium text-zinc-800">{user.name}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{user.email}</p>
                </div>
                
                {/* Settings */}
                <button
                  data-settings-trigger
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 rounded-lg transition-all duration-200 active:scale-[0.95] ${
                    showSettings 
                      ? "text-zinc-900 bg-zinc-100" 
                      : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100/60"
                  }`}
                  title="Settings"
                >
                  <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100/60 rounded-lg transition-all duration-200 active:scale-[0.95]"
                  title="Sign Out"
                >
                  <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </>
          ) : null}
        </div>

        {/* Floating Settings Panel */}
        {showSettings && user && (
          <div data-settings-panel className="absolute right-5 top-[calc(100%+6px)] w-72 bg-white rounded-xl p-4 shadow-lg shadow-zinc-200/50 border border-zinc-200/80 z-50 animate-fadeInScale">
            <p className="font-semibold text-zinc-900 text-[13px] tracking-tight">Settings</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Configure your Groq API key</p>
            
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-medium text-zinc-500">
                  API Key
                </label>
                <a 
                  href="https://console.groq.com/keys" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  Get one →
                </a>
              </div>
              <input
                type="password"
                value={navApiKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3 py-2 rounded-lg text-[12px] bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/8 focus:border-zinc-300 transition-all duration-200"
              />
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Stored locally in your browser. Leave empty for the default shared key.
              </p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
