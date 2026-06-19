import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "") : "";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function formatBytes(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function NotesSection({ user }) {
  const [notes, setNotes] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [token, setToken] = useState("");
  const [price, setPrice] = useState(49);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [toast, setToast] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotes(data.data);
        setHasAccess(data.hasAccess);
        setToken(data.token || "");
        setPrice(data.price || 49);
      } else {
        setError(data.message || "Failed to load notes.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const handleBuy = async () => {
    setBuying(true);
    setError("");
    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Failed to load the payment gateway. Check your connection.");

      const orderRes = await fetch(`${API_URL}/api/notes/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || "Could not start the payment.");

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CMRIT Placement Portal",
        description: "Complete Notes Bundle",
        order_id: orderData.orderId,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#18181b" },
        // UPI-only checkout
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay using UPI",
                instruments: [{ method: "upi" }],
              },
            },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: false },
          },
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/notes/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setHasAccess(true);
              if (verifyData.token) setToken(verifyData.token);
              showToast("Payment successful — notes unlocked!");
              fetchNotes();
            } else {
              setError(verifyData.message || "Payment verification failed.");
            }
          } catch (err) {
            setError("Payment verification failed: " + err.message);
          } finally {
            setBuying(false);
          }
        },
        modal: { ondismiss: () => setBuying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setError(resp.error?.description || "Payment failed. Please try again.");
        setBuying(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setBuying(false);
    }
  };

  const handleView = async (note) => {
    const isMobile = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setPreviewUrl("mobile_warning");
      return;
    }

    setDownloadingId(note._id);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/notes/${note._id}/download`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success && data.url) {
        setPreviewUrl(data.url + "#toolbar=0&navpanes=0&scrollbar=0");
      } else {
        setError(data.message || "Could not generate the secure link.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-[13px] font-medium px-4 py-2.5 rounded-xl shadow-lg animate-fadeInScale">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shadow-sm">
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900 text-[15px] tracking-tight">Premium Notes</h2>
            <p className="text-zinc-400 text-[12px]">Curated PDF notes for placement prep</p>
          </div>
        </div>
        {hasAccess ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded-full px-2.5 py-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-9 4h10a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2z" />
            </svg>
            Unlocked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 rounded-full px-2.5 py-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Locked
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50/80 border border-red-200/60 rounded-xl text-[12px] text-red-600 flex items-start gap-2">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Access token — shown when unlocked */}
      {!loading && hasAccess && token && (
        <div className="mb-5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.9}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <div>
              <p className="text-[12px] font-semibold text-emerald-800">Your access token</p>
              <code className="text-[12px] text-emerald-700 font-mono">{token}</code>
            </div>
          </div>
          <button
            onClick={() => { navigator.clipboard?.writeText(token); showToast("Token copied"); }}
            className="text-[12px] font-medium text-emerald-700 hover:text-emerald-900 bg-white/70 hover:bg-white border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Copy
          </button>
        </div>
      )}

      {/* Buy card — shown when locked */}
      {!loading && !hasAccess && (
        <div className="mb-6 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-zinc-900">Unlock the complete notes bundle</p>
              <p className="text-[12px] text-zinc-400 mt-1 max-w-sm leading-relaxed">
                One-time payment via UPI. Get instant access to every notes PDF, tied to your{" "}
                <span className="font-medium text-zinc-500">{user.email}</span> account.
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-2xl font-semibold text-zinc-900 tracking-tight">₹{price}</span>
                <span className="text-[11px] text-zinc-400">one-time</span>
              </div>
              <button
                onClick={handleBuy}
                disabled={buying}
                className="mt-2 inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-medium px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-sm"
              >
                {buying ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay with UPI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-zinc-200/60 rounded-xl">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-100 border-t-zinc-800 animate-spin mb-3" />
          <p className="text-[12px] font-semibold text-zinc-700">Loading notes…</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 bg-white border border-zinc-200/60 rounded-xl">
          <p className="text-[13px] font-medium text-zinc-700">No notes uploaded yet</p>
          <p className="text-[12px] text-zinc-400 mt-1">Check back soon — notes will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-sm hover:border-zinc-300 transition-colors"
            >
              {/* First-page preview (server-side blurred until unlocked) */}
              <div className="relative bg-zinc-100 aspect-[4/3] overflow-hidden">
                {note.previewUrl && (
                  <img
                    src={note.previewUrl}
                    alt={note.title}
                    loading="lazy"
                    className={`w-full h-full object-cover object-top ${hasAccess ? "" : "blur-[3px] scale-105"}`}
                    onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                  />
                )}

                {!hasAccess && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-900/10">
                    <div className="w-10 h-10 rounded-full bg-zinc-900/85 flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.9}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-800 bg-white/85 px-2.5 py-0.5 rounded-full">
                      Locked · ₹{price}
                    </span>
                  </div>
                )}
              </div>

              {/* Meta + action */}
              <div className="p-3.5">
                <p className="text-[13px] font-semibold text-zinc-900 truncate">{note.title}</p>
                {note.description && (
                  <p className="text-[12px] text-zinc-400 mt-0.5 line-clamp-2">{note.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-zinc-300 font-medium tabular-nums">
                    PDF{note.bytes ? ` · ${formatBytes(note.bytes)}` : ""}
                  </span>
                  {hasAccess ? (
                    <button
                      onClick={() => handleView(note)}
                      disabled={downloadingId === note._id}
                      className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-[0.97]"
                    >
                      {downloadingId === note._id ? (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.9}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                      View Note
                    </button>
                  ) : (
                    <button
                      onClick={handleBuy}
                      disabled={buying}
                      className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-[0.97]"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.9}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Unlock ₹{price}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Preview Fullscreen Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewUrl(null)}
                className="flex items-center gap-2 bg-white text-zinc-900 hover:bg-zinc-200 text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <h3 className="text-white text-[14px] sm:text-[15px] font-medium hidden sm:flex items-center gap-2 ml-2 border-l border-zinc-800 pl-4">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Document Preview
              </h3>
            </div>
          </div>
          {/* Iframe Body */}
          <div className="flex-1 w-full bg-zinc-900 relative flex items-center justify-center">
            {previewUrl === "mobile_warning" ? (
              <div className="text-center px-6 max-w-sm">
                <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-2xl flex items-center justify-center mb-5 shadow-lg border border-zinc-700">
                  <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Please view on a laptop</h3>
                <p className="text-zinc-400 text-[14px] leading-relaxed">
                  Mobile PDF previews are currently unavailable. Please open this portal on your desktop or laptop computer to read the notes.
                </p>
              </div>
            ) : (
              <iframe
                src={previewUrl}
                className="absolute inset-0 w-full h-full border-0"
                title="PDF Preview"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
