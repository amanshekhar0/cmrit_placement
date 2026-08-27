/**
 * One place that owns the signed-in session.
 *
 * The session token is a 30-day app JWT stored inside the cached `cmrit_user`
 * object. Everything that talks to a protected endpoint must go through here,
 * because a cached user whose token is missing, malformed or expired is worse
 * than being signed out: the UI looks logged in, every protected call goes out
 * as `Bearer undefined` (or as a token the server can no longer verify) and
 * comes back 401 -- which is exactly how a student ends up staring at
 * "Invalid or expired session" on the payment card with no way out.
 */

const USER_KEY = "cmrit_user";
const AUTH_EVENT = "cmrit:auth";

// Bump this whenever previously issued tokens must be thrown away (a rotated
// JWT_SECRET, a changed token shape). Every browser clears its cached session
// once on the next load and signs in again.
const SESSION_VERSION = "3";
const SESSION_VERSION_KEY = "cmrit_session_v";

// Where a sign-out reason is parked for the page that renders next.
export const AUTH_NOTICE_KEY = "cmrit_auth_notice";

export const SESSION_EXPIRED_MESSAGE =
  "Your session expired. Please sign in with Google again, then retry.";

/** Thrown by `authFetch` when the session is gone or the server rejected it. */
export class SessionExpiredError extends Error {
  constructor(message = SESSION_EXPIRED_MESSAGE) {
    super(message);
    this.name = "SessionExpiredError";
    this.sessionExpired = true;
  }
}

/** Read a JWT payload without verifying it -- for the local expiry check only. */
function decodeJwtPayload(token) {
  try {
    const base64Url = String(token).split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function notifyAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
  notifyAuthChange();
}

/**
 * Park a reason for the sign-out so whichever page renders next can explain it.
 * Used for sessions the server rejected -- never for a deliberate logout.
 */
export function setAuthNotice(message = SESSION_EXPIRED_MESSAGE) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(AUTH_NOTICE_KEY, message);
  } catch {
    // Private-mode browsers can refuse sessionStorage; the notice is optional.
  }
}

/** Read the sign-out notice once and consume it. */
export function takeAuthNotice() {
  if (typeof window === "undefined") return "";
  try {
    const msg = sessionStorage.getItem(AUTH_NOTICE_KEY) || "";
    if (msg) sessionStorage.removeItem(AUTH_NOTICE_KEY);
    return msg;
  } catch {
    return "";
  }
}

/**
 * Drop a session the server will not accept, and remember why.
 *
 * `deferNotify` exists for readSession(), which runs inside a render: firing
 * the auth event synchronously there would make one component set state while
 * another is rendering. The storage is cleared immediately either way.
 */
export function expireSession(message = SESSION_EXPIRED_MESSAGE, { deferNotify = false } = {}) {
  if (typeof window === "undefined") return;
  setAuthNotice(message);
  localStorage.removeItem(USER_KEY);
  if (deferNotify) {
    setTimeout(notifyAuthChange, 0);
  } else {
    notifyAuthChange();
  }
}

export function saveSession(user) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChange();
}

/**
 * The cached user, or null. A cached user that cannot authenticate is dropped
 * here rather than being handed to callers that would send it to the API.
 */
export function readSession() {
  if (typeof window === "undefined") return null;

  let cached;
  try {
    const raw = localStorage.getItem(USER_KEY);
    cached = raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
  if (!cached) return null;

  if (!cached.token || typeof cached.token !== "string") {
    expireSession(SESSION_EXPIRED_MESSAGE, { deferNotify: true });
    return null;
  }

  const payload = decodeJwtPayload(cached.token);
  // No readable payload means it is not one of our tokens at all.
  if (!payload) {
    expireSession(SESSION_EXPIRED_MESSAGE, { deferNotify: true });
    return null;
  }
  // Expire slightly early so a call cannot start on a token that dies in flight.
  if (payload.exp && payload.exp * 1000 <= Date.now() + 30000) {
    expireSession(SESSION_EXPIRED_MESSAGE, { deferNotify: true });
    return null;
  }

  return cached;
}

/** Token of the current session, or null. */
export function getToken() {
  const session = readSession();
  return session ? session.token : null;
}

/**
 * Clear sessions issued before the current SESSION_VERSION. Returns true if a
 * cached session was actually dropped, so the caller can explain the sign-out.
 */
export function runSessionMigration() {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(SESSION_VERSION_KEY) === SESSION_VERSION) return false;

  localStorage.setItem(SESSION_VERSION_KEY, SESSION_VERSION);
  if (localStorage.getItem(USER_KEY)) {
    expireSession();
    return true;
  }
  return false;
}

/**
 * fetch() for protected endpoints. Attaches the session token, and turns any
 * dead session -- locally missing/expired, or rejected by the server -- into a
 * SessionExpiredError after clearing the cached user, so the UI can ask for a
 * fresh sign-in instead of showing a raw 401.
 */
export async function authFetch(url, options = {}) {
  const token = getToken();
  if (!token) {
    expireSession();
    throw new SessionExpiredError();
  }

  const res = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    expireSession();
    throw new SessionExpiredError();
  }

  return res;
}
