import { useState } from "react";
import { authFetch, SESSION_EXPIRED_MESSAGE } from "../utils/session";

const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "") : "";

// Load Razorpay's checkout script on demand rather than in index.html, so the
// ~90KB only costs the users who actually open the upgrade card.
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the payment gateway."));
    document.body.appendChild(script);
  });
}

/**
 * The lock card shown in place of the questions a visitor has not paid for.
 *
 * `lockedCount` comes from the server, which has already withheld those
 * questions from the payload -- this component never receives the text it is
 * claiming to hide.
 */
export function LockedQuestions({ lockedCount, shownCount = 0, company, onUpgrade }) {
  if (!lockedCount) return null;

  // "N more questions" only makes sense next to questions the visitor can
  // already read. With the free preview at zero there are none, so the card
  // has to state the size of the bank rather than an increment on it.
  const heading = shownCount > 0
    ? `${lockedCount} more question${lockedCount === 1 ? "" : "s"}`
    : `${lockedCount} question${lockedCount === 1 ? "" : "s"}`;

  return (
    <div className="relative mt-4 rounded-2xl border border-zinc-200/80 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-zinc-900 tabular-nums">
        {heading}
        {company ? ` from ${company}` : ""}
      </h3>
      <p className="mx-auto mt-1.5 max-w-[320px] text-[13px] leading-relaxed text-zinc-500">
        Unlock the full question bank across every company and year, plus premium
        notes, AI answers and mock interviews.
      </p>

      <button
        onClick={onUpgrade}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-[13px] font-medium text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98]"
      >
        Unlock for &#8377;99
        <span className="text-zinc-400">&middot; 2 months</span>
      </button>
    </div>
  );
}

/** Banner shown to an active subscriber whose pass is close to expiring. */
export function ExpiryBanner({ subscription, onRenew }) {
  if (!subscription || !subscription.hasAccess) return null;
  if (subscription.lifetime) return null;
  const { daysLeft } = subscription;
  if (daysLeft === null || daysLeft > 7) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200/70 bg-amber-50/60 px-4 py-3">
      <p className="text-[13px] text-amber-900">
        {daysLeft === 0
          ? "Your pass expires today."
          : `Your pass expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`}
      </p>
      <button
        onClick={onRenew}
        className="rounded-lg bg-amber-900 px-3.5 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-amber-800"
      >
        Renew for &#8377;99
      </button>
    </div>
  );
}

/**
 * Full-screen upgrade modal that drives the Razorpay checkout.
 *
 * The signature is verified server-side in /api/subscription/verify-payment;
 * a success callback here is never treated as proof of payment on its own.
 */
export default function UpgradeModal({
  open,
  onClose,
  user,
  subscription,
  onSuccess,
  onSessionExpired,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const price = (subscription && subscription.price) || 99;
  const days = (subscription && subscription.durationDays) || 60;
  const isRenewal = !!(subscription && subscription.hasAccess);

  const handlePay = async () => {
    // A cached user with no session token cannot buy anything: the order call
    // would go out as `Bearer undefined` and come back 401. Ask for a fresh
    // sign-in instead of opening a checkout that is going to fail.
    if (!user || !user.token) {
      setError(SESSION_EXPIRED_MESSAGE);
      if (onSessionExpired) onSessionExpired();
      return;
    }

    setBusy(true);
    setError("");
    try {
      await loadRazorpayScript();

      const orderRes = await authFetch(`${API_URL}/api/subscription/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const order = await orderRes.json();
      if (!orderRes.ok || !order.success) {
        throw new Error(order.message || "Could not start the payment.");
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "CMRIT Placement Portal",
        description: `Placement Pass - ${days} days`,
        prefill: { email: user.email, name: user.name },
        theme: { color: "#18181b" },
        handler: async (response) => {
          try {
            const verifyRes = await authFetch(`${API_URL}/api/subscription/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const result = await verifyRes.json();
            if (!verifyRes.ok || !result.success) {
              throw new Error(result.message || "Verification failed.");
            }
            onSuccess(result);
          } catch {
            // The webhook is the safety net here: if this in-page verify fails
            // after a real capture, Razorpay's server-to-server call still
            // grants the pass, so we tell the user to refresh rather than
            // implying the payment was lost.
            setError(
              "Payment went through but we could not confirm it here. Refresh in a minute -- if it is still locked, email us with your payment ID."
            );
          } finally {
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      });

      rzp.on("payment.failed", (resp) => {
        setError((resp.error && resp.error.description) || "Payment failed.");
        setBusy(false);
      });

      rzp.open();
    } catch (err) {
      if (err && err.sessionExpired) {
        setError(SESSION_EXPIRED_MESSAGE);
        if (onSessionExpired) onSessionExpired();
      } else {
        setError(err.message);
      }
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/20 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white p-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-[14px] bg-zinc-900">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-zinc-900">
            {isRenewal ? "Renew your pass" : "CMRIT Placement Pass"}
          </h2>
          <div className="mt-2 flex items-baseline justify-center gap-1.5">
            <span className="text-[28px] font-semibold tracking-[-0.03em] text-zinc-900">
              &#8377;{price}
            </span>
            <span className="text-[13px] text-zinc-400">for {days} days</span>
          </div>
          {isRenewal && (
            <p className="mt-1.5 text-[12px] text-zinc-400">
              Added on top of the days you have left.
            </p>
          )}
        </div>

        <ul className="mb-5 space-y-2.5 border-y border-zinc-100 py-5">
          {[
            "Every technical, coding and HR question",
            "All 92 companies, 2022 to 2026",
            "Premium notes library",
            "AI answers and mock interviews",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-[13px] text-zinc-600">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200/60 bg-red-50/80 p-3 text-left text-[12px] leading-relaxed text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={busy}
          className="w-full rounded-xl bg-zinc-900 py-3 text-[14px] font-medium text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Opening checkout..." : `Pay ₹${price}`}
        </button>

        <button
          onClick={onClose}
          className="mt-2 w-full py-2 text-[12px] text-zinc-400 transition-colors hover:text-zinc-600"
        >
          Maybe later
        </button>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-zinc-300">
          Secure payment via Razorpay. Access is tied to {user ? user.email : "your account"}.
        </p>
      </div>
    </div>
  );
}
