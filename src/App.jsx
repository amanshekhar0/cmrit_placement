import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import Clarity from "@microsoft/clarity";
import { COMPANY_DOMAINS } from "./utils/companyDomains";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import QuestionList from "./components/QuestionList";
import CompanyGrid from "./components/CompanyGrid";
import ChatBot from "./components/ChatBot";
import AdminPanel from "./components/AdminPanel";
import NotesSection from "./components/NotesSection";
import OffCampus from "./components/OffCampus";
import MustRead from "./components/MustRead";
import UpgradeModal, { LockedQuestions, ExpiryBanner } from "./components/Paywall";
// Lazy-loaded: pulls in pdf.js (~400KB), so only load it when actually opened.
const MockInterview = lazy(() => import("./components/MockInterview"));
import { useBookmarks } from "./hooks/useBookmarks";
import { useProgress } from "./hooks/useProgress";

function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
}

function buildCards(techData, hrData) {
  const cards = [];
  if (techData) {
    techData.forEach((entry) => {
      if (entry.technical_questions) {
        entry.technical_questions.forEach((q, i) => {
          if (q && q.trim())
            cards.push({ id: `${entry.id}_T${i}`, question: q.trim(), type: "Technical", company: entry.company, year: entry.year });
        });
      }
      if (entry.programming_questions) {
        entry.programming_questions.forEach((q, i) => {
          if (q && q.trim())
            cards.push({ id: `${entry.id}_P${i}`, question: q.trim(), type: "Programming", company: entry.company, year: entry.year });
        });
      }
    });
  }
  if (hrData) {
    hrData.forEach((entry) => {
      if (entry.hr_questions) {
        entry.hr_questions.forEach((q, i) => {
          if (q && q.trim()) {
            const yearStr = entry.years && entry.years.length > 0 ? entry.years.join(", ") : "N/A";
            cards.push({ id: `HR_${entry.id}_H${i}`, question: q.trim(), type: "HR", company: entry.company, year: yearStr });
          }
        });
      }
    });
  }
  return cards;
}

