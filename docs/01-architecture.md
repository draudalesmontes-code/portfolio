# Architecture Plan

## Guiding principles
1. **Walking skeleton first.** Get the *thinnest possible* slice running end-to-end (browser →
   gateway → both backends → DB) before building features. This is the single biggest accelerator
   for someone new to the stack — you debug the wiring once, then only add features.
2. **Polyglot microservices, but only two services.** Enough to justify Kubernetes and show range,
   not so many that you drown. One Java service, one Python service.
3. **Each tool where it's strongest.** Spring Boot for transactional CRUD/auth; FastAPI for AI/RAG
   (it's where your BluHorizon code already lives, and it's the Python AI standard).
4. **Phased infra.** Same Docker images run on Compose → local k8s → AWS. You never rewrite to "go
   to prod"; you only change *where* the containers run.

## High-level architecture

```
                            ┌─────────────────────────┐
                            │        Browser           │
                            │  (recruiters / visitors) │
                            └────────────┬────────────┘
                                         │ HTTPS
                            ┌────────────▼────────────┐
                            │   Next.js (React + TS)   │   ← frontend (SSR/SSG)
                            │  portfolio pages + UI    │
                            └────────────┬────────────┘
                                         │ JSON over HTTPS
                            ┌────────────▼────────────┐
                            │  Ingress / API Gateway   │   nginx-ingress (k8s) /
                            │  routes by URL path      │   nginx reverse-proxy (compose)
                            └──────┬──────────────┬────┘
                      /api/*       │              │   /ai/*
                  ┌───────────────▼──┐      ┌─────▼─────────────────┐
                  │  Core API         │      │  AI service           │
                  │  Spring Boot      │      │  FastAPI (Python 3.12)│
                  │  (Java 21)        │      │  • AMA RAG bot        │
                  │  • auth (JWT)     │      │  • LLM game opponent  │
                  │  • projects       │◄────►│  • embeddings/ingest  │
                  │  • feedback       │ REST └──────┬──────────┬─────┘
                  │  • game sessions  │             │          │ free/cheap model by default
                  └─────────┬─────────┘             │          ▼  (BYOK = optional upgrade)
                            │                       │     ┌─────────────────┐
                            │ JDBC/JPA              │     │ LLM provider     │
                            ▼                       ▼     │ free default /   │
                  ┌────────────────────────────────────┐ │ BYOK (Claude/etc)│
                  │   PostgreSQL 16 + pgvector          │ └─────────────────┘
                  │   • app tables (users, scores, …)   │
                  │   • document_chunks (vector column) │
                  └────────────────────────────────────┘
```

## Components & responsibilities

### 1. Frontend — Next.js (React + TypeScript)
- Server-renders/statically-generates the portfolio pages (good SEO so recruiters find you).
- Client components for the interactive bits: chat widget, game boards, feedback form.
- Talks **only** to the gateway over `/api/*` and `/ai/*` — it never knows there are two backends.
- Holds the JWT (httpOnly cookie) after login; sends it on requests.

### 2. Core API — Spring Boot (Java 21)
The "system of record." Owns all relational data and identity.
- **Auth**: register/login, password hashing (BCrypt), issues & validates **JWT**. Supports
  *guest* sessions (anonymous id) so games can be played without an account.
- **Projects**: serves project showcase content (so you can edit projects without redeploying).
- **Feedback**: stores portfolio feedback submissions.
- **Game sessions/scores**: records each game, result, and per-user/guest stats.
- Calls the AI service when a game needs the LLM's next move (server-to-server).

### 3. AI service — FastAPI (Python 3.12)
Everything LLM. Ports your BluHorizon code. **Generation defaults to a free/cheap model** so anyone
can use the assistant with zero setup; **BYOK is an optional upgrade**; **retrieval is always ours.**
- **AMA RAG bot**: HyDE pipeline → embed → `pgvector` similarity search → LLM writes the answer with
  citations. (FAISS dropped; vectors live in Postgres.)
- **Default model = free/cheap**: a no-setup default (self-hosted Ollama, or a free-tier API such as
  Groq/Gemini) handles generation out of the box. A **daily cap + rate limit** protect it.
- **BYOK = optional**: a technical visitor can paste their own provider + key for a better/own model.
  Their key is used **in-memory, per request, and never stored or logged**.
- **Game opponent**: given a board state, returns the machine's move (validated by the caller), using
  the same configurable provider (default free/cheap; BYOK optional).
- **Retrieval is fixed and ours**: the embedding model (Sentence-Transformers, local, free) and the
  `pgvector` search always run in this service — never swappable, or search breaks. Only the final
  generation step is configurable.

### 4. Data — PostgreSQL 16 + `pgvector`
One database, two concerns (we'll design exact tables later):
- **App schema**: `users`, `game_sessions`, `feedback`, `projects` (or projects as MDX files — TBD).
- **Vector schema**: `documents`, `document_chunks(embedding vector(384))` for RAG.
- Embeddings generated locally by **Sentence-Transformers** (free, no extra API cost).

> **Deferred (by your call):** exact columns, indexes, and constraints. The list above is the
> entity inventory we'll turn into a schema in a later session.

## Key data flows

**AMA chatbot** (free/cheap default generation or optional BYOK; our retrieval)
```
User types question (BYOK key optional)
  → Frontend POST /ai/chat
  → FastAPI: HyDE (LLM drafts hypothetical answer) → embed (OUR local model) → pgvector top-K w/ gap filter
  → retrieved chunks + question → free/cheap default LLM (or user's BYOK) → answer + source citations
  → streamed back to the chat widget   (any BYOK key used in-memory only, never stored)
```

**Mini-game move**
```
User makes a move
  → Frontend POST /api/games/{id}/move  (Spring Boot validates legality, persists state)
  → Spring Boot POST /ai/games/move  (sends board) → FastAPI → configurable LLM provider → machine move
  → Spring Boot validates + persists, updates scores → returns new board to frontend
```

**Login + guest**
```
Guest: frontend gets an anonymous guestId (cookie) → scores tracked under it.
Login: POST /api/auth/login → Spring Boot verifies → sets httpOnly JWT cookie.
       Guest stats can be merged into the account on first login.
```

## Cross-cutting concerns
- **Config/secrets**: env vars locally (`.env`, compose), k8s `Secret`/`ConfigMap` later, AWS
  Secrets Manager in prod. No secrets in the repo.
- **CORS/routing**: handled at the gateway; both services accept only gateway traffic in prod.
- **Observability (later)**: structured logs now; Prometheus/Grafana as a stretch skill-showcase.
- **CI/CD**: GitHub Actions builds/tests each service, pushes images to a registry.

## Deployment phases (same images throughout)
| Phase | Where it runs | Goal |
|------|----------------|------|
| 0 | **Docker Compose** | Fast local dev, walking skeleton |
| 1 | **Local k8s** (kind or minikube) | Learn k8s manifests safely, free |
| 2 | **AWS EKS + RDS Postgres** | Real cloud showcase (spin up when demoing) |
| 2b | **Cheap always-on demo** (Fly.io / Render / small EC2 + Compose) | A live URL you can always put on a resume without EKS cost |
