# 🎓 CMRIT Placement Prep Portal

> A live, full-stack placement-preparation platform for CMR Institute of Technology students —
> **950+ real interview questions from 92 recruiters across 5 placement seasons**, three
> Generative-AI study surfaces, and a payment-gated premium notes vault.

🔗 **Live:** [cmritplacement.vercel.app](https://cmritplacement.vercel.app) · 👥 **500+ active users**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama_3.1-F55036)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)

---

## 📌 The Problem

Every placement season, CMRIT students hunt through WhatsApp groups, seniors' notes, and
screenshots to find out what a company *actually asked* on campus. That information exists — it's
just scattered, unsearchable, and lost the moment a batch graduates.

This portal makes it permanent and searchable.

---

## ✨ Features

### 1. Company-Wise Question Bank
- **956 questions** — 645 technical + 311 programming — across **114 drive records**.
- **92 companies** (PhonePe, Oracle, Cognizant, Deloitte, Amadeus, Ellucian, Eurofins, …).
- **5 seasons** archived: `2022-23` → `2026-27`.
- Company cards with deterministic hash-derived gradients; click to open a drawer with
  **All / Technical / Programming** tabs.

### 2. Instant Fuzzy Search
- Client-side `Fuse.js` over question text *and* company name — no network round-trip.
- Threshold `0.35` for questions, `0.4` for companies, so typos and partial keywords still hit.
- Live **company chips** appear above results; clicking one jumps straight to that company's list.

### 3. Three Generative-AI Surfaces (Groq + Llama 3.1)

| Surface | What it does |
|---|---|
| **AI Answer Coach** | Per-question "Get AI Answer" → streamed, sub-300-word, interview-ready explanation from a placement-tutor system prompt |
| **PlacementBot** | Floating chat widget for general prep strategy (DSA, OOP, SQL, OS, CN, HR) with quick-suggestion pills |
| **Mock Interviewer** | Upload your resume → questions generated *from your own projects and stack*, each with adaptive follow-ups |

All three stream token-by-token with a live cursor, and render `**bold**` / `` `code` ``
markdown inline as the response arrives.

### 4. Resume-Driven Mock Interview
- Resume PDF is parsed **entirely in the browser** via `pdf.js` — the file never leaves the device.
- Extracted text seeds a Groq/Llama 3.1 prompt that produces personalized interview questions.
- "Ask a follow-up" re-sends the resume + the already-asked list so the model drills deeper
  instead of repeating itself.
- "Generate more" appends without duplicating prior questions.

### 5. Premium Notes Vault (Razorpay + Cloudinary)
- Razorpay checkout → **HMAC-SHA256 signature verification** on the server.
- **Idempotent access grants** — the client verify call and the Razorpay webhook can both fire for
  the same payment, and the `NotesAccess` upsert tolerates that.
- Webhook authenticated by its own HMAC over the **raw request body** (`req.rawBody` is captured in
  the `express.json` verify hook).
- Notes stored as **private-type Cloudinary assets**; delivery is a **5-minute signed URL**, and
  in-app viewing streams bytes through an **authenticated Express proxy** so the origin URL never
  reaches the browser.
- Rendered to `<canvas>` with context menu and inspect shortcuts disabled — no `<a href>` or
  `<embed>` to right-click-save.

### 6. Must-Read DSA Set
- **29 hand-picked problems** spanning **12 topics** — Arrays & Hashing, Two Pointers, Sliding
  Window, Stack, Strings, Linked List, Trees, Graphs, Binary Search, DP, Backtracking.

### 7. Progress & Bookmarks
- `localStorage`-backed bookmarks (`cmrit_bookmarks`) and completion tracking
  (`cmrit_completed_questions`) — survive refreshes, zero backend cost.
- Live count badge in the sticky navbar; toggle to a saved-only view.

### 8. Admin Panel
- RBAC-gated CRUD for notes, HR questions, technical questions, and must-read entries.
- Direct-to-Cloudinary signed uploads (the file never transits the API server).
- Manual access grants + revocation, and per-user stats via MongoDB aggregation pipelines.

---

## 🏗️ Architecture

```
                     ┌──────────────────────────────────────────┐
  Browser            │  React 19 + Vite + TailwindCSS           │
                     │  Fuse.js search · pdf.js · localStorage  │
                     └───────┬──────────────────────┬───────────┘
                             │                      │
                 direct, streamed                   │ Bearer <JWT>
                             ▼                      ▼
                  ┌────────────────────┐   ┌────────────────────────────┐
                  │  Groq API          │   │  Express 5 (Vercel         │
                  │  llama-3.1-8b      │   │  serverless via /api)      │
                  └────────────────────┘   │  rate-limited 200/15min    │
                                           └──┬───────┬─────────┬───────┘
                                              │       │         │
                                   ┌──────────▼─┐ ┌───▼──────┐ ┌▼──────────┐
                                   │ MongoDB    │ │Cloudinary│ │ Razorpay  │
                                   │ Atlas      │ │ (private)│ │ + webhook │
                                   └────────────┘ └──────────┘ └───────────┘
```

**Data split, and why:** the question bank is a **static JSON bundled into the client** — read-only,
rarely changing, so search and filtering are instant and cost nothing. Everything user-specific or
write-heavy (payments, access grants, notes, HR/technical CRUD) lives in **MongoDB behind
authenticated APIs**.

---

## 🔐 Security

| Layer | Implementation |
|---|---|
| **Identity** | Google OAuth, hard-restricted to `@cmrit.ac.in` addresses |
| **Sessions** | Self-issued 30-day HS256 JWT — Google's ~1h ID token was logging paying users out mid-session |
| **Fail-closed secrets** | On Vercel, a missing `JWT_SECRET` refuses to sign/verify rather than falling back to the repo's dev secret |
| **RBAC** | `verifyAdmin` checks the email against `ADMIN_EMAILS` before any mutation |
| **Rate limiting** | 200 req/15 min per IP; 50/15 min on admin mutations; `trust proxy` set for accurate IPs behind Vercel |
| **CORS** | Explicit allowlist — localhost + the production origin only |
| **Payments** | HMAC-SHA256 over `order_id\|payment_id`; webhook HMAC over the raw body |
| **Content delivery** | Private Cloudinary assets, 5-minute signed URLs, authenticated streaming proxy |
| **Headers** | CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (camera/mic/geo all denied) |

---

## 🛠️ Tech Stack

**Frontend** — React 19 · Vite 8 · TailwindCSS 3 · React Router 7 · Fuse.js · pdf.js
**Backend** — Node.js · Express 5 · Mongoose 9 · jsonwebtoken · express-rate-limit · Nodemailer
**AI** — Groq API (`llama-3.1-8b-instant`), streaming completions
**Services** — MongoDB Atlas · Cloudinary · Razorpay · Google OAuth
**Analytics** — Vercel Analytics · Microsoft Clarity
**Deploy** — Vercel (static frontend + serverless API via `/api/index.js` rewrite)

---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── CompanyGrid.jsx      # company cards + drawer, tabbed views
│   │   ├── QuestionCard.jsx     # question + AI answer coach + bookmark
│   │   ├── ChatBot.jsx          # floating PlacementBot
│   │   ├── MockInterview.jsx    # resume upload → AI interview questions
│   │   ├── NotesSection.jsx     # paid notes, Razorpay checkout, canvas viewer
│   │   ├── MustRead.jsx         # curated DSA set
│   │   ├── AdminPanel.jsx       # RBAC content management
│   │   └── SearchBar.jsx / QuestionList.jsx / Navbar.jsx / OffCampus.jsx
│   ├── hooks/
│   │   ├── useGroq.js           # streaming LLM chat
│   │   ├── useBookmarks.js      # localStorage bookmarks
│   │   └── useProgress.js       # localStorage completion tracking
│   ├── data/questions.json      # 114 drive records, 956 questions
│   └── utils/                   # companyDomains, markdown renderer
├── server/
│   ├── index.js                 # Express app, CORS, rate limits, error handling
│   ├── routes/                  # auth · notes · mustread · technical · hr · stats
│   ├── models/                  # User · Note · NotesAccess · Payment · *Question
│   ├── middleware/              # authMiddleware (JWT/OAuth/RBAC) · rateLimiter
│   ├── config/                  # db · cloudinary
│   └── scripts/                 # seed · seedMustRead
├── api/index.js                 # Vercel serverless entry → server/index.js
├── docs/                        # architecture, features, roadmap, UI specs
└── vercel.json                  # rewrites + security headers (CSP etc.)
```

---

## 🚀 Getting Started

### Prerequisites
Node.js 18+, a MongoDB Atlas cluster, and API keys for Groq, Cloudinary, Razorpay, and Google OAuth.

### Install & Run

```bash
# 1. Frontend
npm install
npm run dev            # http://localhost:5173

# 2. Backend (separate terminal)
cd server
npm install
npm start              # http://localhost:5000
```

### Environment Variables

`.env` (frontend):
```env
# VITE_GROQ_API_KEY is gone: VITE_ vars are public. The shared Groq key is
# server-side only (GROQ_API_KEY in server/.env), proxied via /api/ai/chat.
VITE_GOOGLE_CLIENT_ID=
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=
```

`server/.env` (backend):
```env
MONGODB_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=
ADMIN_EMAILS=you@cmrit.ac.in
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
GROQ_API_KEY=            # shared Groq key, server-side only
GROQ_MODEL=openai/gpt-oss-20b
APP_URL=https://cmritplacement.vercel.app

# Subscription (all optional — these are the defaults)
BUNDLE_PRICE_INR=99        # price of the Placement Pass
BUNDLE_DURATION_DAYS=60    # pass length; renewals extend, they do not reset
FREE_TECH_SAMPLE=5         # free questions per company; set 0 for a hard paywall
FREE_HR_SAMPLE=            # blank = HR questions stay fully free (SEO surface)
```

> **Deploying:** every variable in `server/.env` must also exist in the Vercel
> project's Environment Variables (Production **and** Preview), then redeploy —
> `server/.env` is gitignored and never ships. `JWT_SECRET` is the one that bites:
> if it is missing, sign-in cannot mint a session; if its value ever changes,
> every session token issued before the change stops verifying and users see
> "Your session is no longer valid" until they sign in again. The server logs
> `Auth rejected ... invalid signature` in that case (a genuine expiry logs
> `TokenExpiredError` instead), so the Vercel function logs tell the two apart.

### Seed the Database
```bash
cd server
node scripts/seed.js
node scripts/seedMustRead.js
```

### Migrate legacy notes buyers

The ₹49 `NotesAccess` records predate the unified `Access` model. Run this
once before deploying the subscription work, or existing buyers lose their
notes. It is idempotent and non-destructive — the legacy collection is read,
never modified.

```bash
cd server
node scripts/migrateAccess.js            # dry run, prints the plan
node scripts/migrateAccess.js --commit   # apply
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/google` | — | Verify Google credential, issue 30-day session JWT |
| `GET` | `/api/notes` | JWT | List notes with signed first-page preview images |
| `GET` | `/api/notes/access` | JWT | Current user's access status |
| `GET` | `/api/notes/:id/download` | JWT + paid | 5-minute signed Cloudinary URL |
| `GET` | `/api/notes/:id/proxy` | JWT + paid | Stream PDF bytes through the server |
| `POST` | `/api/notes/create-order` | JWT | Create a Razorpay order |
| `POST` | `/api/notes/verify-payment` | JWT | HMAC-verify and grant access |
| `POST` | `/api/notes/webhook` | HMAC | Razorpay server-to-server confirmation |
| `POST` / `DELETE` | `/api/notes/admin/*` | Admin | Upload signatures, note CRUD, access grants |
| `GET` | `/api/technical`, `/api/hr`, `/api/mustread` | — | Question banks |
| `GET` | `/api/stats` | — | Aggregate platform statistics |
| `GET` | `/api/stats/users` | Admin | Per-user usage aggregation |

---

## 📊 By the Numbers

| | |
|---|---|
| Active users | **500+** |
| Questions | **956** (645 technical · 311 programming) |
| Companies | **92** |
| Placement seasons | **5** (2022-23 → 2026-27) |
| Must-read DSA problems | **29** across 12 topics |
| Conceptual/HR questions | **156** |
| AI surfaces | **3** |

---

## 🗺️ Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md) and [`docs/BACKLOG.md`](docs/BACKLOG.md). Near-term:
voice-based mock interviews (STT/TTS), an embedded code editor with live execution, per-company
analytics dashboards, and a student-submitted question pipeline with admin moderation.

---

## 🤝 Contributing

Questions from a new placement season are the most valuable contribution. Add records to
`src/data/questions.json` following the existing shape (`id`, `company`, `year`,
`technical_questions[]`, `programming_questions[]`) and open a PR.

---

## 👤 Author

**Aman Shekhar** — CSE, CMR Institute of Technology
Built and maintained solo, from the dataset up to production deployment.