function CompanyChip({ company, count, onClick }) {
  const [imgError, setImgError] = useState(false);
  const domain = COMPANY_DOMAINS[company] || COMPANY_DOMAINS[company.trim()];
  const brandfetchId = import.meta.env.VITE_BRANDFETCH_CLIENT_ID;
  const logoUrl = domain
    ? (brandfetchId
        ? `https://cdn.brandfetch.io/domain/${domain}?c=${brandfetchId}`
        : `https://logos.hunter.io/${domain}`)
    : null;

  return (
    <button
      onClick={onClick}
      className="text-[11px] px-2.5 py-1 bg-white border border-zinc-200/80 hover:border-zinc-300 text-zinc-600 rounded-lg font-medium hover:bg-zinc-50 transition-all duration-200 shadow-sm active:scale-[0.97] flex items-center gap-1.5"
    >
      {logoUrl && !imgError ? (
        <img
          src={logoUrl}
          alt=""
          onError={() => setImgError(true)}
          className="w-3.5 h-3.5 object-contain rounded-sm"
        />
      ) : (
        <svg className="w-3 h-3 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )}
      <span>{company}</span>
      <span className="ml-0.5 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 text-[10px] font-semibold tabular-nums">
        {count}
      </span>
    </button>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("cmrit_user");
    return cached ? JSON.parse(cached) : null;
  });

  // Track user in Clarity whenever the user state changes (login or load from cache)
  useEffect(() => {
    if (user) {
      try {
        Clarity.identify(user.email, undefined, undefined, user.name);
        Clarity.setTag("userType", "student");
      } catch (e) {
        console.error("Clarity tracking error:", e);
      }
    }
  }, [user]);

  const [authError, setAuthError] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem("cmrit_groq_api_key") || "");

  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  });
  const [activeCompany, setActiveCompany] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("company") || null;
  });
  const [showBookmarks, setShowBookmarks] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("bookmarks") === "true";
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showMockInterview, setShowMockInterview] = useState(false);
  const [showOffCampus, setShowOffCampus] = useState(false);
  const [showMustRead, setShowMustRead] = useState(false);
  const { bookmarks, toggle } = useBookmarks();
  const { completed, toggleCompleted } = useProgress();

  const [rawData, setRawData] = useState([]);
  const [hrData, setHrData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(false);
  // Mirrors the server's entitlement decision for the current session. Never
  // the source of truth -- the server re-checks on every request -- this only
  // drives what the UI renders.
  const [hasQuestionAccess, setHasQuestionAccess] = useState(false);
  const [subscription, setSubscription] = useState(null);

  // Fetch questions data from the API, sending the session token so the server
  // can decide how much of each entry to return.
  //
  // There is deliberately NO static-JSON fallback any more: the old one read
  // /interview_questions_combined.json straight from public/, which handed the
  // entire question bank to anyone who opened the network tab. Sampling is
  // enforced server-side, so the API is now the only source.
  useEffect(() => {
    const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "") : "";
    // The session JWT is stored inside the cached user object, not as its own key.
    const token = user && user.token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch(`${API_URL}/api/technical`, { headers }),
      fetch(`${API_URL}/api/hr`, { headers }),
    ])
      .then(async ([techRes, hrRes]) => {
        if (!techRes.ok || !hrRes.ok) throw new Error("API response not OK");
        const techJson = await techRes.json();
        const hrJson = await hrRes.json();
        setRawData(techJson.data || []);
        setHrData(hrJson.data || []);
        // The server is the authority on entitlement; mirror its answer so the
        // UI can show the lock state without a second round-trip.
        setHasQuestionAccess(!!techJson.hasAccess);
        setLoadingData(false);
      })
      .catch((err) => {
        console.error("Error fetching questions data:", err);
        setDataError(true);
        setLoadingData(false);
      });
  }, [user]);

  // Pull the full entitlement record once signed in, for the expiry banner and
  // the upgrade card. The question payload already carries `hasAccess`; this
  // adds the expiry date and days-left that the banner needs.
  useEffect(() => {
    // Logout clears this state directly; the effect only ever fetches.
    if (!user || !user.token) return;
    const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "") : "";
    fetch(`${API_URL}/api/subscription/status`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && d.success) setSubscription(d);
      })
      .catch(() => setSubscription(null));
  }, [user]);

  const [showUpgrade, setShowUpgrade] = useState(false);

  // How many questions the server withheld, in total and per company. The
  // counts arrive alongside the sampled payload; the question text does not.
  const lockedByCompany = useMemo(() => {
    const map = {};
    [...rawData, ...hrData].forEach((e) => {
      if (!e || !e.lockedCount) return;
      const key = (e.company || "").trim();
      map[key] = (map[key] || 0) + e.lockedCount;
    });
    return map;
  }, [rawData, hrData]);

  const lockedTotal = useMemo(
    () => Object.values(lockedByCompany).reduce((a, b) => a + b, 0),
    [lockedByCompany]
  );

  // Re-fetch questions and entitlements after a successful payment so the
  // newly unlocked questions appear without a manual reload.
  const handleUpgradeSuccess = () => {
    setShowUpgrade(false);
    setHasQuestionAccess(true);
    setUser((u) => (u ? { ...u } : u)); // new identity retriggers both fetch effects
  };

  const allCards = useMemo(() => buildCards(rawData, hrData), [rawData, hrData]);
  const companies = useMemo(() => {
    const allSet = new Set();
    rawData.forEach((e) => allSet.add(e.company.trim()));
    hrData.forEach((e) => allSet.add(e.company.trim()));
    return [...allSet].sort((a, b) => a.localeCompare(b));
  }, [rawData, hrData]);

  const cardsByCompany = useMemo(() => {
    const map = {};
    allCards.forEach((card) => {
      if (!map[card.company]) map[card.company] = [];
      map[card.company].push(card);
    });
    return map;
  }, [allCards]);

  const stats = useMemo(() => {
    const techYears = rawData.map((e) => e.year);
    const hrYears = hrData.flatMap((e) => e.years || []);
    const allYears = new Set([...techYears, ...hrYears].filter(Boolean));

    return {
      total: allCards.length,
      companies: companies.filter((c) => c !== "General Question Bank").length,
      years: allYears.size || 1,
      tech: allCards.filter((c) => c.type === "Technical").length,
      prog: allCards.filter((c) => c.type === "Programming").length,
      hr: allCards.filter((c) => c.type === "HR").length,
    };
  }, [allCards, companies, rawData, hrData]);

  const fuse = useMemo(() => {
    return new Fuse(allCards, { keys: ["question", "company"], threshold: 0.35, includeScore: true });
  }, [allCards]);

  const companyFuse = useMemo(() => {
    return new Fuse(companies, { threshold: 0.4 });
  }, [companies]);

  // Ensure light theme
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("cmrit_theme");
  }, []);

  // One-time migration: invalidate sessions created with the old 1-hour Google
  // token so everyone re-logs in once and receives a 30-day app session token.
  useEffect(() => {
    if (localStorage.getItem("cmrit_session_v") !== "2") {
      localStorage.setItem("cmrit_session_v", "2");
      if (localStorage.getItem("cmrit_user")) {
        localStorage.removeItem("cmrit_user");
        setUser(null);
      }
    }
  }, []);

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query);
    if (activeCompany) params.set("company", activeCompany);
    if (showBookmarks) params.set("bookmarks", "true");

    const searchString = params.toString();
    const newUrl = searchString ? `?${searchString}` : window.location.pathname;
    
    if (window.location.search !== `?${searchString}` && (window.location.search !== "" || searchString !== "")) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [query, activeCompany, showBookmarks]);

  // API key sync
  useEffect(() => {
    const handleStorageChange = () => {
      setApiKeyInput(localStorage.getItem("cmrit_groq_api_key") || "");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleApiKeyChange = (val) => {
    setApiKeyInput(val);
    if (val.trim()) {
      localStorage.setItem("cmrit_groq_api_key", val.trim());
    } else {
      localStorage.removeItem("cmrit_groq_api_key");
    }
  };

  // Google OAuth
  useEffect(() => {
    if (user) return;

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "671075020129-094p0idt8r9p9rr54mp0125j9l3ncqbl.apps.googleusercontent.com";
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { 
            theme: "outline", 
            size: "large", 
            width: "320", 
            text: "signin_with", 
            shape: "rectangular" 
          }
        );
      } else {
        setTimeout(initGsi, 100);
      }
    };

    initGsi();
  }, [user]);

  const handleCredentialResponse = async (response) => {
    const payload = decodeJwt(response.credential);
    if (!payload) {
      setAuthError("Failed to parse identity token. Please try again.");
      return;
    }
    
    const email = (payload.email || "").toLowerCase();
    if (!email.endsWith("@cmrit.ac.in")) {
      setAuthError(`Access denied: ${email} is not a valid CMRIT student email.`);
      return;
    }

    // Exchange the short-lived Google token (~1h) for our own 30-day session
    // token so users — including paid ones — aren't logged out every hour.
    try {
      const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "") : "";
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!data.success) {
        setAuthError(data.message || "Sign-in failed. Please try again.");
        return;
      }

      const userData = {
        email: data.user.email,
        name: data.user.name,
        picture: data.user.picture,
        token: data.token, // long-lived app JWT
      };
      localStorage.setItem("cmrit_user", JSON.stringify(userData));
      window.dispatchEvent(new Event("cmrit:auth"));
      setUser(userData);
      setAuthError("");
    } catch (error) {
      console.error("Sign-in failed:", error);
      setAuthError("Could not reach the server. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cmrit_user");
    window.dispatchEvent(new Event("cmrit:auth"));
    setUser(null);
    setAuthError("");
    setShowAdminPanel(false);
    setShowNotes(false);
    setShowMockInterview(false);
    setShowOffCampus(false);
    setShowMustRead(false);
    setSubscription(null);
    setHasQuestionAccess(false);
  };

  const isSearching = query.trim().length > 0;
  const isBookmarking = showBookmarks;

  const searchResults = useMemo(() => {
    if (loadingData || (!isSearching && !isBookmarking)) return [];
    let cards = isSearching ? fuse.search(query).map((r) => r.item) : allCards;
    if (isBookmarking) cards = cards.filter((c) => bookmarks.has(c.id));
    return cards;
  }, [query, isSearching, isBookmarking, bookmarks, fuse, allCards, loadingData]);

  const matchedCompanies = useMemo(() => {
    if (loadingData) return [];
    if (!isSearching) return companies;
    const byName = companyFuse.search(query).map((r) => r.item);
    const byQuestion = new Set(searchResults.map((c) => c.company));
    return [...new Set([...byName, ...byQuestion])];
  }, [query, isSearching, searchResults, companies, companyFuse, loadingData]);

  const closeOtherViews = () => {
    setShowBookmarks(false);
    setShowAdminPanel(false);
    setShowNotes(false);
    setShowMockInterview(false);
    setShowOffCampus(false);
    setShowMustRead(false);
  };

  const handleSearch = (val) => {
    setQuery(val);
    setActiveCompany(null);
    closeOtherViews();
  };

  const handleSelectCompany = (company) => {
    try {
      Clarity.event("view_company");
      Clarity.setTag("company", company);
    } catch (e) {}
    setActiveCompany(company);
    setQuery("");
    closeOtherViews();
  };

  const handleToggleBookmarks = () => {
    const next = !showBookmarks;
    setQuery("");
    setActiveCompany(null);
    closeOtherViews();
    setShowBookmarks(next);
  };

  const handleToggleNotes = () => {
    const next = !showNotes;
    setQuery("");
    setActiveCompany(null);
    closeOtherViews();
    setShowNotes(next);
  };

  const handleToggleMockInterview = () => {
    const next = !showMockInterview;
    setQuery("");
    setActiveCompany(null);
    closeOtherViews();
    setShowMockInterview(next);
  };

  const handleToggleOffCampus = () => {
    const next = !showOffCampus;
    setQuery("");
    setActiveCompany(null);
    closeOtherViews();
    setShowOffCampus(next);
  };

  const handleToggleMustRead = () => {
    const next = !showMustRead;
    setQuery("");
    setActiveCompany(null);
    closeOtherViews();
    setShowMustRead(next);
  };

  const handleSearchSubmit = () => {
    try { Clarity.event("search"); } catch (e) {}
    const filtered = matchedCompanies.filter((c) => c !== "General Question Bank");
    if (filtered.length > 0) {
      handleSelectCompany(filtered[0]);
    }
  };

  // ──────────────────────────────────────────────
  // Landing / Login Page
  // ──────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col font-sans relative overflow-hidden">
        {/* Navbar */}
        <Navbar
          bookmarkCount={0}
          showBookmarks={false}
          onToggleBookmarks={() => {}}
          user={null}
          onLogout={null}
          onGoHome={() => {
            setActiveCompany(null);
            setQuery("");
            setShowBookmarks(false);
            setShowAdminPanel(false);
          }}
          showAdminPanel={false}
          onToggleAdmin={() => {}}
        />

        {/* Centered Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
          {/* Subtle background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
          
          <div className="w-full max-w-sm relative z-10 animate-slideUp">
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-7 sm:p-8 shadow-sm shadow-zinc-100 text-center space-y-6">
              {/* Logo */}
              <div className="w-12 h-12 bg-zinc-900 rounded-[14px] flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4L3 8l9 4 9-4-9-4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 10v3c0 2 2.2 3.5 5 3.5s5-1.5 5-3v-3" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l4-4 3 3 6-6m0 0h-4m4 0v4" />
                </svg>
              </div>
              
              {/* Title */}
              <div className="space-y-1.5">
                <h1 className="text-xl font-semibold tracking-[-0.02em] text-zinc-900">CMRIT Placement Portal</h1>
                <p className="text-[13px] text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                  Browse previous year interview questions and prepare with AI coaching.
                </p>
              </div>

              {/* Error */}
              {authError && (
                <div className="p-3 bg-red-50/80 border border-red-200/60 rounded-xl text-[12px] text-red-600 text-left flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <span>{authError}</span>
                </div>
              )}

              {/* API Key Section */}
              <div className="text-left space-y-4 pt-1 border-t border-zinc-100">
                <div className="space-y-1.5 pt-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-medium text-zinc-400">
                      Groq API Key <span className="text-zinc-300 font-normal">(optional)</span>
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
                    value={apiKeyInput}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full px-3 py-2.5 rounded-xl text-[13px] bg-zinc-50 border border-zinc-200 text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all duration-200"
                  />
                  <p className="text-[10px] text-zinc-300 leading-relaxed">
                    Leave empty to use the default shared key.
                  </p>
                </div>

                {/* Google Sign-in */}
                <div className="pt-3 border-t border-zinc-100 space-y-2">
                  <label className="text-[11px] font-medium text-zinc-400">
                    Continue with Google
                  </label>
                  <div id="google-signin-btn" className="min-h-[44px] flex justify-center w-full"></div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-300 leading-relaxed max-w-[260px] mx-auto">
                Sign in with your <span className="font-medium text-zinc-400">@cmrit.ac.in</span> email to access the portal.
              </p>
            </div>

            {/* Stats preview */}
            <div className="flex justify-center gap-6 mt-6 text-center">
              {[
                { label: "Questions", value: loadingData ? "..." : stats.total.toLocaleString() },
                { label: "Companies", value: loadingData ? "..." : stats.companies },
                { label: "Years", value: loadingData ? "..." : stats.years },
              ].map((s) => (
                <div key={s.label} className="animate-fadeIn">
                  <div className="text-[15px] font-semibold text-zinc-700 tabular-nums">{s.value}</div>
                  <div className="text-[10px] text-zinc-300 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-[11px] text-zinc-300 py-4 border-t border-zinc-100 w-full bg-white">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <span>&copy; {new Date().getFullYear()} CMRIT · <a href="https://amanshekhar.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-500 transition-colors">by Aman Shekhar</a></span>
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <Link to="/pricing" className="hover:text-zinc-500 transition-colors">Pricing</Link>
              <Link to="/terms" className="hover:text-zinc-500 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-zinc-500 transition-colors">Privacy</Link>
              <Link to="/refund" className="hover:text-zinc-500 transition-colors">Refunds</Link>
              <Link to="/contact" className="hover:text-zinc-500 transition-colors">Contact</Link>
            </nav>
          </div>
        </footer>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // Main Dashboard
  // ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans">
      <Navbar
        bookmarkCount={bookmarks.size}
        showBookmarks={showBookmarks}
        onToggleBookmarks={handleToggleBookmarks}
        user={user}
        onLogout={handleLogout}
        onGoHome={() => {
          setActiveCompany(null);
          setQuery("");
          closeOtherViews();
        }}
        showAdminPanel={showAdminPanel}
        onToggleAdmin={() => {
          const next = !showAdminPanel;
          setQuery("");
          setActiveCompany(null);
          closeOtherViews();
          setShowAdminPanel(next);
        }}
        showNotes={showNotes}
        onToggleNotes={handleToggleNotes}
        showMockInterview={showMockInterview}
        onToggleMockInterview={handleToggleMockInterview}
        showOffCampus={showOffCampus}
        onToggleOffCampus={handleToggleOffCampus}
        showMustRead={showMustRead}
        onToggleMustRead={handleToggleMustRead}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        {/* Renewal nudge: only renders inside the last 7 days of a pass. */}
        <ExpiryBanner subscription={subscription} onRenew={() => setShowUpgrade(true)} />

        {/* There is no static fallback any more, so a failed fetch means an
            empty portal. Say so rather than rendering a silent blank state. */}
        {dataError && (
          <div className="mb-4 rounded-xl border border-red-200/60 bg-red-50/70 px-4 py-3 text-[13px] text-red-700">
            Could not load the question bank. Check your connection and refresh.
          </div>
        )}

        {/* Standing upsell for signed-in users without a pass. */}
        {!hasQuestionAccess && !loadingData && !dataError && lockedTotal > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white px-4 py-3">
            <p className="text-[13px] text-zinc-600">
              You are seeing a free preview.{" "}
              <span className="font-medium text-zinc-900">
                {lockedTotal.toLocaleString()} questions
              </span>{" "}
              are locked.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Unlock for &#8377;99
            </button>
          </div>
        )}
      </div>

      {/* Hero — Hidden when any panel/view is active */}
      {!activeCompany && !showAdminPanel && !showBookmarks && !showNotes && !showMockInterview && !showOffCampus && !showMustRead && (
        <div className="bg-white border-b border-zinc-200/60 pt-10 pb-10 px-4 animate-fadeIn">
          <div className="max-w-3xl mx-auto text-center">
            {/* Status badge */}
            <div className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200/60 rounded-full px-3 py-1 text-[11px] font-medium mb-5 text-zinc-400">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>CMRIT · Placement Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold mb-2.5 tracking-[-0.02em] text-zinc-900">
              Previous Year Questions
            </h1>
            <p className="text-zinc-400 mb-6 text-[13px] max-w-md mx-auto leading-relaxed">
              Search and study interview questions asked by top recruiters, with AI-powered answers.
            </p>
            
            <SearchBar query={query} onChange={handleSearch} onSearchSubmit={handleSearchSubmit} />
            
            {/* Stats */}
            <div className="flex justify-center flex-wrap gap-5 mt-8">
              {[
                { label: "Questions", value: loadingData ? "..." : stats.total.toLocaleString() },
                { label: "Companies", value: loadingData ? "..." : stats.companies },
                { label: "Years", value: loadingData ? "..." : stats.years },
                { label: "Technical", value: loadingData ? "..." : stats.tech },
                { label: "Programming", value: loadingData ? "..." : stats.prog },
                { label: "HR", value: loadingData ? "..." : stats.hr },
              ].map((s) => (
                <div key={s.label} className="text-center min-w-[80px]">
                  <div className="text-lg font-semibold text-zinc-800 tracking-tight tabular-nums leading-none">{s.value}</div>
                  <div className="text-zinc-300 text-[10px] font-medium mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Global Progress Summary */}
            {completed.size > 0 && !loadingData && (
              <div className="mt-8 max-w-lg mx-auto bg-zinc-50/80 border border-zinc-200/60 rounded-xl p-4 animate-fadeIn">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[12px] font-semibold text-zinc-700">Your Preparation Progress</p>
                  <p className="text-[11px] text-zinc-400 font-medium tabular-nums">
                    {completed.size}/{stats.total} completed ({Math.round((completed.size / stats.total) * 100)}%)
                  </p>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full bg-zinc-200/60 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(completed.size / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Admin Panel */}
        {showAdminPanel && user?.email === 'amsh23ise@cmrit.ac.in' && (
          <AdminPanel user={user} />
        )}

        {/* Premium Notes */}
        {showNotes && !showAdminPanel && (
          <NotesSection user={user} />
        )}

        {/* Mock Interview */}
        {showMockInterview && (
          <Suspense fallback={
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-zinc-800 animate-spin" />
            </div>
          }>
            <MockInterview />
          </Suspense>
        )}

        {/* Apply Off Campus */}
        {showOffCampus && (
          <OffCampus />
        )}

        {/* Must Read */}
        {showMustRead && (
          <MustRead />
        )}

        {/* Bookmarks */}
        {isBookmarking && !showAdminPanel && (
          <div className="animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h2 className="font-semibold text-zinc-700 text-[14px]">Saved Questions</h2>
              <span className="text-[12px] text-zinc-400 tabular-nums">({searchResults.length})</span>
            </div>
            <QuestionList cards={searchResults} bookmarks={bookmarks} onToggleBookmark={toggle} completed={completed} onToggleCompleted={toggleCompleted} />
          </div>
        )}

        {/* Search Results */}
        {isSearching && !isBookmarking && !showAdminPanel && (
          <div className="animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <h2 className="font-medium text-zinc-700 text-[14px]">
                {searchResults.length} results for{" "}
                <span className="font-semibold text-zinc-900">"{query}"</span>
              </h2>
            </div>

            {/* Matching Companies */}
            {matchedCompanies.filter((c) => c !== "General Question Bank").length > 0 && (
              <div className="mb-5 bg-white border border-zinc-200/80 rounded-xl p-4">
                <p className="text-[11px] font-medium text-zinc-300 mb-2.5">
                  Matching companies
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchedCompanies
                    .filter((c) => c !== "General Question Bank")
                    .map((c) => (
                      <CompanyChip
                        key={c}
                        company={c}
                        count={(cardsByCompany[c] || []).length}
                        onClick={() => handleSelectCompany(c)}
                      />
                    ))}
                </div>
              </div>
            )}

            <QuestionList cards={searchResults} bookmarks={bookmarks} onToggleBookmark={toggle} completed={completed} onToggleCompleted={toggleCompleted} />
            <LockedQuestions
              lockedCount={activeCompany ? (lockedByCompany[activeCompany] || 0) : lockedTotal}
              company={activeCompany}
              onUpgrade={() => setShowUpgrade(true)}
            />
          </div>
        )}

        {/* Company Grid */}
        {!isSearching && !isBookmarking && !showAdminPanel && !showNotes && !showMockInterview && !showOffCampus && !showMustRead && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="text-left">
                <h2 className="font-semibold text-zinc-700 text-[14px]">Browse by Company</h2>
                <p className="text-zinc-400 text-[12px] mt-0.5">
                  Select a company to view their interview questions.
                </p>
              </div>
              {activeCompany && (
                <button
                  onClick={() => setActiveCompany(null)}
                  className="text-[12px] text-zinc-400 hover:text-zinc-700 flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )}
            </div>
            {loadingData ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-zinc-200/60 rounded-xl">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-100 border-t-zinc-800 animate-spin mb-3" />
                <p className="text-[12px] font-semibold text-zinc-700">Loading companies...</p>
              </div>
            ) : (
              <CompanyGrid
                companies={companies}
                cardsByCompany={cardsByCompany}
                bookmarks={bookmarks}
                onToggleBookmark={toggle}
                activeCompany={activeCompany}
                onSelectCompany={handleSelectCompany}
                completed={completed}
                onToggleCompleted={toggleCompleted}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white mt-12 py-5 text-[12px] text-zinc-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} CMRIT · <a href="https://amanshekhar.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-500 transition-colors text-[11px]">by Aman Shekhar</a></p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <Link to="/pricing" className="hover:text-zinc-500 transition-colors">Pricing</Link>
              <Link to="/terms" className="hover:text-zinc-500 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-zinc-500 transition-colors">Privacy</Link>
              <Link to="/refund" className="hover:text-zinc-500 transition-colors">Refunds</Link>
              <Link to="/contact" className="hover:text-zinc-500 transition-colors">Contact</Link>
            </nav>
        </div>
      </footer>

      <ChatBot />

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        user={user}
        subscription={subscription}
        onSuccess={handleUpgradeSuccess}
      />
    </div>
  );
}
