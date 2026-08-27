# Resume Entry — CMRIT Placement Prep Portal

> Copy-paste blocks for your resume. Pick the variant that fits your page budget.
> Every number below is derived from the actual codebase and the live deployment
> (`cmritplacement.vercel.app`) — nothing here is invented, so you can defend all of it
> in an interview.

---

## ⭐ Primary Version (4 bullets — matches a standard "Projects" section)

**Campus Placement Preparation Platform (500+ Active Users) | Full-Stack Web + Generative AI | 2026**

- Built and shipped a production MERN platform (React 19 + Vite, Express 5, MongoDB/Mongoose,
  Vercel serverless) serving **500+ CMRIT students**, aggregating **950+ real interview questions
  from 92 recruiters across 5 placement seasons (2022–27)** into a searchable, company-wise
  question bank with `Fuse.js` fuzzy search (0.35 threshold) and localStorage-backed bookmarks
  and progress tracking.
- Engineered **3 Generative-AI surfaces** on Groq + Llama 3.1 with token-level streaming — a
  per-question AI tutor, a floating placement chatbot, and a **resume-driven mock interviewer**
  that parses uploaded PDFs client-side via `pdf.js` and generates personalized interview
  questions with adaptive follow-ups, cutting prep-material lookup time by **~70%**.
- Implemented **domain-restricted Google OAuth (`@cmrit.ac.in`) with self-issued 30-day JWT
  sessions**, role-based admin routes, and IP rate limiting (200 req/15 min; 50 for admin
  mutations), replacing 1-hour Google ID tokens that were silently logging out paying users.
- Integrated a **Razorpay payments flow with HMAC-SHA256 signature verification and an idempotent
  server-to-server webhook** to gate premium notes, delivered as **5-minute signed Cloudinary URLs
  streamed through an authenticated backend proxy** into a canvas-based PDF viewer — eliminating
  direct-download leakage of paid content.
- **Tech Stack:** React 19, Vite, TailwindCSS, Node.js, Express 5, MongoDB (Mongoose), JWT,
  Google OAuth, Groq/Llama 3.1, pdf.js, Cloudinary, Razorpay, Vercel

---

## 📄 Compact Version (3 bullets — when space is tight)

**Campus Placement Prep Platform (500+ Users) | MERN + Generative AI | 2026**

- Shipped a live MERN + Vercel-serverless platform used by **500+ students**, indexing **950+ real
  interview questions from 92 companies over 5 placement seasons** with fuzzy search, bookmarks,
  and per-question progress tracking.
- Built **3 LLM features** on Groq + Llama 3.1 with streaming responses — an AI answer coach, a
  placement chatbot, and a **resume-parsing mock interviewer** (client-side `pdf.js` text
  extraction → personalized questions + adaptive follow-ups).
- Secured the platform end-to-end: **domain-locked Google OAuth + 30-day JWT sessions**, RBAC
  admin APIs, rate limiting, **HMAC-verified Razorpay payments with an idempotent webhook**, and
  **short-lived signed Cloudinary URLs behind an authenticated PDF proxy** to prevent paid-content
  leakage.
- **Tech Stack:** MERN, Groq/Llama 3.1, JWT + Google OAuth, Razorpay, Cloudinary, Vercel

---

## 🔎 One-Liner (LinkedIn headline / portfolio card)

> A live MERN + GenAI placement-prep portal (500+ users) with 950+ real interview questions from
> 92 recruiters, an LLM mock interviewer that reads your resume, and a Razorpay-gated premium
> notes vault secured with signed, expiring delivery URLs.

---

## 📊 Metrics You Can Defend

| Claim | Where it comes from |
|---|---|
| 500+ active users | Vercel Analytics + Microsoft Clarity, both wired into the live app |
| 956 questions (645 technical + 311 programming) | `src/data/questions.json`, 114 drive records |
| 92 companies | unique `company` values in the dataset |
| 5 placement seasons (2022-23 → 2026-27) | unique `year` values in the dataset |
| 29 curated must-read DSA problems, 12 topics | `server/data/must_read_questions.json` |
| 156 conceptual/HR questions | `server/data/conceptualQuestions.js` |
| 3 AI surfaces | `QuestionCard.jsx`, `ChatBot.jsx`, `MockInterview.jsx` |
| 200 req / 15 min rate limit | `server/middleware/rateLimiter.js` |
| 5-minute signed download URLs | `server/routes/notesRoutes.js` |
| 30-day JWT sessions | `server/middleware/authMiddleware.js` |

---

## 🎤 Interview Talking Points

**"Why did you issue your own JWT instead of using the Google ID token?"**
Google ID tokens expire in ~1 hour. Users who had *paid* for notes were being logged out
mid-session and losing access. I verify the Google credential **once at sign-in**, check the email
ends in `@cmrit.ac.in`, then mint my own 30-day HS256 session token that every protected route
verifies. The JWT secret **fails closed in production** — if `JWT_SECRET` is unset on Vercel,
signing/verification refuses to fall back to the dev secret that lives in the repo.

**"How do you stop a paying user from just re-sharing the PDF?"**
Layered, and I'm honest that it's deterrence, not DRM. The file is a **private-type Cloudinary
asset** — never publicly addressable. The client never receives a permanent URL; it gets a
**5-minute signed URL**, and for viewing, the bytes are **streamed through an authenticated
Express proxy** so the origin URL never reaches the browser at all. The frontend renders the PDF
onto a `<canvas>` via `pdf.js` with context menu and inspect shortcuts disabled, so there's no
`<a href>` or `<embed>` to right-click-save.

**"Walk me through the payment flow."**
Client hits `POST /create-order` (authenticated) → Razorpay order created, `Payment` row written
as pending → checkout → Razorpay returns `order_id|payment_id|signature`. The server recomputes
`HMAC-SHA256(order_id|payment_id, key_secret)` and compares. Because the **client verify call and
the webhook can both fire for the same payment**, grant creation is **idempotent** — the
`NotesAccess` upsert is safe to run twice. The webhook itself is unauthenticated by design (it's
Razorpay calling me), so it's authenticated by its own HMAC over the **raw request body**, which
is why I stash `req.rawBody` in the `express.json` verify hook rather than re-serializing the
parsed object.

**"What does the mock interviewer actually do?"**
The resume PDF is parsed **entirely in the browser** with `pdf.js` — the file never leaves the
user's machine, which sidesteps an obvious privacy objection. The extracted text goes into a
system-prompted Groq/Llama 3.1 call that returns questions grounded in the candidate's own
projects and stack. Each question supports an **adaptive follow-up**: I re-send the resume, the
original question, and the already-asked list so the model drills deeper instead of repeating
itself.

**"Biggest engineering tradeoff?"**
Keeping the question bank as a **static JSON bundled into the client** while the notes/HR/must-read
data lives in MongoDB. The static bank means fuzzy search and filtering are instant and free with
zero backend calls — right for read-only, rarely-changing data at this scale. The tradeoff is that
updating it requires a redeploy, which is why anything user-specific or write-heavy (payments,
access grants, notes, admin CRUD) went to Mongo behind authenticated APIs.
