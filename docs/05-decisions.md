# Decisions Log (ADR-lite)

Quick record of choices made while planning, so we don't re-litigate them later.

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| 1 | **Polyglot microservices**: Spring Boot (Java) core API + FastAPI (Python) AI service | Each is industry-standard for its job; uses the Java Diego wanted; reuses BluHorizon RAG; justifies Kubernetes | ✅ |
| 2 | **Drop FAISS → Postgres `pgvector`** for RAG vectors | One DB for app + vectors; pgvector is the standard; FAISS removed per Diego | ✅ |
| 3 | **AMA RAG bot** = "ask questions about Diego" grounded on resume/projects | Clarified "trade AI" = ask-me-anything bot | ✅ |
| 4 | **Games**: tic-tac-toe + Connect-4 first; **chess = stretch** | Ship simple games fast; chess is an outreach goal | ✅ |
| 5 | **Phased deployment**: Compose → local k8s → AWS EKS/RDS, plus a cheap always-on demo | Low cost + fastest start; keeps a public URL for employers without EKS billing | ✅ |
| 6 | **Frontend = Next.js (React + TS)** | Standard for portfolio sites; SSR/SSG SEO; best place to learn TypeScript | ✅ |
| 7 | **Embeddings = Sentence-Transformers (local), fixed & ours** | Free, no extra API; feeds pgvector; must stay constant or search breaks — never BYOK | ✅ |
| 8 | **Auth = Spring Security JWT** with guest sessions | Standard stateless auth; itself a skill to demonstrate; supports guest game tracking | ✅ |
| 9 | **Monorepo** | Easiest solo dev + "whole system in one place" for employers | ✅ |
| 10 | **DB table design deferred** | Per Diego — entity inventory captured in `01-architecture.md`, schema designed in Sprint 2 | ⏳ open |
| 11 | **Generation defaults to a free/cheap model; BYOK optional**; retrieval always ours | Zero-setup for any visitor; default capped (daily cap + rate limit) so cost stays ~$0; BYOK lets technical users bring their own/better model, key used in-memory per request, never stored/logged | ✅ |
| 12 | **Runnable in-page demos = outreach/stretch goal** (not MVP) | "Try the tech inside the project page" (e.g. RAG Lab widget) is a later showcase, deferred per Diego | ✅ |
| 13 | **Build tool for core-api = Gradle (Kotlin DSL, `build.gradle.kts`)** | Diego's choice; type-safe build script, best IDE support; app code stays 100% Java | ✅ |
| 14 | **Spring Boot 3.5.15** (latest 3.x), not 4.x | No removed APIs (removals land in 4.x); maximal tutorial coverage; within reliable knowledge — per Diego "no deprecated functions" | ✅ |

## Open questions to resolve later
- Project content source: **MDX files vs DB table** (plan: start MDX, migrate to DB only if needed).
- Cheap-demo host: **Fly.io vs Render vs small EC2** (decide in Sprint 1).
- Which **free/cheap default model**: self-hosted **Ollama** ($0/query, needs a bigger host) vs a
  free-tier API (**Groq**, **Gemini Flash**) ($0 but provider rate limits, server holds a key). Decide in Sprint 3.
- Whether the separate trading-AI is in scope at all, or folded into "projects."
