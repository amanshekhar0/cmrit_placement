# 🎯 Campus Placement Prep — 100 Technical Interview Questions (15+ LPA Track)

> A curated, revision-friendly question bank for final-year engineering students targeting **product-based companies and high-growth startups** (₹15 LPA and above) in the Indian tech ecosystem.
> Focus: **practical system-design thinking, applied fundamentals, and modern AI systems** — not rote memorization.

**How to use this doc**
- Each question has a **difficulty tag** (🟢 Easy / 🟡 Medium / 🔴 Hard) and, where known, **company tags**.
- Answers are structured as: *core concept → trade-offs → real-world considerations → follow-ups*.
- Skim the **Quick Revision** section the night before your interview.
- Don't memorize answers verbatim — internalize the *reasoning pattern* so you can adapt to variants.

> ⚠️ Company tags reflect commonly-reported patterns from public interview experiences (LeetCode Discuss, GeeksforGeeks, InterviewBit, Glassdoor). Treat them as *indicative*, not guarantees.

---

## 📑 Table of Contents

1. [System Design Fundamentals](#1-system-design-fundamentals) — Q1–Q12
2. [Large Language Models & AI Systems](#2-large-language-models--ai-systems) — Q13–Q24
3. [Data Structures & Algorithms (Advanced)](#3-data-structures--algorithms-advanced) — Q25–Q34
4. [Operating Systems](#4-operating-systems) — Q35–Q44
5. [Computer Networks](#5-computer-networks) — Q45–Q54
6. [Database Systems](#6-database-systems) — Q55–Q65
7. [Object-Oriented Design (LLD)](#7-object-oriented-design-lld) — Q66–Q75
8. [Distributed Systems](#8-distributed-systems) — Q76–Q85
9. [Cloud Computing & DevOps](#9-cloud-computing--devops) — Q86–Q93
10. [Behavioral & Scenario-Based](#10-behavioral--scenario-based) — Q94–Q100
11. [Web & Frontend Engineering](#11-web--frontend-engineering) — Q101–Q113
12. [⚡ Quick Revision Cheat Sheet](#-quick-revision-cheat-sheet)

---

## 1. System Design Fundamentals

> **The RESHADED-style approach interviewers expect:** *Requirements (functional + non-functional) → Estimate scale (QPS, storage, bandwidth) → High-level design → API design → Data model → Deep-dive on 1–2 components → Bottlenecks & trade-offs.* Always start by asking clarifying questions and stating assumptions.

---

### Q1. How do you approach a system design problem you've never seen before? 🟢
**Asked at:** Amazon, Flipkart, Microsoft, Uber

A repeatable framework matters more than knowing a specific design:

1. **Clarify requirements** — functional (what it does) vs non-functional (scale, latency, availability, consistency). Ask: how many users? read-heavy or write-heavy? global or regional?
2. **Estimate scale** — Daily Active Users → QPS → storage/year → bandwidth. Back-of-the-envelope numbers guide every later decision.
3. **Define APIs** — the contract between client and server. Forces you to nail down inputs/outputs.
4. **High-level design** — client → load balancer → app servers → cache → database → async workers/queues.
5. **Data model** — SQL vs NoSQL, schema, sharding key.
6. **Deep dive** — pick the interesting component (e.g., the feed generator, the matching engine) and go deep.
7. **Identify bottlenecks** — single points of failure, hot partitions, then propose mitigations.

**Trade-off framing to repeat throughout:** consistency vs availability, latency vs throughput, cost vs performance, read vs write optimization.

**Follow-ups:**
- How would your design change if traffic grew 100×?
- Where is the single point of failure?
- What's your read:write ratio and how does it change the design?

---

### Q2. Design a URL shortener (like TinyURL / bit.ly). 🟡
**Asked at:** Amazon, Google, Microsoft, Adobe

**Requirements:** shorten a long URL → short code; redirect short → long; ~100:1 read:write ratio; low-latency redirects; links can expire.

**Scale estimate:** 100M new URLs/month ≈ 40 writes/sec; reads ≈ 4000/sec. At 500 bytes/record → ~600 GB over 10 years (small — fits comfortably).

**Core design — how to generate the short key:**
- **Approach A — Hashing:** `base62(MD5(longURL))` truncated to 7 chars. 62^7 ≈ 3.5 trillion combos. Problem: collisions → need retry logic.
- **Approach B — Counter + Base62 (preferred):** A distributed counter (e.g., ZooKeeper ranges or a DB auto-increment) issues unique IDs; encode the integer in base62. No collisions. Use **key-generation service (KGS)** that pre-generates keys to avoid contention.

**Architecture:**
```
Client → Load Balancer → App Servers → [Cache: Redis] → DB (key→URL)
                                          ↓ (miss)
                                     Database (NoSQL, e.g. DynamoDB/Cassandra)
```
- **Cache** hot URLs (80/20 rule) with LRU eviction → most redirects never touch the DB.
- **Redirect:** return HTTP **301** (permanent, cacheable by browser) vs **302** (temporary, lets you track analytics). 302 is often chosen for click tracking.
- **DB choice:** NoSQL key-value store — simple lookups, easy horizontal scaling, no joins needed.

**Trade-offs:** 301 caches in the browser (fewer server hits, but you lose analytics); 302 gives analytics at the cost of extra traffic.

**Follow-ups:**
- How do you handle custom aliases and collisions?
- How would you implement analytics (click counts, geography)?
- How do you prevent abuse (spam URLs)?

---

### Q3. Explain caching strategies and cache eviction policies. 🟡
**Asked at:** Amazon, Flipkart, Paytm, Swiggy

**Why cache:** reduce latency, reduce load on the primary datastore, improve throughput. Caches live at many layers: browser, CDN, application (Redis/Memcached), and database.

**Write strategies:**
| Strategy | How it works | Trade-off |
|---|---|---|
| **Cache-aside (lazy loading)** | App checks cache; on miss, reads DB and populates cache | Simple, resilient; first request is slow, risk of stale data |
| **Write-through** | Write goes to cache **and** DB synchronously | Cache always fresh; higher write latency |
| **Write-back (write-behind)** | Write to cache, async flush to DB | Fast writes; risk of data loss on crash |
| **Read-through** | Cache library fetches from DB on miss | Clean abstraction; cache must sit inline |

**Eviction policies:** **LRU** (least recently used — most common), **LFU** (least frequently used), **FIFO**, **TTL**-based expiry.

**Real-world concerns:**
- **Cache invalidation** ("one of the two hard problems in CS") — stale data. Use TTLs + explicit invalidation on writes.
- **Thundering herd / cache stampede** — many requests miss simultaneously on a hot key expiry. Fix with request coalescing, staggered TTLs, or a lock on recompute.
- **Hot key problem** — one key gets disproportionate traffic; replicate the key across nodes.

**Follow-ups:**
- How do you keep cache and DB consistent?
- What happens when the cache node dies?
- LRU implementation? (HashMap + doubly linked list → O(1) get/put — *see Q30*)

---

### Q4. What is load balancing, and how do load balancing algorithms differ? 🟢
**Asked at:** Amazon, Microsoft, Uber, Razorpay

A **load balancer (LB)** distributes incoming traffic across multiple servers to maximize throughput, minimize latency, and avoid overloading any single server. It also enables **health checks** (remove dead servers) and **horizontal scaling**.

**Layer:** L4 (transport — routes by IP/port, faster) vs L7 (application — routes by URL/headers/cookies, smarter, enables path-based routing).

**Algorithms:**
- **Round Robin** — cycle through servers. Simple; ignores server load.
- **Weighted Round Robin** — bigger servers get more traffic.
- **Least Connections** — send to the server with fewest active connections. Good for long-lived connections.
- **IP Hash / Consistent Hashing** — route by client IP hash → session stickiness; consistent hashing minimizes remapping when servers are added/removed (*see Q78*).

**Real-world:** LBs are deployed in pairs (active-passive) to avoid being a single point of failure. In the cloud, managed LBs (AWS ELB/ALB) handle this.

**Follow-ups:**
- How do you maintain session state behind an LB? (sticky sessions vs externalized session store)
- What's the difference between an LB and an API Gateway?
- How does the LB detect an unhealthy server?

---

### Q5. Monolith vs Microservices — when would you choose each? 🟡
**Asked at:** Flipkart, Zomato, PhonePe, Microsoft

**Monolith:** single deployable unit. **Pros:** simple to develop/test/deploy early, no network overhead between modules, easy transactions. **Cons:** scales as one unit, one bug can crash everything, hard to adopt new tech, large teams step on each other.

**Microservices:** independently deployable services, each owning its data. **Pros:** independent scaling & deployment, tech heterogeneity, fault isolation, team autonomy. **Cons:** distributed-system complexity (network failures, latency), hard distributed transactions, operational overhead (monitoring, service discovery), eventual consistency.

**Rule of thumb:** *Start with a well-structured monolith; extract microservices when scaling pain, team size, or deployment friction justify the added complexity.* Premature microservices are a classic anti-pattern.

**Supporting patterns for microservices:** API Gateway, service discovery, circuit breakers (resilience), centralized logging/tracing, saga pattern for distributed transactions (*see Q80*).

**Follow-ups:**
- How do services communicate? (sync REST/gRPC vs async message queues)
- How do you handle a transaction spanning three services?
- How do you prevent cascading failures? (circuit breaker, bulkhead, timeouts)

---

### Q6. Design a rate limiter. 🟡
**Asked at:** Amazon, Stripe, Razorpay, Atlassian

**Goal:** limit a client to N requests per time window to protect against abuse/overload and enforce fair usage.

**Algorithms (know the trade-offs):**
| Algorithm | Idea | Pros / Cons |
|---|---|---|
| **Fixed Window Counter** | Count requests per fixed window (e.g., per minute) | Simple; allows 2× burst at window edges |
| **Sliding Window Log** | Store timestamps, count those in the last window | Accurate; memory-heavy |
| **Sliding Window Counter** | Weighted blend of current + previous window | Good accuracy, low memory |
| **Token Bucket** | Tokens refill at fixed rate; each request consumes one; allows bursts | Most popular; smooth + bursty traffic |
| **Leaky Bucket** | Requests queue and drain at a constant rate | Smooths output; can add latency |

**Distributed implementation:** store counters/tokens in **Redis** (atomic `INCR` + `EXPIRE`, or Lua scripts for atomicity) so all app servers share state. Key = `user_id:endpoint`.

```
allow_request(user):
    tokens = redis.get(user)          # token bucket
    refill_based_on_elapsed_time()
    if tokens >= 1:
        redis.decr(user); return ALLOW
    else:
        return REJECT (HTTP 429 Too Many Requests)
```

**Trade-offs:** accuracy vs memory; where to place it (client, gateway, or per-service); how to handle Redis being a bottleneck (local + global counters, or approximate limiting).

**Follow-ups:**
- How do you rate-limit across a distributed cluster consistently?
- Fixed vs sliding window — which and why?
- What HTTP status and headers do you return? (429, `Retry-After`, `X-RateLimit-Remaining`)

---

### Q7. Design a news feed / timeline (like Instagram or Twitter). 🔴
**Asked at:** Meta, Flipkart, ShareChat, LinkedIn

**Requirements:** users follow others; feed shows recent posts from followees, ranked; must load fast; write and read heavy.

**The central trade-off — Fan-out on write vs read:**
- **Fan-out on write (push):** when a user posts, push the post ID into every follower's precomputed feed (in Redis). **Reads are instant.** But a celebrity with 50M followers triggers 50M writes → the *"hot user"* problem.
- **Fan-out on read (pull):** build the feed at read time by querying followees' recent posts. **Cheap writes**, but slow reads and heavy DB load at scale.
- **Hybrid (real-world answer):** push for normal users; pull for celebrities. Merge at read time. This is what Twitter/Instagram effectively do.

**Architecture:**
```
Post → Write Service → Post DB (Cassandra)
                    → Fan-out Service → per-user feed cache (Redis)
Feed Read → Feed Service → merge (precomputed feed + celebrity pull) → rank → return
```
- **Ranking:** chronological is simplest; production feeds use ML ranking (engagement prediction).
- **Storage:** posts in a wide-column store (Cassandra) partitioned by user; feeds in Redis.

**Follow-ups:**
- How do you handle the celebrity fan-out problem?
- How do you paginate an infinite feed? (cursor-based, not offset)
- How do you inject ads / ranked content?

---

### Q8. How do you design for high availability and handle failures? 🟡
**Asked at:** Amazon, Uber, Google

**Availability** is measured in "nines": 99.9% ≈ 8.7h downtime/year; 99.99% ≈ 52 min/year. Achieved through:

- **Redundancy & replication** — no single point of failure; replicate servers, databases, and even data centers.
- **Failover** — active-passive (standby takes over) or active-active (all serve traffic).
- **Health checks + auto-recovery** — LB removes unhealthy nodes; orchestrator restarts them.
- **Graceful degradation** — serve stale cache or a reduced experience rather than failing entirely.
- **Circuit breakers** — stop calling a failing downstream to prevent cascading failure.
- **Redundancy across Availability Zones / regions** — survive a data-center outage.

**Key tension:** the CAP theorem (*see Q57*) forces a choice between consistency and availability during a network partition.

**Follow-ups:**
- What's your RTO/RPO (recovery time/point objective)?
- How do you avoid a thundering herd during recovery?
- Active-active vs active-passive — trade-offs?

---

### Q9. Design a distributed unique ID generator. 🟡
**Asked at:** Twitter, Flipkart, PhonePe

**Why:** auto-increment doesn't work across shards; you need globally unique, roughly time-sortable, 64-bit IDs at high throughput.

**Options:**
- **UUID (128-bit):** globally unique, generated locally with no coordination. But large and not sortable → poor as a DB index/primary key.
- **DB ticket server:** central auto-increment. Simple but a single point of failure / bottleneck.
- **Snowflake (Twitter — the canonical answer):** 64-bit ID = `[timestamp (41 bits)] [machine ID (10 bits)] [sequence (12 bits)]`. Time-sortable, no coordination needed, 4096 IDs/ms/machine.

```
id = (timestamp_ms << 22) | (machine_id << 12) | sequence
```

**Trade-offs:** Snowflake needs clock synchronization (clock skew/backward-drift is the main pitfall — handle by waiting or throwing).

**Follow-ups:**
- What happens on clock drift backward?
- Why is time-sortability useful? (range scans, pagination)
- How many bits for machine ID if you have 5000 machines?

---

### Q10. Design a typeahead / autocomplete system (search suggestions). 🔴
**Asked at:** Google, Amazon, Swiggy

**Requirements:** return top-k suggestions for a prefix in <100ms; suggestions ranked by popularity; updated as new queries trend.

**Core data structure:** a **Trie (prefix tree)**. Each node stores the **top-k completions** for that prefix (precomputed) so lookups are O(prefix length), not a subtree traversal.

**Architecture:**
```
Type "ap" → Trie service (in-memory, top-k cached at node) → return ["apple","app store",...]
Query logs → aggregation (MapReduce/stream) → rebuild/update Trie weights offline
```
- **Serving:** keep the Trie in memory; shard by first character/prefix across servers.
- **Updating:** trending terms are aggregated asynchronously (batch or streaming) and merged into the Trie — you don't update on every keystroke.
- **Optimization:** cache popular prefixes; debounce client keystrokes; use a CDN for very common prefixes.

**Follow-ups:**
- How do you rank suggestions? (frequency + recency + personalization)
- How do you handle typos? (edit-distance / fuzzy matching)
- Memory optimization for the Trie? (compressed/radix trie)

---

### Q11. Design a scalable notification system (push/email/SMS). 🟡
**Asked at:** Flipkart, Swiggy, Meesho

**Requirements:** send push/SMS/email to millions; support multiple channels; handle third-party failures; avoid spamming; respect user preferences.

**Architecture (event-driven, async):**
```
Service emits event → Message Queue (Kafka) → Notification Service
   → template + user preference check → channel workers (Push/Email/SMS)
   → third-party providers (FCM/APNs, SendGrid, Twilio) with retry + DLQ
```
- **Decouple with a queue** — producers don't wait on delivery; workers scale independently per channel.
- **Retries with backoff + Dead Letter Queue** for failed sends.
- **Rate limiting & dedup** — avoid sending the same notification twice (idempotency keys).
- **User preferences & throttling** — respect opt-outs and frequency caps.
- **Fan-out** — priority queues for OTP (urgent) vs marketing (bulk).

**Follow-ups:**
- How do you guarantee at-least-once vs exactly-once delivery?
- How do you handle a third-party provider outage?
- How do you prioritize OTP over promotional notifications?

---

### Q12. How do you estimate capacity / do back-of-the-envelope math? 🟢
**Asked at:** Amazon, Google, Microsoft

Interviewers want to see you reason about scale numerically. Memorize these anchors:

**Latency numbers (order of magnitude):** L1 cache ~1 ns; main memory ~100 ns; SSD read ~100 µs; network round trip within a datacenter ~0.5 ms; disk seek ~10 ms; inter-continental round trip ~150 ms.

**Powers to know:** 1 KB=10³, 1 MB=10⁶, 1 GB=10⁹, 1 TB=10¹², 1 PB=10¹⁵. A day ≈ 86,400 s ≈ **~10⁵ s**.

**Example — QPS from DAU:** 100M DAU, each makes 10 requests/day → 10⁹ requests/day ÷ 10⁵ s ≈ **~10,000 QPS average**; peak ≈ 2–3× average.

**Storage example:** 500M photos/day × 1 MB = 500 TB/day.

**Method:** state assumptions → compute reads/writes per second → storage/year → bandwidth. Round aggressively; interviewers care about the *approach*, not exact figures.

**Follow-ups:**
- How many servers do you need for 50k QPS?
- Estimate the storage for 5 years of user data.
- What's the read:write ratio and how does it affect your caching?

---

## 2. Large Language Models & AI Systems

> Increasingly asked even for SDE roles at product companies and AI-first startups. You don't need to be an ML researcher — you need a clear mental model of *how these systems work and their engineering trade-offs*.

---

### Q13. How does ChatGPT (an LLM) actually work, end to end? 🟢
**Asked at:** Google, Microsoft, Sarvam AI, Startups

At a high level, an LLM is a **next-token predictor** trained on massive text, then aligned to be helpful. The pipeline:

1. **Tokenization** — text is split into tokens (sub-word units via Byte-Pair Encoding). "unbelievable" → `un`, `believ`, `able`.
2. **Embedding** — each token → a high-dimensional vector; positional information is added (so order matters).
3. **Transformer stack** — many layers of **self-attention + feed-forward networks** process all tokens in parallel, building contextual representations.
4. **Output** — the final layer produces a probability distribution over the vocabulary for the *next* token; one is sampled; the token is appended; repeat (**autoregressive generation**).
5. **Training stages:** (a) **Pretraining** — self-supervised next-token prediction on trillions of tokens; (b) **Supervised Fine-Tuning (SFT)** — trained on curated instruction→response pairs; (c) **RLHF / preference optimization** — aligned to human preferences for helpfulness and safety.

**Key insight to state:** the model doesn't "look things up" — it has compressed statistical patterns into billions of parameters (weights) and generates plausible continuations.

**Follow-ups:**
- Why can it hallucinate? (it predicts plausible tokens, not verified facts)
- What's the difference between pretraining and fine-tuning?
- What limits its knowledge? (training cutoff, no live data without tools/RAG)

---

### Q14. Explain the Transformer architecture. 🟡
**Asked at:** Google, Microsoft, Nvidia, AI startups

Introduced in *"Attention Is All You Need"* (Vaswani et al., 2017), the Transformer replaced recurrence (RNN/LSTM) with **attention**, enabling parallel processing of sequences and much better long-range dependency modeling.

**Core components of a Transformer block:**
1. **Multi-Head Self-Attention** — each token attends to all others; multiple heads capture different relationship types in parallel.
2. **Positional Encoding** — since attention is order-agnostic, position info is injected (sinusoidal originally; modern models use **RoPE — rotary positional embeddings** for long contexts).
3. **Feed-Forward Network (FFN)** — a per-token MLP that transforms representations.
4. **Residual connections + Layer Normalization** (modern models use **RMSNorm**, and *pre-norm* for training stability).

**Three architectural families:**
- **Encoder-only (BERT):** bidirectional attention → understanding tasks (classification, NER).
- **Decoder-only (GPT, LLaMA, Claude):** causal (left-to-right masked) attention → generation. **Most modern LLMs are decoder-only.**
- **Encoder-decoder (T5):** encoder understands input, decoder generates output → translation, summarization.

**Complexity:** self-attention is **O(n²·d)** in sequence length n — the reason long context is expensive.

**Follow-ups:**
- Why decoder-only for most LLMs? (generation is the primary use case; scaling laws favor it)
- Why multi-head instead of one big head? (different subspaces capture different patterns)
- What's the quadratic bottleneck and how is it mitigated? (FlashAttention, sparse/linear attention, SSMs like Mamba)

---

### Q15. Explain the self-attention mechanism (Q, K, V). 🔴
**Asked at:** Google, Nvidia, Microsoft Research

**Intuition:** for each token, attention decides *which other tokens matter* and blends their information accordingly. In "The animal didn't cross the street because **it** was tired," attention lets "it" attend strongly to "animal."

**Mechanics — Query, Key, Value:**
- Each token is projected into three vectors: **Query (Q)**, **Key (K)**, **Value (V)**.
- **Attention score** = dot product of a token's Query with every Key → how relevant each other token is.
- Scale by √dₖ (keeps gradients stable), apply **softmax** → weights summing to 1.
- Output = weighted sum of Values.

**The formula:**
```
Attention(Q, K, V) = softmax( (Q·Kᵀ) / √dₖ ) · V
```

**Multi-head attention:** run h attention operations in parallel with different learned projections, then concatenate — each head learns different relationships (syntax, coreference, etc.).

**Why scale by √dₖ:** without it, large dot products push softmax into regions with tiny gradients (vanishing gradients).

**Follow-ups:**
- What is causal masking and why is it needed for generation?
- What's the memory/compute cost as sequence length grows? (O(n²))
- What's GQA (Grouped-Query Attention) and why is it used? (shares K/V across heads → less memory at inference)

---

### Q16. What is RLHF, and why is it needed? 🟡
**Asked at:** OpenAI-style startups, Google, Microsoft

A pretrained model predicts likely text but isn't necessarily *helpful, honest, or safe*. **RLHF (Reinforcement Learning from Human Feedback)** aligns it with human preferences.

**Three steps:**
1. **SFT** — fine-tune the base model on human-written ideal responses.
2. **Reward model** — humans rank/compare multiple model outputs; a separate model learns to predict which output humans prefer → outputs a scalar reward.
3. **RL optimization (PPO)** — the LLM generates responses, the reward model scores them, and the policy is updated (via Proximal Policy Optimization) to maximize reward, with a KL penalty to stay close to the SFT model (so it doesn't degenerate).

**Modern alternative — DPO (Direct Preference Optimization):** skips training a separate reward model and RL loop; directly optimizes on preference pairs. Simpler and more stable, increasingly popular.

**Why it matters:** RLHF is what turned a raw text predictor into a usable assistant — reducing harmful outputs, following instructions, refusing appropriately.

**Follow-ups:**
- What's "reward hacking"? (model exploits the reward model's blind spots)
- DPO vs PPO — trade-offs?
- What's the KL-divergence penalty for?

---

### Q17. What is RAG (Retrieval-Augmented Generation) and when do you use it? 🟡
**Asked at:** Startups, Microsoft, Enterprise AI teams

**Problem it solves:** LLMs have a knowledge cutoff, can't access private/enterprise data, and hallucinate. **RAG grounds the model in retrieved facts** instead of relying only on parametric memory.

**Pipeline:**
```
1. Ingest: documents → chunk → embed → store in a vector DB (Pinecone, Weaviate, pgvector)
2. Query: user question → embed → similarity search → top-k relevant chunks
3. Augment: inject retrieved chunks into the prompt as context
4. Generate: LLM answers using the provided context (+ cite sources)
```

**Why RAG over fine-tuning for knowledge:** cheaper, updatable in real time (just re-index), provides citations, reduces hallucination, keeps private data out of model weights. **Fine-tuning** is better for changing *behavior/style/format*, not for injecting *facts*.

**Real-world concerns:** chunking strategy, embedding quality, retrieval relevance (the failure mode is usually bad retrieval, not generation), context-window limits, and re-ranking retrieved results.

**Follow-ups:**
- RAG vs fine-tuning — when each?
- How do you evaluate a RAG system? (retrieval recall + answer faithfulness)
- How do you handle chunking and overlap?

---

### Q18. Fine-tuning vs prompt engineering vs RAG — how do you choose? 🟡
**Asked at:** AI startups, Microsoft, Product companies

| Approach | What it changes | Best for | Cost |
|---|---|---|---|
| **Prompt engineering** | Nothing in the model; better instructions/examples | Quick wins, most tasks | Lowest |
| **RAG** | Adds external knowledge at inference | Injecting fresh/private facts, citations | Medium |
| **Fine-tuning (incl. LoRA)** | Model weights | Changing style, format, domain behavior; narrow tasks | Highest |

**Decision order (practical):** *Start with prompting → add RAG if it's a knowledge problem → fine-tune only if behavior/format still isn't right.*

**LoRA / PEFT:** parameter-efficient fine-tuning — freeze the base model, train small low-rank adapter matrices. Drastically cheaper (train <1% of params), lets you serve many task-specific adapters on one base model. **QLoRA** adds quantization to fit on a single GPU.

**Follow-ups:**
- What is LoRA and why is it cheaper?
- Can you combine RAG + fine-tuning? (yes — common)
- How do you prevent catastrophic forgetting during fine-tuning?

---

### Q19. How do you optimize LLM inference (latency, throughput, cost)? 🔴
**Asked at:** Nvidia, AI infra startups, Google

Inference is memory-bandwidth-bound and expensive. Key techniques:

- **KV cache** — cache the Key/Value tensors of past tokens so each new token doesn't recompute attention over the whole sequence. Essential; but it grows with context length (memory pressure).
- **Quantization** — store weights in lower precision (FP16 → INT8 → INT4). Smaller memory footprint, faster, minor quality loss.
- **Batching / continuous batching** — process many requests together to maximize GPU utilization (vLLM's key idea).
- **PagedAttention (vLLM)** — manage the KV cache like OS virtual memory pages → far less memory fragmentation, higher throughput.
- **Speculative decoding** — a small "draft" model proposes tokens, the big model verifies in parallel → fewer sequential steps.
- **Model distillation / MoE** — smaller distilled models, or Mixture-of-Experts where only a subset of parameters activate per token.

**Trade-off framing:** latency (time to first token, tokens/sec) vs throughput (requests served) vs cost (GPU-hours) vs quality.

**Follow-ups:**
- Why is the KV cache the main memory consumer at long context?
- What's the difference between prefill and decode phases?
- How does batching hurt individual latency but help throughput?

---

### Q20. Why do LLMs hallucinate, and how do you mitigate it? 🟡
**Asked at:** Startups, Microsoft, Enterprise AI

**Cause:** an LLM generates the *statistically most plausible* continuation, not verified truth. It has no built-in notion of "I don't know" and will confidently fill gaps — especially for facts poorly represented in training data.

**Mitigations:**
- **RAG** — ground answers in retrieved sources and cite them.
- **Prompting** — instruct "say you don't know if unsure," use chain-of-thought, provide context.
- **Tool use / function calling** — let the model call a calculator, search, or database instead of guessing.
- **Lower temperature** — reduces randomness for factual tasks.
- **Verification layer** — a second pass or a separate model checks claims; guardrails/validators.
- **Better training/alignment** — RLHF penalizing confident wrong answers.

**Key point:** you can reduce but not fully eliminate hallucination; production systems assume it and design guardrails around it.

**Follow-ups:**
- How would you build a fact-checking layer?
- How does temperature affect hallucination?
- How do you evaluate hallucination rate?

---

### Q21. What are tokens, context windows, temperature, and top-p? 🟢
**Asked at:** AI startups, Product companies

- **Token:** the unit an LLM processes — a sub-word piece (~4 chars / ~0.75 words in English). Cost, speed, and limits are all measured in tokens.
- **Context window:** the max tokens (input + output) the model can consider at once (e.g., 8k, 128k, 1M+). Everything outside it is "forgotten" — the model is stateless between calls; chat history is re-sent each turn.
- **Temperature:** scales logits before softmax. Low (→0) = deterministic, focused (good for facts/code); high (→1+) = creative, diverse (good for brainstorming).
- **Top-p (nucleus sampling):** sample only from the smallest set of tokens whose cumulative probability ≥ p. Controls diversity by truncating the long tail.
- **Top-k:** sample only from the k most likely tokens.

**Practical note:** for structured/factual output use low temperature; the model has **no memory** — statefulness is an application-layer concern (you resend context).

**Follow-ups:**
- Why does a long conversation eventually lose early context?
- Temperature 0 vs 1 — when each?
- How does token count drive cost?

---

### Q22. Design a system to serve an LLM-powered chatbot at scale. 🔴
**Asked at:** AI startups, Microsoft, Sarvam/Krutrim-style companies

**Requirements:** low latency (stream tokens), high concurrency, cost control, context/history management, safety.

**Architecture:**
```
Client → API Gateway (auth, rate limit) → Orchestrator
   → [Prompt builder: system prompt + RAG retrieval + chat history from a session store]
   → LLM inference cluster (GPU, batched, KV cache) → stream tokens back (SSE/WebSocket)
   → Guardrails (input/output moderation) → Logging/analytics
Vector DB (RAG) | Redis (session/history) | Cache (semantic cache for repeated queries)
```
**Key design decisions:**
- **Streaming** responses (Server-Sent Events) for perceived latency.
- **Semantic caching** — cache answers for semantically similar queries → big cost savings.
- **Request queuing + continuous batching** on the GPU tier for throughput.
- **Fallbacks** — smaller/cheaper model for simple queries, big model for hard ones (model routing).
- **Guardrails** — moderation on input and output; PII redaction.
- **Cost controls** — token limits, rate limiting per user, caching.

**Follow-ups:**
- How do you manage conversation history within the context limit? (summarization, sliding window)
- How do you reduce cost? (caching, routing, quantized models)
- How do you handle GPU capacity spikes?

---

### Q23. What is an AI agent, and how does the ReAct / tool-use loop work? 🟡
**Asked at:** AI startups, Product companies (2026 hot topic)

An **agent** is an LLM that can *take actions* — call tools, APIs, or code — in a loop to accomplish multi-step goals, rather than answering in a single shot.

**ReAct loop (Reason + Act):**
```
loop:
  Thought:  model reasons about what to do next
  Action:   model calls a tool (search, calculator, DB query, API)
  Observation: tool result is fed back into context
  → repeat until the goal is met, then produce the final answer
```

**Design concerns (this is what seniors get grilled on):**
- **Tool schemas** — clear, well-described function signatures.
- **Loop control** — max iterations, timeouts, cost caps (agents can loop forever or rack up cost).
- **Error handling** — retries, fallbacks when a tool fails.
- **Human-in-the-loop** — escalation for risky actions.
- **Observability** — trace every step for debugging.
- **Single-agent vs multi-agent** — orchestrator + specialized sub-agents for complex workflows.

**Follow-ups:**
- How do you stop an agent from infinite loops?
- Single-agent vs multi-agent — when?
- How do you evaluate agent performance?

---

### Q24. How would you evaluate an LLM / GenAI application? 🟡
**Asked at:** AI startups, Microsoft

Unlike classification (accuracy/F1), generative output has no single correct answer — evaluation is harder.

**Approaches:**
- **Reference-based metrics** — BLEU/ROUGE (overlap with a reference); weak for open-ended text.
- **LLM-as-a-judge** — a strong model scores outputs on helpfulness, correctness, tone against a rubric. Scalable, now standard.
- **Human evaluation** — gold standard; expensive; used for calibration.
- **Task-specific / RAG metrics** — retrieval recall/precision, **faithfulness** (is the answer grounded in retrieved context?), **answer relevance**.
- **Guardrail checks** — toxicity, PII leakage, jailbreak resistance.
- **A/B testing in production** — the ultimate signal (user engagement, thumbs up/down).

**Key point:** build an **eval set** of representative prompts + expected qualities early; measure regressions as you change prompts/models.

**Follow-ups:**
- How do you detect regressions when you change the prompt?
- What's "faithfulness" vs "relevance" in RAG eval?
- Why is LLM-as-a-judge biased and how do you mitigate it?

---

## 3. Data Structures & Algorithms (Advanced)

> For 15+ LPA roles, DSA rounds test *problem-solving patterns* (two pointers, sliding window, binary search on answer, DP, graphs, heaps) more than obscure algorithms. Always state time/space complexity and discuss trade-offs.

---

### Q25. Which DSA patterns should you master, and how do you recognize them? 🟢
**Asked at:** All product companies

Recognize the pattern from the problem signature:
- **Two Pointers** — sorted array, pair/triplet sums, remove duplicates → O(n).
- **Sliding Window** — contiguous subarray/substring with a constraint (longest/max/min) → O(n).
- **Fast & Slow Pointers** — cycle detection in linked lists (Floyd's).
- **Binary Search (incl. "on the answer")** — sorted data, or minimize/maximize a monotonic function.
- **BFS/DFS** — trees and graphs; BFS for shortest path in unweighted graphs.
- **Backtracking** — permutations, combinations, N-Queens, Sudoku.
- **Dynamic Programming** — overlapping subproblems + optimal substructure.
- **Heap / Priority Queue** — top-k, merge-k, streaming median.
- **Union-Find (DSU)** — connectivity, cycle detection, Kruskal's MST.
- **Trie** — prefix search, autocomplete.

**Interview tip:** verbalize the pattern ("this looks like a sliding-window problem because...") before coding.

**Follow-ups:**
- How do you spot a DP problem?
- When BFS vs DFS?

---

### Q26. Explain dynamic programming with a concrete example. 🟡
**Asked at:** Amazon, Google, Microsoft, Flipkart

**DP applies when:** the problem has (1) **optimal substructure** — optimal solution is built from optimal sub-solutions, and (2) **overlapping subproblems** — the same subproblems recur.

**Two styles:** **top-down (memoization)** — recursion + cache; **bottom-up (tabulation)** — iterative table fill.

**Example — 0/1 Knapsack:** maximize value within weight capacity W.
```
dp[i][w] = max value using first i items with capacity w
dp[i][w] = max( dp[i-1][w],                        // skip item i
                dp[i-1][w - wt[i]] + val[i] )      // take item i (if wt[i] ≤ w)
```
Time **O(n·W)**, space **O(n·W)** → optimizable to **O(W)** with a 1D rolling array.

**Classic DP problems to know:** Longest Common Subsequence, Longest Increasing Subsequence (O(n log n) with binary search), Edit Distance, Coin Change, House Robber, Matrix Chain Multiplication, Word Break.

**Follow-ups:**
- Convert this memoized solution to bottom-up.
- Optimize the space complexity.
- What's the recurrence and base case?

---

### Q27. How do you detect a cycle in a linked list / graph? 🟡
**Asked at:** Amazon, Microsoft, Adobe

**Linked list — Floyd's Tortoise & Hare:** slow pointer moves 1 step, fast moves 2. If they meet, there's a cycle. To find the cycle *start*, reset one pointer to head and advance both by 1 — they meet at the start. **O(n) time, O(1) space** (beats the hash-set approach's O(n) space).

**Directed graph — DFS with recursion stack (3-color):** a back-edge to a node currently in the recursion stack means a cycle. Colors: white (unvisited), gray (in progress), black (done). A gray→gray edge = cycle.

**Undirected graph:** DFS tracking parent (an edge to a visited non-parent = cycle), or **Union-Find** (if two endpoints of an edge share a root, adding it creates a cycle).

**Follow-ups:**
- Why does Floyd's reset-to-head trick find the cycle start? (prove with distances)
- Cycle detection in a DAG for topological sort?

---

### Q28. When would you use a heap? Solve "top K frequent elements." 🟡
**Asked at:** Amazon, Google, Uber

A **heap (priority queue)** gives O(log n) insert/extract-min(max) and O(1) peek — ideal for "k-th largest/smallest," "top k," "merge k sorted," and streaming medians.

**Top-K frequent elements:**
1. Count frequencies with a hash map → O(n).
2. Push into a **min-heap of size k** (keyed by frequency); if size > k, pop the smallest. → O(n log k).
3. Heap contents = the k most frequent.

Using a min-heap of size k (not a max-heap of size n) keeps complexity at **O(n log k)** and space O(k). For very large n, **Quickselect** gives O(n) average.

**Streaming median:** two heaps — a max-heap for the lower half, a min-heap for the upper half; balance sizes → median in O(1), insert O(log n).

**Follow-ups:**
- Min-heap of size k vs max-heap of size n — why the former?
- How does Quickselect get O(n) average?
- Solve "merge k sorted lists" with a heap.

---

### Q29. Explain graph traversal and shortest-path algorithms. 🟡
**Asked at:** Amazon, Google, Uber, Ola

- **BFS** — level-order; **shortest path in an unweighted graph**; O(V+E).
- **DFS** — deep-first; cycle detection, topological sort, connected components; O(V+E).
- **Dijkstra** — shortest path with **non-negative** weights; min-heap; O((V+E) log V). Fails with negative edges.
- **Bellman-Ford** — handles negative weights, detects negative cycles; O(V·E).
- **Floyd-Warshall** — all-pairs shortest paths; O(V³); good for dense small graphs.
- **A\*** — Dijkstra + heuristic; faster for point-to-point (maps, games).
- **Topological Sort** — ordering of a DAG (Kahn's BFS or DFS); used in build systems, task scheduling.
- **MST** — Kruskal (sort edges + Union-Find) or Prim (grow from a node with a heap).

**Follow-ups:**
- Why does Dijkstra fail with negative edges?
- BFS vs Dijkstra — when is BFS enough?
- How does A* differ from Dijkstra?

---

### Q30. Design an LRU cache with O(1) operations. 🟡
**Asked at:** Amazon, Microsoft, Flipkart, Atlassian (a *very* common one)

**Requirement:** `get(key)` and `put(key, value)` both in **O(1)**, evicting the least-recently-used entry when capacity is exceeded.

**Data structures:** **HashMap** (key → node) + **Doubly Linked List** (ordered by recency; head = most recent, tail = least recent).
```
get(key):   if in map → move node to head → return value; else -1
put(key,v): if exists → update + move to head
            else → add to head; if over capacity → remove tail node (+ its map entry)
```
The hash map gives O(1) lookup; the doubly linked list gives O(1) move/remove (you have direct node references, so no traversal). **LFU cache** is a common harder follow-up (needs frequency buckets).

**Follow-ups:**
- Why a *doubly* linked list, not singly? (O(1) removal needs the prev pointer)
- Make it thread-safe.
- Now design an LFU cache.

---

### Q31. String algorithms: how would you find a pattern in a large text? 🟡
**Asked at:** Google, Amazon

- **Naive:** O(n·m). Fine for small inputs.
- **KMP (Knuth-Morris-Pratt):** precompute a "failure function" (longest prefix that's also a suffix) to skip re-comparisons → **O(n+m)**.
- **Rabin-Karp:** rolling hash to compare substrings in O(1) → O(n+m) average; great for **multiple pattern** search and plagiarism/duplicate detection.
- **Trie / Aho-Corasick:** for many patterns at once.

**Common string problems:** longest palindromic substring (expand-around-center or Manacher's), anagram grouping (sort or char-count key), longest substring without repeating chars (sliding window).

**Follow-ups:**
- What does KMP's failure function represent?
- Why is Rabin-Karp good for multi-pattern search?

---

### Q32. How do you handle "find the k-th largest in a stream" / very large data? 🔴
**Asked at:** Amazon, Google, data-heavy startups

**Streaming k-th largest:** maintain a **min-heap of size k**; each new element pushes and pops if size > k; the heap root is the k-th largest. O(log k) per element, O(k) space — you never store the whole stream.

**Data too big for memory (external algorithms):**
- **External merge sort** — sort chunks that fit in RAM, write to disk, k-way merge.
- **Count-Min Sketch** — approximate frequency counts in sublinear space (heavy hitters).
- **HyperLogLog** — approximate cardinality (distinct count) in ~KB regardless of data size.
- **Bloom filter** — probabilistic set membership; no false negatives, tunable false positives; used to avoid unnecessary disk/DB lookups.

**Follow-ups:**
- How does a Bloom filter work and where is it used? (caches, DBs like Cassandra to skip disk reads)
- HyperLogLog for counting unique visitors?
- Trade-off of approximate vs exact?

---

### Q33. Explain time/space complexity trade-offs with a real example. 🟢
**Asked at:** All companies

Interviewers want you to *reason about trade-offs*, not just recite Big-O.

**Example — Two Sum:**
- Brute force: check all pairs → **O(n²)** time, O(1) space.
- Hash map: store seen values → **O(n)** time, **O(n)** space.
This is the classic *space-for-time* trade-off — spend O(n) memory to cut time from quadratic to linear.

**Other trade-offs to mention:** precomputation/caching (space for repeated-query speed), sorting first (O(n log n)) to enable O(n) two-pointer scans, and choosing a data structure by access pattern (array for indexing, hash for lookup, heap for min/max, tree for ordered range queries).

**Amortized analysis:** dynamic array append is O(1) *amortized* despite occasional O(n) resizes.

**Follow-ups:**
- Can you reduce the space at the cost of time here?
- What's amortized vs worst-case complexity?

---

### Q34. Design an algorithm for a real product feature (e.g., "nearby drivers"). 🔴
**Asked at:** Uber, Ola, Swiggy, Zomato

**Problem:** given a rider's location, find nearby available drivers fast, at scale.

**Approach — spatial indexing:**
- **Geohashing** — encode lat/long into a string; nearby points share prefixes → prefix match = proximity. Bucket drivers by geohash cell; query the rider's cell + 8 neighbors.
- **QuadTree** — recursively subdivide space; efficient range queries in dense areas.
- **Uber's H3** — hexagonal grid for uniform neighbor distances.

**System side:** driver locations stream in via WebSockets → updated in an in-memory geospatial store (Redis `GEOADD`/`GEORADIUS`) → matching service queries by radius → ranks by ETA. Partition by region for scale.

**Follow-ups:**
- Why geohash over storing raw lat/long and scanning?
- How do you handle a driver crossing cell boundaries?
- How do you keep locations fresh at millions of updates/sec?

---

## 4. Operating Systems

> High-frequency core subject at Amazon, Microsoft, Flipkart. Focus on processes/threads, scheduling, memory management, concurrency, and deadlocks.

---

### Q35. Process vs Thread — what's the difference? 🟢
**Asked at:** Amazon, Microsoft, Flipkart, Paytm

A **process** is an independent program in execution with its own memory space (code, heap, stack, data). A **thread** is a lightweight unit of execution *within* a process that shares the process's memory (heap, code) but has its own stack and registers.

| | Process | Thread |
|---|---|---|
| Memory | Separate address space | Shared within process |
| Communication | IPC (pipes, sockets, shared memory) — costly | Shared memory — fast but needs synchronization |
| Creation cost | Heavy | Light |
| Failure isolation | One crash doesn't affect others | One thread crash can kill the process |
| Context switch | Expensive | Cheaper |

**When to use threads:** parallelism within one app (web server handling many requests). **When to use processes:** isolation/robustness (Chrome uses a process per tab).

**Follow-ups:**
- What is a context switch and why is it expensive?
- User-level vs kernel-level threads?
- What memory is shared vs private between threads?

---

### Q36. Explain CPU scheduling algorithms. 🟡
**Asked at:** Amazon, Microsoft, Flipkart

The scheduler decides which ready process runs next, optimizing for throughput, turnaround, waiting time, and response time.

| Algorithm | Idea | Note |
|---|---|---|
| **FCFS** | First come first served | Simple; convoy effect (short jobs wait behind long ones) |
| **SJF** | Shortest job first | Optimal average wait; needs burst-time prediction; can starve long jobs |
| **SRTF** | Preemptive SJF | Better response; more context switches |
| **Round Robin** | Fixed time quantum, cyclic | Fair, good for time-sharing; quantum size is key |
| **Priority** | Highest priority first | Starvation risk → fix with **aging** |
| **Multilevel Feedback Queue** | Multiple queues, jobs move between them | Adaptive; used in real OSes |

**Preemptive vs non-preemptive:** preemptive can interrupt a running process (better responsiveness, more overhead); non-preemptive runs to completion/block.

**Convoy effect:** short processes stuck behind a long one in FCFS → poor utilization.

**Follow-ups:**
- How does Round Robin's quantum affect performance? (too small → overhead; too large → ~FCFS)
- How do you prevent starvation? (aging)
- Which does a modern OS use?

---

### Q37. What is virtual memory, paging, and demand paging? 🟡
**Asked at:** Amazon, Microsoft, Nvidia

**Virtual memory** gives each process the illusion of a large, contiguous, private address space, decoupled from physical RAM. It enables running programs larger than RAM and isolates processes.

- **Paging** — divide virtual and physical memory into fixed-size **pages/frames**; a **page table** maps virtual pages → physical frames. The **TLB** (Translation Lookaside Buffer) caches recent translations to speed this up.
- **Demand paging** — load pages into RAM only when accessed (lazy). A **page fault** occurs on access to a page not in RAM → OS fetches it from disk.
- **Thrashing** — excessive paging (more time swapping than executing) when working sets don't fit in RAM → system grinds to a halt. Fixed by reducing multiprogramming or adding RAM.

**Page replacement algorithms:** FIFO (suffers Belady's anomaly), **LRU** (best practical), Optimal (theoretical benchmark), Clock/Second-chance (LRU approximation used in practice).

**Follow-ups:**
- What is a TLB and TLB miss?
- Belady's anomaly? (FIFO can get *worse* with more frames)
- Internal vs external fragmentation? (paging causes internal; segmentation causes external)

---

### Q38. Explain deadlock: conditions, prevention, avoidance, detection. 🟡
**Asked at:** Amazon, Microsoft, Flipkart, Cisco

**Deadlock:** a set of processes each waiting for a resource held by another, so none proceeds.

**Coffman's four necessary conditions (all must hold):**
1. **Mutual exclusion** — resources non-shareable.
2. **Hold and wait** — hold one resource while waiting for another.
3. **No preemption** — can't forcibly take a resource.
4. **Circular wait** — a cycle of processes each waiting on the next.

**Handling strategies:**
- **Prevention** — break one condition (e.g., request all resources at once → no hold-and-wait; impose resource ordering → no circular wait).
- **Avoidance** — **Banker's Algorithm**: grant a request only if the system stays in a *safe state*.
- **Detection & recovery** — allow deadlocks, detect via a wait-for graph (cycle = deadlock), recover by killing/rolling back a process.
- **Ostrich algorithm** — ignore it (what most general-purpose OSes do, since deadlocks are rare).

**Follow-ups:**
- Explain the Banker's algorithm and "safe state."
- Which condition is easiest to break in practice? (circular wait via ordering)
- Difference between deadlock, livelock, and starvation?

---

### Q39. What are synchronization primitives (mutex, semaphore, monitor)? 🟡
**Asked at:** Amazon, Microsoft, Nvidia

Needed to protect **critical sections** — code accessing shared resources — from race conditions.

- **Mutex (lock):** binary; only the thread that locked it can unlock. Ownership semantics.
- **Semaphore:** a counter allowing up to N concurrent accesses. **Binary semaphore** = signaling lock (any thread can signal); **counting semaphore** = limit N resources. Uses `wait()`/`signal()` (P/V).
- **Monitor:** higher-level construct (in a language) bundling shared data + methods with automatic mutual exclusion + condition variables (Java `synchronized`).
- **Condition variable:** lets a thread wait until a condition is met (`wait`/`notify`).

**Mutex vs binary semaphore:** a mutex has ownership (must be unlocked by the locker); a semaphore is a signaling mechanism (can be signaled by another thread).

**Classic problems:** Producer-Consumer (bounded buffer), Readers-Writers, Dining Philosophers (deadlock avoidance).

**Follow-ups:**
- Solve Producer-Consumer with semaphores.
- Spinlock vs mutex — when each?
- What causes a race condition?

---

### Q40. What is a race condition and how do you prevent it? 🟢
**Asked at:** Amazon, Microsoft, Google

A **race condition** occurs when the correctness of a program depends on the *timing/interleaving* of concurrent threads accessing shared data — e.g., two threads doing `balance += 100` can lose an update because `read-modify-write` isn't atomic.

**Prevention:**
- **Mutual exclusion** — locks/mutexes around the critical section.
- **Atomic operations** — hardware `compare-and-swap`, atomic integers.
- **Avoid shared mutable state** — immutability, thread-local storage, message passing.
- **Synchronization primitives** — semaphores, monitors.

**Trade-off:** locking prevents races but risks deadlock, reduces concurrency, and adds overhead → use fine-grained or lock-free structures where possible.

**Follow-ups:**
- What is atomicity? Why is `i++` not atomic?
- What is a lock-free data structure?
- How does compare-and-swap (CAS) work?

---

### Q41. Explain IPC (Inter-Process Communication) mechanisms. 🟡
**Asked at:** Amazon, Microsoft, Cisco

Since processes have separate address spaces, they need explicit mechanisms to communicate:
- **Pipes** — unidirectional byte stream between related processes; **named pipes (FIFOs)** for unrelated ones.
- **Shared memory** — fastest; a region mapped into multiple processes' address spaces; needs synchronization.
- **Message queues** — structured messages, kernel-managed.
- **Sockets** — communication across machines (or locally); the basis of networking.
- **Signals** — asynchronous notifications (e.g., SIGKILL).

**Shared memory is fastest** (no kernel copy per message) but requires the most care (synchronization). Message passing is safer but slower.

**Follow-ups:**
- Why is shared memory faster than message passing?
- How do you synchronize access to shared memory?

---

### Q42. What happens when you run a program / what's the memory layout of a process? 🟡
**Asked at:** Amazon, Microsoft, Nvidia

A process's virtual address space (low → high):
- **Text/Code segment** — the compiled instructions (read-only).
- **Data segment** — initialized globals/statics.
- **BSS** — uninitialized globals/statics (zero-initialized).
- **Heap** — dynamically allocated memory (`malloc`/`new`); grows upward.
- **Stack** — function call frames, local variables; grows downward. Overflow → stack overflow.

**"What happens when you run `./a.out`":** shell forks a child → `exec` loads the binary → OS sets up the address space, loads code/data, initializes the stack → dynamic linker resolves shared libraries → jumps to `main`. (A variant: "what happens when you type a URL" — see Q45.)

**Stack vs heap:** stack is fast, auto-managed, LIFO, limited size; heap is flexible, manually managed, larger, slower, can fragment.

**Follow-ups:**
- Stack vs heap allocation trade-offs?
- What causes a memory leak / segmentation fault?
- What does fork() do vs exec()?

---

### Q43. What is a system call, and user mode vs kernel mode? 🟢
**Asked at:** Amazon, Microsoft

A **system call** is the controlled interface for a user program to request privileged OS services (file I/O, process creation, networking) — e.g., `read()`, `write()`, `fork()`.

**Two modes:** **user mode** (restricted — app code can't touch hardware directly) and **kernel mode** (full privileges). A system call triggers a **mode switch** (trap) into kernel mode; the kernel executes the request and returns. This protects the system from buggy/malicious user code.

**Why the separation:** isolation and security — a crashing app can't take down the OS or other processes.

**Follow-ups:**
- Why is a mode switch expensive?
- Give examples of system calls.
- How is a system call different from a normal function call?

---

### Q44. Explain concurrency vs parallelism. 🟢
**Asked at:** Amazon, Microsoft, Google

- **Concurrency** — dealing with many tasks at once by *interleaving* them (making progress on multiple tasks over time); possible even on a single core via context switching. It's about *structure*.
- **Parallelism** — literally executing multiple tasks *simultaneously* on multiple cores/CPUs. It's about *execution*.

**Analogy:** concurrency = one barista juggling several orders by switching between them; parallelism = several baristas each making a drink at the same time.

A program can be concurrent without being parallel (single core, time-sliced) and parallel implies hardware with multiple execution units.

**Follow-ups:**
- Can you have concurrency on a single core? (yes)
- What limits parallel speedup? (Amdahl's law — the serial fraction)
- How do threads relate to cores?

---

## 5. Computer Networks

> Common at Amazon, Cisco, Microsoft, and for backend/cloud roles. Master the "type a URL" walkthrough, TCP vs UDP, HTTP/HTTPS, DNS, and REST vs GraphQL.

---

### Q45. What happens when you type a URL and press Enter? 🟢
**Asked at:** Amazon, Google, Microsoft, Flipkart (the *most* classic networks question)

An end-to-end walkthrough that touches DNS, TCP, TLS, HTTP, and rendering:

1. **URL parsing** — browser extracts protocol, domain, path.
2. **DNS resolution** — resolve domain → IP: check browser cache → OS cache → router → ISP resolver → recursive lookup (root → TLD → authoritative). Returns the IP.
3. **TCP connection** — 3-way handshake (SYN → SYN-ACK → ACK) to the server IP:port.
4. **TLS handshake** (for HTTPS) — negotiate cipher, exchange certificate, establish a symmetric session key.
5. **HTTP request** — browser sends `GET /path` with headers.
6. **Server processing** — load balancer → app server → DB/cache → generates response.
7. **HTTP response** — HTML returned (often via CDN for static assets).
8. **Rendering** — browser parses HTML → builds DOM → fetches CSS/JS/images → paints; JS may make further API calls.

**Interview tip:** the interviewer probes wherever you sound shallow — be ready to deep-dive DNS, the TCP handshake, or TLS.

**Follow-ups:**
- Walk me through the TLS handshake in detail.
- What is DNS caching and TTL?
- How does the CDN fit in?

---

### Q46. TCP vs UDP — differences and when to use each. 🟢
**Asked at:** Amazon, Cisco, Microsoft

| | TCP | UDP |
|---|---|---|
| Connection | Connection-oriented (handshake) | Connectionless |
| Reliability | Guaranteed, ordered, retransmits | Best-effort, no guarantees |
| Speed/overhead | Slower, more overhead | Fast, lightweight |
| Flow/congestion control | Yes | No |
| Use cases | Web (HTTP), email, file transfer | Video/voice streaming, gaming, DNS |

**TCP** guarantees delivery and order via sequence numbers, ACKs, and retransmission — use when correctness matters. **UDP** trades reliability for speed — use when low latency beats perfect delivery (a dropped video frame is fine; a stalled stream isn't). **QUIC/HTTP3** runs over UDP to get TCP-like reliability with lower latency.

**Follow-ups:**
- How does TCP ensure reliable, ordered delivery?
- Why does DNS use UDP (mostly)?
- What is head-of-line blocking and how does HTTP/3 fix it?

---

### Q47. Explain HTTP vs HTTPS and how TLS works. 🟢
**Asked at:** Amazon, Microsoft, Paytm

**HTTP** is a stateless application-layer protocol for client-server communication (plaintext). **HTTPS** is HTTP over **TLS**, adding encryption, integrity, and authentication.

**TLS handshake (simplified):**
1. Client sends supported ciphers ("ClientHello").
2. Server responds with its choice + **digital certificate** (contains its public key, signed by a CA).
3. Client verifies the cert against trusted CAs.
4. They establish a **shared symmetric session key** (via asymmetric crypto / key exchange like ECDHE).
5. All further data is encrypted with the fast symmetric key.

**Why hybrid:** asymmetric crypto is secure but slow → used only to exchange the symmetric key; symmetric crypto is fast → used for the actual data. HTTPS prevents eavesdropping and man-in-the-middle attacks.

**Follow-ups:**
- Symmetric vs asymmetric encryption — where each is used?
- What does a CA (Certificate Authority) do?
- What's the difference between HTTP/1.1, HTTP/2, and HTTP/3?

---

### Q48. What are the HTTP methods and status codes? 🟢
**Asked at:** All companies (REST API roles)

**Methods:** `GET` (read, safe & idempotent), `POST` (create, not idempotent), `PUT` (replace, idempotent), `PATCH` (partial update), `DELETE` (idempotent). **Idempotent** = repeating the request has the same effect as doing it once.

**Status code families:**
- **2xx** success — 200 OK, 201 Created, 204 No Content.
- **3xx** redirection — 301 (permanent), 302 (temporary), 304 Not Modified (cache).
- **4xx** client error — 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests.
- **5xx** server error — 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout.

**Follow-ups:**
- Why is PUT idempotent but POST is not?
- 401 vs 403 — the difference? (authentication vs authorization)
- When would you return 429?

---

### Q49. REST vs GraphQL vs gRPC — trade-offs. 🟡
**Asked at:** Flipkart, Uber, Razorpay, Atlassian

- **REST** — resource-based, uses HTTP verbs, stateless, cacheable. Simple and ubiquitous, but suffers **over-fetching** (getting more data than needed) and **under-fetching** (needing multiple round trips).
- **GraphQL** — a query language; the client asks for *exactly* the fields it needs from a single endpoint. Solves over/under-fetching; great for varied clients (mobile vs web). Costs: caching is harder, server complexity, risk of expensive nested queries.
- **gRPC** — RPC over HTTP/2 with Protocol Buffers (binary). Very fast, strongly typed, supports streaming; ideal for **internal service-to-service** communication. Less browser-friendly.

**Rule of thumb:** REST for public/simple APIs, GraphQL for complex client-driven data needs, gRPC for high-performance internal microservices.

**Follow-ups:**
- How does GraphQL solve over-fetching?
- Why is caching harder in GraphQL?
- Why gRPC for internal services? (perf, typing, streaming)

---

### Q50. How does DNS work? 🟢
**Asked at:** Amazon, Cisco, Cloudflare-style

**DNS** translates human-readable domains → IP addresses. Resolution is hierarchical:
```
Browser cache → OS cache → Recursive resolver (ISP) →
Root nameserver → TLD nameserver (.com) → Authoritative nameserver → IP
```
- **Recursive resolver** does the legwork and caches results (TTL-bound).
- **Record types:** A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS (nameserver), TXT.
- **Caching + TTL** make it fast and reduce load; TTL controls staleness.
- DNS also enables **load balancing** (returning different IPs) and **CDN routing** (geo-based).

**Follow-ups:**
- What is DNS caching and TTL trade-off?
- How does DNS support load balancing / CDNs?
- Recursive vs iterative queries?

---

### Q51. What is a CDN and why use one? 🟢
**Asked at:** Amazon, Flipkart, Hotstar/JioCinema-style

A **Content Delivery Network** is a geographically distributed network of edge servers that cache content close to users, reducing latency and origin load.

**Benefits:** lower latency (serve from the nearest edge), reduced origin bandwidth/cost, higher availability, DDoS protection, and TLS termination at the edge.

**What to cache:** static assets (images, CSS, JS, videos) — and increasingly dynamic content via edge compute. Cache invalidation and TTLs are the main operational concern.

**Push vs pull CDN:** pull (CDN fetches from origin on first miss — common) vs push (you upload content to the CDN proactively — for large/predictable files).

**Follow-ups:**
- How does the CDN know which edge is nearest? (anycast, geo-DNS)
- How do you invalidate stale CDN content?
- What is edge computing?

---

### Q52. Explain WebSockets vs HTTP polling for real-time communication. 🟡
**Asked at:** Uber, Swiggy, real-time app startups

**HTTP is request-response** — the server can't push. For real-time features (chat, live location, notifications):
- **Short polling** — client repeatedly asks "any updates?" → wasteful, laggy.
- **Long polling** — server holds the request open until it has data → better, still overhead per message.
- **Server-Sent Events (SSE)** — one-way server→client stream over HTTP; simple, great for feeds/token streaming.
- **WebSockets** — a persistent, **full-duplex** TCP connection after an HTTP upgrade handshake; both sides push anytime. Ideal for chat, multiplayer, live dashboards, trading.

**Trade-off:** WebSockets add stateful-connection management (scaling many open connections needs sticky routing / a pub-sub backplane like Redis).

**Follow-ups:**
- How do you scale millions of WebSocket connections?
- SSE vs WebSocket — when each?
- How does the WebSocket upgrade handshake work?

---

### Q53. Explain the OSI and TCP/IP models. 🟢
**Asked at:** Cisco, Amazon, Microsoft

**OSI (7 layers)** — a conceptual model: Physical, Data Link, Network, Transport, Session, Presentation, Application. **TCP/IP (4 layers)** — the practical model: Link, Internet (IP), Transport (TCP/UDP), Application (HTTP/DNS).

**Where things live:** switches/MAC (Data Link/L2), routers/IP (Network/L3), TCP/UDP ports (Transport/L4), HTTP (Application/L7). Load balancers operate at L4 or L7 (*see Q4*).

**Encapsulation:** each layer wraps the data with its own header as it goes down the stack, and unwraps on the way up.

**Follow-ups:**
- What's the difference between a router, switch, and hub?
- MAC address vs IP address — why both?
- Which layer does a firewall operate at?

---

### Q54. How do you secure a web application / API? 🟡
**Asked at:** Amazon, Paytm, Razorpay, security-conscious startups

Layered defenses:
- **Authentication** — verify identity (sessions, JWT, OAuth 2.0). **Authorization** — verify permissions (RBAC).
- **Transport security** — HTTPS/TLS everywhere.
- **Input validation** — prevent **SQL injection** (parameterized queries), **XSS** (escape output, CSP), **CSRF** (tokens).
- **Rate limiting & throttling** — prevent abuse/brute force (*see Q6*).
- **Secrets management** — never hardcode; use vaults; hash passwords with **bcrypt/argon2 + salt**.
- **Principle of least privilege**, security headers, dependency scanning, and audit logging.

**JWT vs session:** JWT is stateless (self-contained, scales well, but hard to revoke); sessions are stateful (server stores state, easy to revoke, needs a shared store).

**Follow-ups:**
- How do you prevent SQL injection? XSS? CSRF?
- JWT vs session-based auth trade-offs?
- How do you store passwords securely? (never plaintext — salted hash)

---

## 6. Database Systems

> One of the highest-weight core subjects. Nail SQL vs NoSQL, indexing, normalization, transactions/ACID, CAP theorem, sharding, and replication.

---

### Q55. SQL vs NoSQL — how do you choose? 🟢
**Asked at:** Amazon, Flipkart, Microsoft, Swiggy

| | SQL (Relational) | NoSQL |
|---|---|---|
| Schema | Fixed, structured | Flexible/schema-less |
| Scaling | Vertical (mostly); harder horizontal | Horizontal (built for it) |
| Consistency | Strong (ACID) | Often eventual (BASE) |
| Relationships | Joins, foreign keys | Denormalized, embedded |
| Examples | PostgreSQL, MySQL | MongoDB (doc), Cassandra (wide-col), Redis (KV), Neo4j (graph) |

**Choose SQL when:** you need strong consistency, complex queries/joins, transactions (payments, banking), and a well-defined schema. **Choose NoSQL when:** you need massive horizontal scale, flexible/evolving schema, high write throughput, or a specific data shape (documents, key-value, graph, time-series).

**NoSQL types:** key-value (Redis, DynamoDB), document (MongoDB), wide-column (Cassandra), graph (Neo4j).

**Reality:** large systems use **both** (polyglot persistence) — SQL for transactional core, NoSQL for scale-out features.

**Follow-ups:**
- When would you *not* use NoSQL?
- Which NoSQL type for a social graph? (graph DB)
- How does DynamoDB scale horizontally?

---

### Q56. Explain ACID properties and database transactions. 🟢
**Asked at:** Amazon, Flipkart, PhonePe, banking-tech

A **transaction** is a unit of work that must execute completely or not at all. **ACID** guarantees:
- **Atomicity** — all-or-nothing; partial failure rolls back.
- **Consistency** — moves the DB from one valid state to another (constraints honored).
- **Isolation** — concurrent transactions don't interfere; result is as if serial.
- **Durability** — once committed, survives crashes (persisted to disk / WAL).

**Isolation levels (weaker → stronger):** Read Uncommitted → Read Committed → Repeatable Read → Serializable. Weaker levels allow anomalies: **dirty read**, **non-repeatable read**, **phantom read**. Stronger isolation = more correctness, less concurrency.

**Follow-ups:**
- What anomaly does each isolation level prevent?
- How is atomicity implemented? (write-ahead log, undo/redo)
- Optimistic vs pessimistic locking?

---

### Q57. Explain the CAP theorem and its practical implications. 🟡
**Asked at:** Amazon, Flipkart, Uber, distributed-systems roles

**CAP:** in a distributed system you can guarantee at most **two** of **Consistency** (every read sees the latest write), **Availability** (every request gets a response), and **Partition tolerance** (works despite network splits).

**The practical truth:** network partitions *will* happen, so **P is non-negotiable** — you're really choosing **C vs A during a partition**:
- **CP systems** (e.g., HBase, MongoDB default, ZooKeeper) — sacrifice availability to stay consistent (reject/block during partition). Choose for correctness-critical data (payments, inventory).
- **AP systems** (e.g., Cassandra, DynamoDB) — stay available but may return stale data (eventual consistency). Choose for high availability (feeds, likes, carts).

**PACELC extension:** even without a partition (Else), you trade **Latency vs Consistency**.

**ACID vs BASE:** BASE = **B**asically **A**vailable, **S**oft state, **E**ventual consistency — the NoSQL philosophy favoring availability over immediate consistency.

**Follow-ups:**
- Give a real example of a CP vs AP choice.
- What is eventual consistency and when is it acceptable?
- Explain PACELC.

---

### Q58. What is database indexing and how does it work? 🟡
**Asked at:** Amazon, Flipkart, Microsoft

An **index** is a data structure that speeds up reads by avoiding full-table scans — like a book's index. Most use a **B+ Tree** (balanced, sorted, supports range queries, O(log n) lookup); some use **hash indexes** (O(1) exact match, no ranges).

**Trade-offs:** indexes speed up **reads** but slow down **writes** (index must be updated on insert/update/delete) and consume storage. Index selectively — on columns used in `WHERE`, `JOIN`, `ORDER BY`.

**Types:** **clustered** (defines physical row order — one per table, usually the primary key) vs **non-clustered** (separate structure pointing to rows). **Composite index** — on multiple columns (order matters — leftmost prefix rule). **Covering index** — includes all queried columns so the table isn't touched.

**Follow-ups:**
- Why B+ Tree over a hash index for range queries?
- Why not index every column?
- What is the leftmost-prefix rule for composite indexes?

---

### Q59. Explain normalization and denormalization. 🟡
**Asked at:** Amazon, Flipkart, Microsoft

**Normalization** organizes data to eliminate redundancy and anomalies by splitting into related tables:
- **1NF** — atomic values, no repeating groups.
- **2NF** — 1NF + no partial dependency on part of a composite key.
- **3NF** — 2NF + no transitive dependencies (non-key → non-key).
- **BCNF** — stricter 3NF.

**Pros:** less redundancy, data integrity, smaller storage. **Cons:** more joins → slower reads.

**Denormalization** deliberately adds redundancy (duplicated/precomputed data) to speed up reads by avoiding joins — common in analytics and read-heavy NoSQL systems. **Trade-off:** faster reads vs update complexity and consistency risk.

**Follow-ups:**
- When would you denormalize?
- Give an example of an update anomaly.
- How does this relate to SQL vs NoSQL data modeling?

---

### Q60. What are sharding and partitioning? 🔴
**Asked at:** Amazon, Flipkart, Uber, PhonePe

**Partitioning** splits a large table into smaller pieces; **sharding** is horizontal partitioning across *multiple machines* to scale beyond one server.

**Sharding strategies:**
- **Range-based** — partition by key ranges (e.g., A–M, N–Z). Good for range queries; risks hotspots.
- **Hash-based** — `hash(key) % N`. Even distribution; range queries scatter across shards; resharding is painful (fixed by **consistent hashing** — *see Q78*).
- **Directory/lookup-based** — a lookup service maps keys → shards; flexible but adds a lookup hop.
- **Geo-based** — by user region (latency + compliance).

**Challenges:** choosing a good **shard key** (avoid hotspots), cross-shard joins/transactions (expensive), rebalancing, and a "celebrity" hot partition.

**Vertical partitioning** — split *columns* (frequently vs rarely accessed) into separate tables.

**Follow-ups:**
- How do you pick a shard key?
- What is a hot partition and how do you avoid it?
- How do you do a JOIN across shards?

---

### Q61. What is replication, and leader-follower vs multi-leader? 🟡
**Asked at:** Amazon, Flipkart, MongoDB-style

**Replication** keeps copies of data on multiple nodes for **availability**, **fault tolerance**, and **read scaling**.

- **Leader-Follower (master-slave):** writes go to the leader, replicated to followers; reads can be served by followers. Simple, consistent writes; the leader is a write bottleneck & SPOF (needs failover).
- **Multi-Leader:** multiple nodes accept writes (e.g., multi-region). Better write availability but **conflict resolution** is needed (last-write-wins, CRDTs).
- **Leaderless (Dynamo/Cassandra):** any node accepts reads/writes; uses **quorum** (W + R > N ensures overlap for consistency).

**Sync vs async replication:** synchronous = consistent but slow / blocks on a slow replica; asynchronous = fast but risks data loss on leader failure (replication lag → stale reads).

**Follow-ups:**
- What is replication lag and how do you handle stale reads?
- Explain quorum (W + R > N).
- How does leader failover work?

---

### Q62. Write and optimize a SQL query (joins, group by, window functions). 🟡
**Asked at:** Amazon, Flipkart, Paytm, data roles

**Know:** `INNER/LEFT/RIGHT/FULL JOIN`, `GROUP BY` + `HAVING`, subqueries vs CTEs, and **window functions** (`ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, running totals with `OVER(...)`).

**Example — 2nd highest salary:**
```sql
SELECT MAX(salary) FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);
-- or, generalized to Nth highest:
SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET N-1;
-- or with a window function:
SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) rnk FROM Employee
) t WHERE rnk = 2;
```

**Optimization:** add indexes on filtered/joined columns, avoid `SELECT *`, use `EXPLAIN` to read the query plan, avoid functions on indexed columns in `WHERE` (breaks index use), and prefer joins over correlated subqueries where possible.

**Follow-ups:**
- Nth highest salary / employees earning more than their manager / top-N per group.
- `WHERE` vs `HAVING` — the difference?
- How do you read an EXPLAIN plan?

---

### Q63. What is a deadlock in a database and how is it handled? 🟡
**Asked at:** Amazon, Flipkart, banking-tech

Two transactions each hold a lock the other needs → neither proceeds (same Coffman conditions as OS deadlock — *see Q38*). Databases handle it via **detection** (build a wait-for graph; if there's a cycle, **abort and roll back** the "victim" transaction — the cheaper one) and **timeouts**.

**Prevention in app design:** acquire locks in a consistent order, keep transactions short, use lower isolation where safe, and use optimistic locking for low-contention workloads.

**Follow-ups:**
- Optimistic vs pessimistic locking?
- How does the DB pick the deadlock victim?
- How do you minimize lock contention?

---

### Q64. Design the database schema for a real system (e.g., an e-commerce order system). 🟡
**Asked at:** Flipkart, Amazon, Meesho

**Core entities:** `Users`, `Products`, `Inventory`, `Orders`, `OrderItems`, `Payments`, `Addresses`. Model relationships with foreign keys:
```
Users (1) ── (N) Orders (1) ── (N) OrderItems (N) ── (1) Products
Orders (1) ── (1) Payments
```
**Design decisions to raise:** where to keep the price (snapshot the price into `OrderItems` at purchase time — products change price); how to handle inventory concurrency (row locks / atomic decrement to prevent overselling); soft-delete vs hard-delete; and separating the transactional store (SQL) from search (Elasticsearch) and cart (Redis).

**Follow-ups:**
- How do you prevent overselling under concurrent orders?
- Why snapshot the price into the order?
- How would you add order status history?

---

### Q65. SQL vs NoSQL for a specific scenario — justify your choice. 🟡
**Asked at:** Amazon, Flipkart, startups

Interviewers give a scenario and want a *justified* choice:
- **Banking/payments** → SQL (ACID, strong consistency, transactions).
- **Product catalog with varying attributes** → NoSQL document (flexible schema).
- **Chat messages / activity feed at massive scale** → wide-column (Cassandra) for write throughput.
- **Leaderboard / session cache / rate limiting** → Redis (in-memory, sorted sets).
- **Social/recommendation graph** → graph DB (Neo4j).
- **Analytics / time-series** → columnar / time-series DB.

**Framework:** consider consistency needs, query patterns, scale, and data shape — then justify. Mentioning **polyglot persistence** (right tool per job) signals maturity.

**Follow-ups:**
- Why not use SQL for everything?
- What consistency does a shopping cart need?
- Trade-offs of adding a second datastore?

---

## 7. Object-Oriented Design (LLD)

> Low-Level Design rounds test OOP fundamentals, SOLID, design patterns, and class modeling of real systems. Approach: clarify requirements → identify entities/classes → define relationships → apply patterns → show extensibility.

---

### Q66. Explain the four pillars of OOP with real examples. 🟢
**Asked at:** Amazon, Microsoft, Flipkart, TCS Digital

1. **Encapsulation** — bundle data + methods, hide internals behind an interface (private fields + getters/setters). Protects invariants.
2. **Abstraction** — expose *what* an object does, hide *how* (interfaces/abstract classes). A `List` interface hides array vs linked-list internals.
3. **Inheritance** — a subclass reuses/extends a superclass ("is-a"). `Car extends Vehicle`.
4. **Polymorphism** — one interface, many implementations. **Compile-time** (method overloading) and **runtime** (method overriding / dynamic dispatch via vtables).

**Encapsulation vs abstraction:** encapsulation hides *data*; abstraction hides *complexity/implementation*.

**Follow-ups:**
- Overloading vs overriding?
- Composition vs inheritance — which to prefer and why? ("favor composition")
- How is runtime polymorphism implemented? (vtable / dynamic dispatch)

---

### Q67. Explain the SOLID principles. 🟡
**Asked at:** Amazon, Microsoft, Atlassian, product companies

Five principles for maintainable OO design:
- **S — Single Responsibility:** a class should have one reason to change (one job).
- **O — Open/Closed:** open for extension, closed for modification (add behavior via new subclasses/strategies, not by editing existing code).
- **L — Liskov Substitution:** subtypes must be usable wherever the base type is expected without breaking behavior.
- **I — Interface Segregation:** many small, specific interfaces beat one fat interface (don't force clients to depend on methods they don't use).
- **D — Dependency Inversion:** depend on abstractions, not concretions (inject dependencies via interfaces).

**Why it matters:** SOLID reduces coupling, increases cohesion, and makes systems testable and extensible — exactly what LLD interviews reward.

**Follow-ups:**
- Give a code example violating and then fixing SRP or OCP.
- How does Dependency Inversion enable unit testing? (mock the interface)
- Which principle does the Strategy pattern embody?

---

### Q68. What design patterns do you know? Explain a few. 🟡
**Asked at:** Amazon, Microsoft, Flipkart

**Creational** — object creation: **Singleton** (one instance — logger, config; watch thread-safety), **Factory** (create objects without exposing instantiation logic), **Builder** (construct complex objects step-by-step — e.g., a request with many optional fields).

**Structural** — composition: **Adapter** (bridge incompatible interfaces), **Decorator** (add behavior dynamically — e.g., add-ons on coffee), **Proxy** (control access — lazy loading, caching), **Facade** (simplified interface to a subsystem).

**Behavioral** — interaction: **Observer** (pub-sub; notify subscribers on state change — event systems), **Strategy** (interchangeable algorithms — e.g., payment methods), **State** (behavior changes with internal state), **Command** (encapsulate a request as an object — undo/redo).

**Tip:** don't force patterns — mention them where they naturally solve the design's extensibility need.

**Follow-ups:**
- Implement a thread-safe Singleton.
- Strategy vs State — the difference?
- Where would Observer fit in a notification system?

---

### Q69. Design a parking lot system (LLD). 🟡
**Asked at:** Amazon, Microsoft, Flipkart, Google (a *classic* LLD)

**Clarify:** multiple floors; vehicle types (motorcycle/car/truck) → slot sizes; entry/exit; ticketing; pricing.

**Classes & relationships:**
```
ParkingLot ── has ── Floors ── has ── ParkingSpots (Small/Medium/Large)
Vehicle (abstract) → Motorcycle, Car, Truck
Ticket (entry time, spot, vehicle)
ParkingSpot (isAvailable, canFit(vehicle))
PaymentStrategy (Hourly, Flat) ← Strategy pattern
EntryGate / ExitGate, SpotAssignmentStrategy (NearestFirst) ← Strategy
```
**Design choices to raise:** use **Strategy** for spot-assignment and pricing (extensible); **Factory** for vehicle/spot creation; handle **concurrency** (two cars, one spot → atomic reservation/locking); **enum** for spot types and payment status.

**Extensibility (interviewers push here):** EV charging spots, reserved/handicapped spots, dynamic pricing, multiple entry gates.

**Follow-ups:**
- How do you assign the nearest available spot efficiently?
- How do you handle concurrent parking at the same spot?
- How would you support monthly passes / reservations?

---

### Q70. Design an elevator system (LLD). 🔴
**Asked at:** Amazon, Uber, Microsoft

**Clarify:** number of elevators; floors; up/down requests; scheduling goal (minimize wait time).

**Classes:**
```
ElevatorSystem ── manages ── Elevator[]
Elevator (currentFloor, direction, state, requestQueue)
Request (sourceFloor, destinationFloor, direction)
SchedulingStrategy ← Strategy (e.g., SCAN/LOOK "elevator algorithm")
Button (Internal/External), Display
State: MOVING_UP, MOVING_DOWN, IDLE, MAINTENANCE ← State pattern
```
**The core problem is scheduling:** assign a request to the best elevator. The **SCAN/LOOK algorithm** (serve requests in the current direction, then reverse) minimizes total movement — same idea as disk scheduling. Use the **State pattern** for elevator states and **Strategy** for the dispatch algorithm.

**Follow-ups:**
- How do you decide which elevator serves a request?
- How do you optimize for average wait time vs throughput?
- Handle an elevator going into maintenance mid-trip.

---

### Q71. Design a distributed rate limiter (LLD focus). 🟡
**Asked at:** Amazon, Stripe, Razorpay

(Algorithm-level covered in Q6.) At the **class level**:
```
RateLimiter (interface) → TokenBucketLimiter, SlidingWindowLimiter  ← Strategy
RateLimiterFactory → returns the configured limiter
Storage (interface) → InMemoryStore, RedisStore                     ← for distributed state
RateLimitRule (limit, window, key extractor)
```
**Design principles applied:** **Strategy** so the algorithm is swappable; **Dependency Inversion** so storage (local vs Redis) is injectable and testable; return `429` with `Retry-After`. For distributed correctness, use Redis atomic ops / Lua so counters are consistent across servers.

**Follow-ups:**
- How do you make it thread-safe?
- How do you swap algorithms without changing client code? (Strategy)
- Local counter + async global sync — trade-offs?

---

### Q72. Design a library management / BookMyShow-style booking system. 🟡
**Asked at:** Amazon, Flipkart, BookMyShow

**Entities (movie booking):** `User`, `Movie`, `Cinema`, `Screen`, `Show`, `Seat`, `Booking`, `Payment`.
```
Cinema ── has ── Screens ── has ── Seats
Show (movie, screen, time) ── has ── SeatAvailability
Booking (user, show, seats, status) ── has ── Payment
```
**Hard part — seat locking under concurrency:** when a user selects seats, **temporarily lock** them (with a timeout, e.g., 5 min) so two users can't book the same seat; confirm on payment, release on timeout. Use a distributed lock (Redis) or DB row locking + status enum (`AVAILABLE → LOCKED → BOOKED`).

**Patterns:** State (booking lifecycle), Strategy (payment/pricing), Observer (notify on booking confirmation).

**Follow-ups:**
- How do you prevent double-booking of a seat?
- How does the temporary lock expire?
- How would you scale to many concurrent users for a popular show?

---

### Q73. Design a Splitwise-style expense-sharing system (LLD). 🟡
**Asked at:** Amazon, Flipkart, fintech startups

**Entities:** `User`, `Group`, `Expense`, `Split` (Equal/Exact/Percentage — **Strategy pattern**), `Balance`.
```
Expense (paidBy, amount, splitType, participants)
SplitStrategy ← EqualSplit, PercentSplit, ExactSplit
BalanceSheet: who owes whom (a graph of debts)
```
**Core logic:** maintain a **balance map** (`user → {other_user → amount}`); each expense updates balances. A nice follow-up is **debt simplification** — minimize the number of transactions to settle up (a min-cash-flow / greedy heap problem).

**Follow-ups:**
- Implement the "simplify debts" algorithm.
- How do you handle different split types cleanly? (Strategy)
- How do you keep balances consistent under concurrent expenses?

---

### Q74. Design a Snake and Ladder / Chess game (LLD). 🟡
**Asked at:** Amazon, Microsoft

Demonstrates clean class modeling and patterns:
```
Game ── has ── Board, Players[], Dice
Board ── has ── Cells (with snakes/ladders as jump entities)
Player (position), Dice (roll)
GameState / turn management ← State pattern
```
**For chess:** `Piece` (abstract) → King/Queen/Knight… each overriding `canMove()` (**polymorphism**); `Board`, `Move`, `MoveValidator`, `Game`. Emphasize open/closed — adding a piece type shouldn't touch existing code.

**Follow-ups:**
- How do you model piece movement extensibly? (polymorphism per piece)
- How do you validate a move / detect check?
- How do you support undo? (Command pattern)

---

### Q75. Composition vs inheritance, and when to use interfaces vs abstract classes. 🟢
**Asked at:** Amazon, Microsoft

**"Favor composition over inheritance":** inheritance creates tight coupling and fragile hierarchies (changes to the base ripple down; deep hierarchies are rigid). Composition ("has-a") is more flexible — build behavior by combining objects (Strategy, Decorator rely on this).

**Interface vs abstract class:** use an **interface** to define a contract multiple unrelated classes implement (a capability, e.g., `Comparable`); use an **abstract class** to share common code/state among closely related classes with an "is-a" relationship. A class implements many interfaces but extends one abstract class.

**Follow-ups:**
- Give an example where composition beats inheritance.
- Can you achieve multiple inheritance in Java? (via interfaces / default methods)
- When would you use an abstract class over an interface?

---

## 8. Distributed Systems

> Deeper system-design territory: consensus, distributed transactions, message queues, and event-driven architecture. Common at Amazon, Uber, and infra-heavy startups.

---

### Q76. What are the fundamental challenges of distributed systems? 🟡
**Asked at:** Amazon, Uber, Google

Distributed systems trade single-machine simplicity for scale and fault tolerance, introducing hard problems:
- **Partial failure** — some nodes fail while others run; you can't always tell "crashed" from "slow."
- **Network unreliability** — messages get lost, delayed, duplicated, reordered.
- **No global clock** — clocks drift; ordering events across machines is hard (→ logical clocks, vector clocks).
- **Consistency vs availability** — CAP (*see Q57*).
- **Consensus** — getting nodes to agree despite failures.

**The "fallacies of distributed computing":** assuming the network is reliable, latency is zero, bandwidth is infinite, topology is static — all false. Great answers acknowledge these explicitly.

**Follow-ups:**
- How do you order events without a global clock? (Lamport/vector clocks)
- Why can't you distinguish a slow node from a dead one?
- What is idempotency and why does it matter here?

---

### Q77. Explain consensus and the Raft / Paxos algorithm (at a high level). 🔴
**Asked at:** Amazon, Google, infra companies

**Consensus:** getting a group of nodes to agree on a single value/state despite failures — the backbone of replicated logs, leader election, and distributed config (ZooKeeper, etcd).

**Raft (the interviewable one — designed for understandability):**
- Nodes are **Leader**, **Follower**, or **Candidate**.
- **Leader election:** if a follower hears no heartbeat, it becomes a candidate and requests votes; a majority elects it. Terms prevent split-brain.
- **Log replication:** clients send commands to the leader, which appends them and replicates to followers; an entry is **committed** once a majority acknowledges.
- **Safety via majority quorum** — needs (N/2 + 1) nodes, tolerating ⌊(N−1)/2⌋ failures.

**Paxos** solves the same problem but is notoriously hard to understand; Raft was created as a clearer alternative.

**Follow-ups:**
- How does Raft prevent two leaders (split-brain)?
- Why do you need an odd number of nodes?
- What is a quorum?

---

### Q78. What is consistent hashing and why is it important? 🔴
**Asked at:** Amazon, Uber, Discord-style

**Problem:** with `hash(key) % N`, adding/removing a server changes N → **almost every key remaps** → massive cache misses / data movement.

**Consistent hashing:** map both servers and keys onto a **hash ring** (0 to 2³²). A key belongs to the first server clockwise. Adding/removing a node only remaps the keys between it and its neighbor → **only ~1/N keys move**, not all.

**Virtual nodes:** each physical server maps to many points on the ring → even load distribution and smoother rebalancing (avoids one node getting a huge arc).

**Where used:** distributed caches (Memcached clusters), databases (Cassandra, DynamoDB), load balancers, sharding.

**Follow-ups:**
- How do virtual nodes fix uneven distribution?
- What happens to data when a node is added/removed?
- How does Cassandra use it?

---

### Q79. What is a message queue and why use one? 🟡
**Asked at:** Amazon, Flipkart, Swiggy, Uber

A **message queue** decouples producers from consumers via an intermediary buffer, enabling **asynchronous** processing.

**Benefits:** **decoupling** (services don't call each other directly), **buffering** (absorb traffic spikes), **resilience** (messages persist if a consumer is down), **scalability** (add consumers to process faster), and **load leveling**.

**Delivery semantics:** at-most-once, **at-least-once** (common — needs idempotent consumers to handle duplicates), exactly-once (hard/expensive).

**Kafka vs RabbitMQ (classic comparison):** **Kafka** = distributed *log*, high-throughput, retains messages, great for streaming/event sourcing, consumers track their own offset. **RabbitMQ** = traditional broker, flexible routing, good for task queues/RPC. Use Kafka for high-volume event streams; RabbitMQ for complex routing / job queues.

**Follow-ups:**
- How do you handle duplicate messages? (idempotency keys)
- What is a Dead Letter Queue?
- Kafka partitions and consumer groups?

---

### Q80. How do you handle distributed transactions? 🔴
**Asked at:** Amazon, PhonePe, fintech

A transaction spanning multiple services/databases can't use a single ACID transaction. Options:

- **Two-Phase Commit (2PC):** a coordinator asks all participants to *prepare*, then *commit* if all agree. **Strongly consistent** but **blocking** (if the coordinator dies, participants are stuck) and slow → poor availability.
- **Saga pattern (preferred for microservices):** break the transaction into a sequence of local transactions; each has a **compensating action** to undo it if a later step fails. Two flavors: **choreography** (services emit events) and **orchestration** (a central coordinator drives steps). Eventually consistent, non-blocking.

**Example (e-commerce order):** reserve inventory → charge payment → create shipment; if payment fails, run compensation to release inventory.

**Follow-ups:**
- Why is 2PC avoided in high-scale microservices?
- Choreography vs orchestration saga — trade-offs?
- How do you guarantee the compensating action runs?

---

### Q81. Explain event-driven architecture and event sourcing. 🟡
**Asked at:** Amazon, Uber, event-heavy startups

**Event-driven architecture:** services communicate by producing/consuming **events** (e.g., "OrderPlaced") via a broker, rather than direct synchronous calls. Benefits: loose coupling, scalability, resilience, and easy addition of new consumers. Downsides: harder debugging, eventual consistency, and event-schema evolution.

**Event Sourcing:** instead of storing current state, store the **immutable sequence of events** that led to it; rebuild state by replaying events. Gives a full audit log and time-travel, but adds complexity (replays, snapshots).

**CQRS (often paired):** separate the **write model** (commands) from the **read model** (queries/materialized views) so each scales/optimizes independently.

**Follow-ups:**
- Event sourcing vs storing current state — trade-offs?
- What problem does CQRS solve?
- How do you handle event schema changes?

---

### Q82. What is idempotency and why is it critical in distributed systems? 🟡
**Asked at:** Amazon, Stripe, Razorpay, PhonePe

An operation is **idempotent** if performing it multiple times has the same effect as performing it once. Critical because networks retry — a payment request that times out might be retried, and you must not charge twice.

**How to achieve it:** attach a unique **idempotency key** to each request; the server records processed keys and returns the prior result on duplicates. Use natural idempotency where possible (`SET x=5` is idempotent; `x += 5` is not).

**Where it matters:** payments, message-queue consumers (at-least-once delivery → duplicates), retries, webhooks.

**Follow-ups:**
- Design an idempotent payment API.
- How long do you retain idempotency keys?
- How does this interact with at-least-once queues?

---

### Q83. How do you design for scalability — vertical vs horizontal? 🟢
**Asked at:** Amazon, Flipkart, all system-design rounds

- **Vertical scaling (scale up):** bigger machine (more CPU/RAM). Simple, no code changes, but hits a hardware ceiling, is costly, and remains a single point of failure.
- **Horizontal scaling (scale out):** more machines behind a load balancer. Near-limitless scale and fault tolerance, but requires statelessness, data partitioning, and handling distributed-system complexity.

**Key enabler — stateless services:** keep app servers stateless (externalize session/state to Redis/DB) so any server can handle any request → trivial horizontal scaling. Combine with caching, CDNs, DB replication/sharding, and async processing.

**Follow-ups:**
- Why must services be stateless to scale horizontally?
- When is vertical scaling the right first move?
- How do you scale the database tier? (read replicas → sharding)

---

### Q84. How would you design a distributed cache? 🔴
**Asked at:** Amazon, Uber, infra roles

**Goals:** low-latency shared cache across many app servers, scalable, fault-tolerant.

**Design:**
- **Partitioning** via **consistent hashing** (*see Q78*) to distribute keys across cache nodes with minimal remapping on scaling.
- **Replication** of hot keys / partitions for availability and read scaling.
- **Eviction** (LRU) and **TTLs**.
- **Write policy** — write-through vs write-back vs cache-aside (*see Q3*).
- **Client-side routing** or a proxy layer to find the right node.
- Handle **hot keys** (replicate), **cache stampede** (locking/coalescing), and node failure (replicas + rehashing).

Real systems: Redis Cluster, Memcached with consistent hashing.

**Follow-ups:**
- How do you keep cache and DB consistent?
- How do you handle a cache node failure without a cold-cache stampede?
- Redis vs Memcached — differences?

---

### Q85. Explain the difference between strong, eventual, and causal consistency. 🟡
**Asked at:** Amazon, distributed-systems roles

- **Strong consistency** — every read returns the most recent write; behaves like a single copy. Costly (coordination, higher latency). Needed for balances, inventory.
- **Eventual consistency** — replicas converge *eventually* if writes stop; reads may be stale temporarily. High availability, low latency (DNS, social likes, DynamoDB default).
- **Causal consistency** — operations that are causally related are seen in order by everyone (e.g., a reply appears after the message it answers), but unrelated ops may reorder. A useful middle ground.
- **Read-your-writes / monotonic reads** — session guarantees that improve UX under eventual consistency.

**Trade-off:** stronger consistency ↔ higher latency and lower availability (CAP/PACELC).

**Follow-ups:**
- Give a scenario where eventual consistency is acceptable and one where it isn't.
- What is "read-your-own-writes" consistency?
- How does quorum (W+R>N) give tunable consistency?

---

## 9. Cloud Computing & DevOps

> You won't be expected to be a DevOps expert, but 15+ LPA backend roles expect fluency in containers, orchestration, CI/CD, and core cloud services.

---

### Q86. Explain containers vs virtual machines, and what Docker does. 🟢
**Asked at:** Amazon, Microsoft, most backend roles

A **VM** virtualizes hardware — each VM runs a full guest OS on a hypervisor (heavy, slow to boot, strong isolation). A **container** virtualizes the OS — containers share the host kernel, packaging just the app + dependencies (lightweight, seconds to start, less isolation).

**Docker** packages an application and its dependencies into a portable **image** that runs identically anywhere ("works on my machine" solved). Key concepts: **Dockerfile** (build recipe), **image** (immutable template), **container** (running instance), **registry** (image store like Docker Hub), **layers** (cached build steps).

**When VM vs container:** containers for microservices, density, and fast scaling; VMs for stronger isolation or different OS kernels.

**Follow-ups:**
- Why does a container start faster than a VM?
- What is a Docker layer and how does caching work?
- Are containers as secure as VMs? (weaker isolation — shared kernel)

---

### Q87. What is Kubernetes and what problem does it solve? 🟡
**Asked at:** Amazon, Microsoft, cloud-native startups

**Kubernetes (K8s)** is a container **orchestration** platform — it automates deploying, scaling, healing, and networking containers across a cluster of machines. Manually managing hundreds of containers is infeasible; K8s does it declaratively.

**Core concepts:**
- **Pod** — smallest deployable unit (one or more containers sharing network/storage).
- **Deployment** — declares the desired state (e.g., "5 replicas"); K8s reconciles to it.
- **Service** — stable network endpoint + load balancing for a set of pods.
- **ReplicaSet / auto-scaling** — maintains replica count; **HPA** scales on CPU/metrics.
- **Node** (worker machine), **Control plane** (API server, scheduler, etcd).
- **ConfigMap/Secret**, **Ingress** (external routing).

**Self-healing:** if a pod crashes, K8s restarts it; if a node dies, pods reschedule elsewhere.

**Follow-ups:**
- What is a Pod vs a Deployment vs a Service?
- How does auto-scaling work?
- How does K8s do rolling updates and rollbacks?

---

### Q88. Explain CI/CD. 🟢
**Asked at:** Amazon, Flipkart, most companies

- **Continuous Integration (CI):** developers merge code frequently; each merge triggers an automated **build + test** pipeline to catch issues early. Prevents "integration hell."
- **Continuous Delivery/Deployment (CD):** every passing build is automatically prepared for release (delivery) or pushed to production (deployment).

**A typical pipeline:** commit → build → unit tests → static analysis/security scan → build artifact/image → deploy to staging → integration tests → deploy to production (with canary/blue-green).

**Deployment strategies:** **blue-green** (two environments, switch traffic — instant rollback), **canary** (release to a small % first, watch metrics, then ramp), **rolling** (replace instances gradually).

**Follow-ups:**
- Blue-green vs canary — trade-offs?
- How do you roll back a bad deploy?
- What belongs in a CI pipeline?

---

### Q89. What core AWS services should you know? 🟢
**Asked at:** Amazon (naturally), cloud roles

Map services to categories:
- **Compute:** EC2 (VMs), Lambda (serverless functions), ECS/EKS (containers).
- **Storage:** S3 (object storage — the workhorse), EBS (block), EFS (file).
- **Database:** RDS (managed SQL), DynamoDB (managed NoSQL), ElastiCache (Redis/Memcached).
- **Networking:** VPC, Route 53 (DNS), CloudFront (CDN), ELB/ALB (load balancer), API Gateway.
- **Messaging:** SQS (queue), SNS (pub-sub), Kinesis (streaming).
- **DevOps/Monitoring:** CloudWatch (metrics/logs), IAM (access control).

**Interview framing:** be able to map a design to services — "static assets on S3 + CloudFront, app on EC2/ECS behind an ALB, data in RDS with a DynamoDB layer for scale, SQS for async jobs."

**Follow-ups:**
- SQS vs SNS vs Kinesis?
- When Lambda (serverless) vs EC2/ECS?
- What is IAM and least-privilege?

---

### Q90. What is serverless / FaaS, and its trade-offs? 🟡
**Asked at:** Amazon, cloud-native startups

**Serverless (FaaS, e.g., AWS Lambda):** you deploy functions; the provider runs, scales, and bills per-execution — no server management.

**Pros:** no infra management, automatic scaling (including to zero), pay-per-use (cost-efficient for spiky/low traffic), fast to ship.
**Cons:** **cold starts** (latency on first invocation), execution time/memory limits, statelessness (need external state), harder local testing/debugging, vendor lock-in, and cost surprises at very high sustained volume.

**Good fit:** event-driven tasks, cron jobs, webhooks, glue code, unpredictable/bursty workloads. **Poor fit:** long-running, latency-critical, or stateful high-throughput services.

**Follow-ups:**
- What is a cold start and how do you reduce it?
- When would serverless be more expensive than containers?
- How do you manage state in a serverless app?

---

### Q91. What is Infrastructure as Code (IaC)? 🟢
**Asked at:** Cloud/DevOps-leaning roles

**IaC** manages infrastructure through machine-readable definition files (Terraform, CloudFormation) instead of manual clicks. Benefits: **version-controlled**, **reproducible**, **auditable**, and **automatable** infrastructure — spin up identical environments (dev/staging/prod) reliably.

**Declarative (Terraform — describe desired state)** vs **imperative (scripts — describe steps)**; declarative is generally preferred. Pairs naturally with CI/CD.

**Follow-ups:**
- Why is IaC better than manual setup?
- Declarative vs imperative IaC?
- How do you manage secrets in IaC?

---

### Q92. How do you monitor and debug a production system? 🟡
**Asked at:** Amazon, Uber, SRE-leaning roles

**The three pillars of observability:**
- **Metrics** — numeric time-series (latency, error rate, QPS, CPU); dashboards + alerts (Prometheus/CloudWatch/Grafana).
- **Logs** — structured event records; centralized (ELK stack).
- **Traces** — follow a request across services (distributed tracing — Jaeger/OpenTelemetry) to find where latency/errors originate.

**Golden signals (Google SRE):** latency, traffic, errors, saturation. **Debugging flow:** alert fires → check dashboards (which service/metric?) → drill into logs/traces → identify root cause → mitigate (rollback/scale) → postmortem.

**Follow-ups:**
- What are the four golden signals?
- Logs vs metrics vs traces — when each?
- What is an SLA/SLO/SLI?

---

### Q93. Explain the difference between IaaS, PaaS, and SaaS. 🟢
**Asked at:** Cloud roles, general

Cloud service models by how much the provider manages:
- **IaaS** (Infrastructure — EC2, VMs): you manage OS, runtime, app; provider manages hardware/virtualization. Most control.
- **PaaS** (Platform — App Engine, Heroku): provider manages OS + runtime; you deploy code. Faster dev, less control.
- **SaaS** (Software — Gmail, Salesforce): fully managed application; you just use it.

**Analogy (pizza-as-a-service):** IaaS = you get ingredients; PaaS = you get a kitchen; SaaS = pizza delivered.

**Follow-ups:**
- Where does serverless/FaaS fit? (between PaaS and SaaS — "function as a service")
- Trade-offs of control vs convenience?

---

## 10. Behavioral & Scenario-Based

> At 15+ LPA companies (especially Amazon, which weights Leadership Principles heavily), behavioral rounds can be decisive. Use the **STAR** method: **S**ituation → **T**ask → **A**ction → **R**esult. Be specific, quantify impact, and use "I" (your contribution), not "we."

---

### Q94. Tell me about a challenging technical problem you solved. 🟢
**Asked at:** Amazon, Microsoft, Flipkart, all companies

**Structure with STAR:**
- **Situation** — set context briefly (what project, what was at stake).
- **Task** — your specific responsibility and the challenge.
- **Action** — what *you* did: how you diagnosed it, options considered, the decision and reasoning.
- **Result** — the outcome, quantified ("reduced load time 40%", "handled 3× traffic").

**What interviewers assess:** problem-solving approach, ownership, technical depth, and whether you learned from it. Pick a story with real complexity and a measurable result; be ready for "what would you do differently?"

**Follow-ups:**
- What alternatives did you consider and why did you reject them?
- What did you learn / do differently next time?
- How did you measure success?

---

### Q95. Tell me about a time you disagreed with a teammate or manager. 🟡
**Asked at:** Amazon (Have Backbone; Disagree and Commit), Microsoft, Flipkart

Show you can **disagree respectfully with data, then commit** to the final decision even if it isn't yours.
- Describe the disagreement objectively (no blame).
- Explain how you argued your case with **evidence/data**, listened to the other view.
- Show the resolution — and crucially, that once decided, you **committed fully**.

**Amazon-specific:** this maps to "Have Backbone; Disagree and Commit." They want conviction *and* team alignment, not stubbornness or pushover behavior.

**Follow-ups:**
- What if the decision went against you — how did you handle it?
- How do you disagree without damaging the relationship?

---

### Q96. Describe a time you failed or made a mistake. 🟡
**Asked at:** Amazon, Microsoft, Google

Interviewers test **ownership and growth**, not perfection. A strong answer:
- Owns the failure honestly (no deflecting to others or "my weakness is I work too hard").
- Explains the impact.
- Focuses on **what you learned and changed** so it didn't recur.

**Avoid:** blaming others, a trivial "fake" failure, or a catastrophic unrecoverable one with no lesson. **Amazon:** ties to "Ownership" and "Learn and Be Curious."

**Follow-ups:**
- How did you communicate the failure to stakeholders?
- What process/safeguard did you add afterward?

---

### Q97. How do you prioritize when everything is urgent / you're under a tight deadline? 🟡
**Asked at:** Amazon, Flipkart, startups

Show a **framework**, not panic:
- Clarify what truly matters (impact vs effort; what's blocking others; deadlines).
- Communicate trade-offs to stakeholders early ("if we do X by Friday, Y slips — here's my recommendation").
- Break work down, focus on the highest-impact items, and cut scope where acceptable (MVP thinking).
- Ask for help / delegate when needed.

**What they assess:** judgment, communication, calm under pressure, and bias for action without recklessness.

**Follow-ups:**
- Tell me about a time you missed a deadline — what happened?
- How do you decide what to cut?

---

### Q98. Why do you want to join our company / why should we hire you? 🟢
**Asked at:** All companies

Be **specific and researched**, not generic:
- Connect the company's products/scale/tech/mission to your genuine interests and strengths.
- Reference something concrete (a product, engineering blog, the scale of problems).
- Tie your skills to the role's needs with a brief example.

Avoid generic flattery ("great company") or purely compensation-driven answers. Show you understand what *this* company does and why you're a fit.

**Follow-ups:**
- What do you know about our tech stack / recent launches?
- Where do you see yourself in 3 years?

---

### Q99. Scenario: Production is down at 2 AM and you're on call. Walk me through your response. 🟡
**Asked at:** Amazon, Uber, SRE/backend roles

Demonstrate a **calm, structured incident response**:
1. **Acknowledge & assess** — confirm the alert, gauge blast radius/severity.
2. **Mitigate first, root-cause later** — stop the bleeding (rollback the recent deploy, scale up, failover, enable a circuit breaker) to restore service.
3. **Communicate** — update stakeholders/status page; pull in help if needed.
4. **Diagnose** — use dashboards, logs, traces (*see Q92*) to find the cause.
5. **Resolve & verify** — apply the fix, confirm recovery.
6. **Blameless postmortem** — document timeline, root cause, and action items to prevent recurrence.

**Key judgment:** restoring service > finding the perfect root cause in the moment.

**Follow-ups:**
- How do you decide whether to roll back or fix forward?
- What goes in a good postmortem?
- How do you prevent alert fatigue?

---

### Q100. Scenario: A stakeholder requests a feature you think is a bad idea. What do you do? 🟡
**Asked at:** Amazon, Microsoft, product companies

Show **customer obsession + backbone + collaboration**:
- **Understand the underlying need** — ask *why* they want it; often the real problem differs from the requested solution.
- **Bring data/analysis** — explain your concern (tech debt, UX, cost, security) with evidence, and propose an alternative that meets the true need.
- **Escalate constructively if needed**, but respect the decision — you inform, you don't obstruct.
- **Disagree and commit** if overruled.

**What they assess:** whether you can push back thoughtfully, communicate with non-engineers, and keep the customer's actual goal central.

**Follow-ups:**
- What if they insist after you've made your case?
- How do you say "no" while preserving the relationship?

---

## 11. Web & Frontend Engineering

> Web-specific fundamentals that product companies (and full-stack roles) love — because they reveal whether you understand *how the browser and web actually work* beneath your framework. Covers rendering, TypeScript, browser caching, the event loop, and performance.

---

### Q101. Why don't browsers run TypeScript directly? 🟢
**Asked at:** Flipkart, Razorpay, frontend-heavy startups

Browsers only understand **HTML, CSS, and JavaScript** — their engines (V8 in Chrome, SpiderMonkey in Firefox) implement the **ECMAScript** standard, not TypeScript. TypeScript is a **superset** of JavaScript that adds *static types*, interfaces, generics, etc.

**The key insight — types are a development-time tool, not a runtime one:**
- TypeScript is **transpiled** (compiled) down to plain JavaScript by the TS compiler (`tsc`) or a bundler (Babel, esbuild, SWC) *before* it reaches the browser.
- During transpilation, **all type annotations are stripped away** (this is called *type erasure*) — types exist only to catch errors at compile time and power editor tooling. The output is standard JS the browser can execute.
- Adding a full type checker to every browser would bloat engines, slow page loads, and force one language's type system on the entire web — so the web platform deliberately keeps the runtime language minimal.

**So the flow is:** `TypeScript → (compile / type-check + strip types) → JavaScript → browser executes JS`.

**Follow-ups:**
- What is "type erasure"? (types are removed; no runtime type info)
- Does TypeScript make your code faster at runtime? (No — it compiles to the same JS)
- What's the difference between transpiling and compiling? (transpiling = source-to-source, same abstraction level)
- Why do browsers similarly not run JSX or SCSS directly? (same reason — build step transforms them to JS/CSS)

---

### Q102. What is Server-Side Rendering (SSR), and how does it differ from CSR, SSG, and ISR? 🟡
**Asked at:** Flipkart, Meesho, Zomato, frontend roles

The core question: **where does the HTML get generated — on the server or in the browser?**

- **CSR (Client-Side Rendering):** the server sends a nearly empty HTML shell + a JS bundle; the browser downloads JS, runs it, and *builds the page in the browser*. **Fast navigation after load, great for app-like SPAs**, but slow **first paint**, and **bad for SEO** (crawlers may see an empty page).
- **SSR (Server-Side Rendering):** the server renders the **full HTML for each request** and sends it ready-to-display; JS then "hydrates" it to make it interactive. **Fast first paint + SEO-friendly + good for dynamic, personalized content**, but higher server load and slower time-to-interactive (waits for hydration).
- **SSG (Static Site Generation):** HTML is pre-rendered **at build time** and served as static files (via CDN). **Blazing fast + cheap + SEO-friendly**, but content is fixed until the next rebuild — best for blogs, docs, marketing pages.
- **ISR (Incremental Static Regeneration):** SSG + the ability to **regenerate specific pages in the background** on a schedule/on-demand — static speed with fresher content.

**How to choose:** SEO + dynamic per-request data → **SSR**; mostly static content → **SSG/ISR**; highly interactive dashboard behind a login (SEO irrelevant) → **CSR**. Frameworks like Next.js let you mix all of these per route.

**Follow-ups:**
- What is **hydration**, and why can it hurt performance? (*see Q111*)
- Why is SSR better for SEO than CSR?
- What are Core Web Vitals (LCP, FID/INP, CLS) and how does rendering strategy affect them?
- What are React Server Components? (render on the server, ship zero JS for those components)

---

### Q103. Explain browser caching and its types (this is different from application caching). 🟡
**Asked at:** Flipkart, Amazon, Razorpay

> Note: Q3 covered *application/database* caching (Redis, cache-aside, LRU). This question is about the **web-delivery caching layers** between server and browser.

**The caching layers (client → origin):**
1. **Browser cache (memory & disk cache):** the browser stores fetched resources locally so repeat visits skip the network. Controlled by HTTP headers.
2. **HTTP caching headers** — the contract that governs freshness:
   - **`Cache-Control`** — the main directive: `max-age=3600` (fresh for an hour), `no-cache` (revalidate before use), `no-store` (never cache — for sensitive data), `private` vs `public`, `immutable`.
   - **`ETag` / `If-None-Match`** — a content fingerprint; the browser sends the ETag, and the server replies **`304 Not Modified`** (empty body) if unchanged → saves bandwidth.
   - **`Last-Modified` / `If-Modified-Since`** — timestamp-based validation (weaker than ETag).
   - **`Expires`** — older, absolute-date version of `max-age`.
3. **CDN / edge cache:** caches static (and some dynamic) content at edge servers near users (*see Q51*).
4. **Service Worker cache (Cache API):** a programmable proxy in the browser enabling **offline support** and custom caching strategies (cache-first, network-first) — the backbone of PWAs.
5. **Reverse-proxy cache** (Varnish, Nginx) in front of the origin.

**Strong vs weak caching (interview favorite):**
- **Strong caching** (`Cache-Control: max-age`, `Expires`) → the browser serves from cache **without contacting the server** at all until expiry.
- **Weak / validation caching** (`ETag`, `Last-Modified`) → the browser **asks the server** "is it still valid?"; gets `304` (use cache) or `200` (new content).

**Cache busting:** since static assets are cached aggressively, deployments include a **content hash in the filename** (`app.a1b2c3.js`) so a new version = a new URL = a guaranteed fresh fetch.

**Follow-ups:**
- `no-cache` vs `no-store` — the difference? (revalidate vs never store)
- How does a `304 Not Modified` save bandwidth?
- How do you cache-bust static assets on deploy?
- Where would you *disable* caching entirely? (auth tokens, personal/sensitive data)

---

### Q104. What happens when a browser renders a web page? (Critical Rendering Path) 🟡
**Asked at:** Flipkart, Amazon, frontend roles

After HTML arrives (*see Q45 for the network part*), the browser turns bytes into pixels:

1. **Parse HTML → DOM tree** (Document Object Model — the content structure).
2. **Parse CSS → CSSOM tree** (styles).
3. **Combine → Render tree** (visible nodes + their computed styles).
4. **Layout (reflow):** compute the exact size and position of every element.
5. **Paint:** fill in pixels (colors, text, images).
6. **Composite:** layer everything to the screen (GPU-accelerated).

**Why it matters for performance:**
- **CSS is render-blocking** — the browser won't paint until the CSSOM is ready. Keep critical CSS small/inline.
- **JS is parser-blocking by default** — a `<script>` pauses HTML parsing. Use **`async`** (fetch in parallel, run when ready) or **`defer`** (fetch in parallel, run after parsing) to avoid blocking.
- **Reflow (layout) is expensive** — changing geometry (width, position) triggers it; changing only `transform`/`opacity` can skip layout/paint (compositor-only) → smoother animations.

**Follow-ups:**
- `async` vs `defer` on script tags — the difference?
- What triggers a reflow vs a repaint, and why care?
- Why put CSS in `<head>` and scripts before `</body>` (or use defer)?

---

### Q105. Explain the JavaScript event loop (and why JS is single-threaded but non-blocking). 🟡
**Asked at:** Flipkart, Razorpay, Uber, frontend roles

JavaScript runs on a **single thread** with one **call stack**, yet handles async work without blocking — thanks to the **event loop**.

**The model:**
- **Call stack** — executes synchronous code, one frame at a time.
- **Web APIs** (browser) / **libuv** (Node) — handle async operations (timers, fetch, I/O) *off* the main thread.
- When an async op finishes, its callback is queued:
  - **Macrotask queue** (task queue) — `setTimeout`, `setInterval`, I/O, UI events.
  - **Microtask queue** — Promises (`.then`/`await`), `queueMicrotask`, `MutationObserver`. **Higher priority.**
- **Event loop rule:** when the call stack is empty, drain **all microtasks first**, then take **one macrotask**, then drain microtasks again, and repeat.

**Classic gotcha:**
```js
console.log('A');
setTimeout(() => console.log('B'), 0);   // macrotask
Promise.resolve().then(() => console.log('C')); // microtask
console.log('D');
// Output: A, D, C, B  (sync → microtask → macrotask)
```

**Follow-ups:**
- Microtask vs macrotask priority — predict the output.
- Does `setTimeout(fn, 0)` run immediately? (No — it waits for the stack to clear + microtasks)
- How does this differ in Node.js? (phases, `process.nextTick`)

---

### Q106. What is the Virtual DOM, and how does reconciliation work? 🟡
**Asked at:** Flipkart, Meesho, React-based roles

Directly manipulating the real DOM is **slow** (each change can trigger layout/paint). React (and similar libraries) keep a lightweight **in-memory copy of the DOM — the Virtual DOM**.

**How it works:**
1. On state change, React builds a **new Virtual DOM tree**.
2. It **diffs** the new tree against the previous one (**reconciliation**) using heuristics (compare by element type; use **keys** to match list items efficiently).
3. It computes the **minimal set of real-DOM changes** and applies them in one **batched update**.

**Why keys matter:** without stable keys in lists, React can't tell which items changed → it re-renders/reorders inefficiently or causes bugs. Never use array index as a key for dynamic lists.

**Trade-off:** the Virtual DOM isn't "faster than the DOM" in absolute terms — it's a **developer-productivity + predictable-updates** abstraction that avoids *manual* inefficient DOM manipulation. (Newer approaches like Svelte's compiler or "signals" skip the VDOM entirely.)

**Follow-ups:**
- Why are `key` props important in lists?
- Is the Virtual DOM always faster than direct DOM manipulation? (No — it's about avoiding manual over-updating)
- What causes unnecessary re-renders and how do you prevent them? (memoization: `React.memo`, `useMemo`, `useCallback`)

---

### Q107. Debounce vs throttle — what's the difference and when do you use each? 🟢
**Asked at:** Flipkart, Uber, Razorpay, frontend roles

Both limit how often a function runs in response to rapid events (scroll, resize, keystrokes) — but differently:

- **Debounce:** wait until the events **stop** for a set delay, then run once. *"Run only after the user pauses."* → **search-box autocomplete** (fire the API call after the user stops typing), form validation, window-resize-end.
- **Throttle:** run **at most once per interval** while events keep firing. *"Run at a steady maximum rate."* → **scroll handlers**, infinite scroll, drag/mousemove, rate-limiting button clicks.

```
Typing "hello" fast:
  debounce(300ms): fires ONCE, 300ms after the last keystroke
  throttle(300ms): fires every 300ms during typing
```

**Follow-ups:**
- Implement debounce in JavaScript (closure + `setTimeout` + `clearTimeout`).
- Which for a search bar vs a scroll listener?
- What is a leading-edge vs trailing-edge debounce?

---

### Q108. What is CORS, and why does it exist? 🟡
**Asked at:** Flipkart, Razorpay, Amazon, full-stack roles

**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism that controls whether a web page on one **origin** (scheme + host + port) can make requests to a *different* origin.

**Why it exists:** browsers enforce the **Same-Origin Policy** to stop a malicious site from silently reading your data on another site (e.g., your bank) using your logged-in cookies. CORS is the *controlled relaxation* of that policy.

**How it works:** the **server** opts in by sending response headers like `Access-Control-Allow-Origin: https://myapp.com`. For "non-simple" requests (custom headers, `PUT`/`DELETE`, JSON), the browser first sends a **preflight `OPTIONS`** request to check permission before the real request.

**Key clarifications interviewers probe:**
- CORS is **enforced by the browser, not the server** — the server just declares the policy. (Tools like Postman or server-to-server calls aren't subject to CORS.)
- A CORS error is **not** the server "blocking" you — the response often arrives but the browser refuses to expose it to your JS.

**Follow-ups:**
- What is a preflight request and what triggers it?
- Why doesn't Postman/cURL hit CORS errors?
- How do you fix a CORS error properly? (fix server headers — not by disabling browser security)
- What is `Access-Control-Allow-Credentials`?

---

### Q109. Cookies vs localStorage vs sessionStorage — differences and when to use each. 🟢
**Asked at:** Flipkart, Razorpay, full-stack roles

| | Cookies | localStorage | sessionStorage |
|---|---|---|---|
| Capacity | ~4 KB | ~5–10 MB | ~5–10 MB |
| Sent to server | **Yes**, automatically on every request | No | No |
| Lifetime | Configurable (expiry) | Until cleared | Until tab closes |
| Access from JS | Yes (unless `HttpOnly`) | Yes | Yes |
| Use case | Auth/session tokens, server-read data | App state, caching, preferences | Per-tab temporary data |

**Security notes (commonly probed):**
- Store **auth tokens in `HttpOnly` + `Secure` + `SameSite` cookies**, not localStorage — `HttpOnly` cookies are invisible to JavaScript, protecting against **XSS** token theft.
- localStorage is fully readable by any JS on the page → vulnerable to XSS; never put sensitive tokens there.
- `SameSite=Strict/Lax` mitigates **CSRF**.

**Follow-ups:**
- Where should you store a JWT and why? (HttpOnly cookie vs localStorage trade-off)
- What does the `HttpOnly` flag protect against? (XSS reading the cookie)
- What is `SameSite` and how does it help with CSRF?

---

### Q110. How do you optimize a website's load time / performance? 🟡
**Asked at:** Flipkart, Amazon, Meesho, frontend roles

Structured by *what* you're optimizing:

**Reduce bytes / requests:**
- **Code splitting & lazy loading** — load JS/routes/components only when needed (dynamic `import()`).
- **Tree shaking** — bundlers drop unused code (dead-code elimination).
- **Minification & compression** — minify JS/CSS; serve **gzip/Brotli**.
- **Image optimization** — modern formats (WebP/AVIF), responsive `srcset`, lazy-load offscreen images, proper sizing.

**Deliver faster:**
- **CDN** for static assets (*see Q51*), **HTTP/2 or HTTP/3** (multiplexing), **caching headers** (*see Q103*).
- **Preload/preconnect/prefetch** critical resources.

**Render faster:**
- **SSR/SSG** for fast first paint (*see Q102*), inline **critical CSS**, `defer`/`async` scripts.
- Avoid layout thrashing; virtualize long lists (render only visible rows).

**Measure:** Lighthouse + **Core Web Vitals** — **LCP** (loading), **INP** (interactivity), **CLS** (visual stability). Optimize based on data, not guesses.

**Follow-ups:**
- What are the Core Web Vitals and their targets?
- Difference between lazy loading and code splitting?
- What is tree shaking and what enables it? (ES module static structure)

---

### Q111. What is hydration in SSR, and why can it be a problem? 🟡
**Asked at:** Flipkart, Next.js/React roles

After SSR sends fully-rendered HTML, that HTML is **static** — buttons don't work, state isn't wired up. **Hydration** is the client-side process where the JS framework "attaches" event listeners and reconstructs component state on top of the existing server HTML, making it interactive.

**Why it can hurt:**
- The browser must **download and execute the full JS bundle** before the page becomes interactive → a fast *first paint* but a delayed *time-to-interactive* (the "uncanny valley" where the page looks ready but doesn't respond).
- **Hydration mismatches** — if server-rendered HTML differs from what the client renders (e.g., using `Date.now()` or `window`), React throws warnings/bugs.

**Modern mitigations:** **partial/progressive hydration** (hydrate only interactive parts), **islands architecture** (Astro — hydrate isolated "islands"), **React Server Components** and **streaming SSR** (send HTML in chunks), and **resumability** (Qwik — skip hydration by serializing state).

**Follow-ups:**
- Why does hydration delay interactivity?
- What causes a hydration mismatch error?
- What is the "islands architecture"?

---

### Q112. Explain closures, hoisting, and `this` in JavaScript. 🟢
**Asked at:** Flipkart, Razorpay, Amazon, most JS roles

Three classic JS-fundamentals checks:

- **Closure:** a function that "remembers" the variables of the scope in which it was created, even after that scope has exited. Enables data privacy, function factories, and stateful callbacks.
  ```js
  function counter() { let c = 0; return () => ++c; }
  const inc = counter(); inc(); // 1  → inc(); // 2  (c is "closed over")
  ```
- **Hoisting:** declarations are conceptually moved to the top of their scope. `var` and function *declarations* are hoisted (`var` initialized as `undefined`); **`let`/`const` are hoisted but stay in the "temporal dead zone"** until declared (accessing early throws).
- **`this`:** what `this` refers to depends on **how a function is called** — the global object / `undefined` (strict) for plain calls, the object for method calls, the bound object via `call`/`apply`/`bind`. **Arrow functions don't bind their own `this`** — they inherit it from the enclosing scope (a common source of bugs and fixes).

**Follow-ups:**
- Give a real use of closures. (event handlers, memoization, module pattern)
- Why do arrow functions handle `this` differently?
- What is the temporal dead zone?

---

### Q113. What is a Single Page Application (SPA), and its trade-offs vs multi-page? 🟢
**Asked at:** Flipkart, Meesho, frontend roles

An **SPA** loads a single HTML page and dynamically updates content via JavaScript (client-side routing + API calls) instead of full page reloads. Examples: Gmail, most React/Angular/Vue apps.

**Pros:** app-like fluid navigation (no full reloads), less server rendering per interaction, clear frontend/backend separation (API-driven). **Cons:** slow **initial load** (big JS bundle), **SEO challenges** (content rendered client-side — mitigated by SSR/SSG), needs client-side routing and history management, and more memory in the browser.

**MPA (Multi-Page App):** each route is a separate server-rendered page — better SEO and initial load, simpler, but full reloads on navigation. Modern frameworks blur this line (Next.js/Nuxt give SPA-like navigation with SSR/SSG benefits).

**Follow-ups:**
- How do you make an SPA SEO-friendly? (SSR/SSG, pre-rendering)
- How does client-side routing work without page reloads? (History API)
- When would you pick an MPA over an SPA?

---
## ⚡ Quick Revision Cheat Sheet

> Skim this the night before. Formulas, numbers, and one-liners for last-minute recall.

### 🔢 Numbers Everyone Should Know
| Metric | Value |
|---|---|
| L1 cache | ~1 ns |
| Main memory reference | ~100 ns |
| SSD random read | ~100 µs |
| Datacenter round trip | ~0.5 ms |
| Disk seek | ~10 ms |
| Cross-continent round trip | ~150 ms |
| Seconds in a day | ~86,400 ≈ 10⁵ |
| 99.9% availability | ~8.7 hrs down/year |
| 99.99% availability | ~52 min down/year |
| 99.999% ("five nines") | ~5 min down/year |

**Capacity formula:** `QPS ≈ (DAU × requests-per-user) / 86,400` · `Peak QPS ≈ 2–3 × average` · `Storage/day = items/day × item size`

### 📊 Big-O Cheat Sheet
| Structure | Access | Search | Insert | Delete |
|---|---|---|---|---|
| Array | O(1) | O(n) | O(n) | O(n) |
| Hash Table | – | O(1) avg | O(1) avg | O(1) avg |
| Balanced BST | O(log n) | O(log n) | O(log n) | O(log n) |
| Heap | O(1) peek | O(n) | O(log n) | O(log n) |
| Linked List | O(n) | O(n) | O(1)* | O(1)* |

Sorting: Merge/Heap sort **O(n log n)** worst; Quicksort O(n log n) avg / O(n²) worst; counting/radix O(n) for bounded keys.

### 🧠 Must-Know Theorems & Concepts
- **CAP:** pick 2 of Consistency, Availability, Partition-tolerance. P is mandatory → choose **C or A** during a partition. (PACELC: else, Latency vs Consistency.)
- **ACID:** Atomicity, Consistency, Isolation, Durability (SQL transactions).
- **BASE:** Basically Available, Soft state, Eventual consistency (NoSQL).
- **Coffman's 4 deadlock conditions:** Mutual exclusion, Hold-and-wait, No preemption, Circular wait.
- **Amdahl's Law:** speedup limited by the serial fraction of a program.
- **Consistent hashing:** adding/removing a node remaps only ~1/N keys.
- **Quorum:** `W + R > N` guarantees read sees latest write.
- **Idempotency:** repeat = same effect (essential for retries/payments).
- **Attention:** `softmax(Q·Kᵀ / √dₖ)·V` · self-attention is **O(n²·d)**.

### 🏗️ System Design 7-Step Framework
1. Clarify requirements (functional + non-functional)
2. Estimate scale (QPS, storage, bandwidth)
3. Define APIs
4. High-level design (LB → app → cache → DB → queue)
5. Data model (SQL vs NoSQL, shard key)
6. Deep-dive one component
7. Bottlenecks & trade-offs

### 🔁 Caching Strategies
Cache-aside (lazy) · Write-through (consistent, slow writes) · Write-back (fast, risky) · Read-through. Eviction: **LRU** / LFU / FIFO / TTL. Watch: stampede, hot keys, invalidation.

### ⚖️ Rate Limiter Algorithms
Fixed Window · Sliding Window Log · Sliding Window Counter · **Token Bucket** (bursty) · Leaky Bucket (smooth). Store counters in **Redis**; return **429 + Retry-After**.

### 🌐 Networking One-Liners
- **TCP** = reliable, ordered, connection-oriented. **UDP** = fast, best-effort.
- **PUT/GET/DELETE** idempotent; **POST** not.
- **301** permanent (cached) vs **302** temporary redirect.
- **DNS:** browser → OS → resolver → root → TLD → authoritative.
- **REST** simple · **GraphQL** no over/under-fetch · **gRPC** fast internal (HTTP/2 + protobuf).
- **WebSocket** = full-duplex persistent; **SSE** = one-way server push.

### 🗄️ Database One-Liners
- **Index** = B+ Tree → fast reads, slower writes. Clustered (1/table) vs non-clustered.
- **Normalization** removes redundancy (more joins); **denormalization** speeds reads.
- **Sharding:** range / hash / directory / geo. Pick a shard key that avoids hotspots.
- **Replication:** leader-follower (read scaling) · multi-leader · leaderless (quorum).
- **Isolation levels:** Read Uncommitted → Read Committed → Repeatable Read → Serializable.

### 🤖 LLM One-Liners
- **Transformer** = attention (no recurrence); **decoder-only** for most LLMs.
- **Pipeline:** tokenize → embed → transformer stack → next-token softmax (autoregressive).
- **Training:** Pretrain (self-supervised) → SFT → RLHF/DPO.
- **RAG** = retrieve + inject context → grounds answers, reduces hallucination.
- **Fine-tune** for *behavior/style*; **RAG** for *knowledge*.
- **LoRA/QLoRA** = cheap parameter-efficient fine-tuning.
- **Inference opt:** KV cache · quantization · batching · PagedAttention (vLLM) · speculative decoding.
- **Temperature** low = deterministic, high = creative. **Context window** = max tokens; model is stateless.
- **Agent** = LLM in a ReAct loop (Thought → Action → Observation) with tools + guardrails.

### 🌍 Web & Frontend One-Liners
- **Browsers run only HTML/CSS/JS** — TypeScript/JSX/SCSS are **transpiled to JS/CSS** at build time; type annotations are **erased** (no runtime cost).
- **Rendering:** CSR (browser builds page, poor SEO) · **SSR** (server builds per-request HTML, SEO-friendly) · SSG (build-time static) · ISR (static + background regen).
- **Hydration** = attaching JS interactivity to SSR HTML → fast paint but delayed interactivity.
- **Browser caching:** `Cache-Control` (`max-age`/`no-cache`/`no-store`) · **ETag → 304 Not Modified** · Service Worker (offline/PWA) · CDN edge. Strong caching (skip server) vs validation caching (ask server). **Cache-bust with hashed filenames.**
- **Critical Rendering Path:** HTML→DOM, CSS→CSSOM → Render tree → Layout → Paint → Composite. CSS blocks render; JS blocks parsing (use `async`/`defer`).
- **Event loop:** single thread; drain **all microtasks (Promises)** then **one macrotask (setTimeout)**.
- **Virtual DOM** = diff + reconcile → minimal batched real-DOM updates; **keys** identify list items.
- **Debounce** = run after events stop (search box) · **Throttle** = run at fixed rate (scroll).
- **CORS** = browser-enforced same-origin relaxation; server sets `Access-Control-Allow-Origin`; preflight `OPTIONS` for non-simple requests.
- **Storage:** cookies (~4KB, sent to server, use `HttpOnly`+`Secure`+`SameSite` for tokens) · localStorage (~5–10MB, persistent, XSS-exposed) · sessionStorage (per-tab).
- **Perf:** code splitting, lazy loading, tree shaking, minify + Brotli, image optimization (WebP), CDN. Measure with **Core Web Vitals: LCP, INP, CLS**.
- **`this`:** depends on call site; **arrow functions inherit `this`**. `let`/`const` have a temporal dead zone.

### 🧩 SOLID + Patterns
**SOLID:** Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion.
**Patterns:** Singleton, Factory, Builder (creational) · Adapter, Decorator, Proxy, Facade (structural) · Observer, Strategy, State, Command (behavioral). **Favor composition over inheritance.**

### ☁️ Cloud/DevOps One-Liners
- **Container** shares host kernel (light); **VM** has full guest OS (heavy).
- **K8s:** Pod < Deployment < Service; self-healing + autoscaling.
- **CI/CD:** auto build/test → deploy. Strategies: blue-green, canary, rolling.
- **Serverless (Lambda):** no infra, auto-scale, pay-per-use; watch cold starts.
- **Observability = metrics + logs + traces.** Golden signals: latency, traffic, errors, saturation.

### 💬 Behavioral: STAR
**S**ituation → **T**ask → **A**ction → **R**esult. Use "I", quantify impact, prepare 5–6 stories (challenge, failure, conflict, leadership, deadline, ambiguity). Amazon: study the **Leadership Principles** (Customer Obsession, Ownership, Dive Deep, Disagree & Commit, Bias for Action).

---

## 📚 Suggested Practice Resources
- **DSA:** LeetCode (Top Interview 150, company-tagged), NeetCode patterns, Striver's SDE Sheet.
- **System Design:** *Grokking the System Design Interview*, "System Design Primer" (GitHub), *Designing Data-Intensive Applications* (Kleppmann) for depth.
- **CS Fundamentals:** GeeksforGeeks (OS/DBMS/CN), InterviewBit.
- **LLM/AI:** *Attention Is All You Need*, DataCamp/InterviewBit LLM question banks, hands-on with an LLM API.
- **LLD:** *Grokking the OOD Interview*, refactoring.guru (design patterns).
- **Mock interviews:** Pramp, interviewing.io, peer mocks.

## 🎯 Final Tips for 15+ LPA Interviews
1. **Think aloud** — interviewers score your reasoning, not just the answer.
2. **Clarify before solving** — never assume; state assumptions.
3. **Always discuss trade-offs** — there's rarely one right answer at this level.
4. **Know your projects deeply** — expect a grilling on anything on your resume.
5. **Manage the clock** — don't get stuck; state a brute force, then optimize.
6. **Stay calm on the unknown** — reason from first principles; interviewers value approach over recall.
7. **Prepare thoughtful questions** for the interviewer — signals genuine interest.

---

*Good luck with your placements! ⭐ Star this repo and revise the Quick Revision section before every interview.*

> **Disclaimer:** Company tags are indicative, compiled from publicly-shared interview experiences; actual questions vary by role, team, and year. Depth and difficulty of follow-ups scale with the interviewer. Use this as a structured study guide, not a guarantee of specific questions.
