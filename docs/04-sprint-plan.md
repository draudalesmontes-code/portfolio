# Sprint Plan — shortest time to a deployable portfolio

**Strategy for speed:** build a *walking skeleton* first (everything wired, nothing fancy), then add
features as **vertical slices** (UI + API + DB together, one feature at a time). Get a public URL in
front of employers as early as Sprint 1 — then keep shipping behind it.

Sprints are ~1 week of focused solo work. Adjust to your pace; the **order** matters more than the
calendar. Each sprint ends with something that runs.

---

### 🎯 Fastest path to "live for employers": finish **Sprint 0 + 1** (~1.5 weeks) → portfolio is public.

---

## Sprint 0 — Walking skeleton (setup) · ~3–4 days
Goal: a request travels browser → gateway → **both** backends → Postgres, locally, via one command.
- [ ] Monorepo + folder skeleton (see `03-skeleton.md`), `.env.example`.
- [ ] `docker-compose.yml`: `postgres (pgvector image)`, `core-api`, `ai-service`, `frontend`, `gateway`.
- [ ] Next.js "hello" page that calls `/api/health` (Spring Boot) **and** `/ai/health` (FastAPI).
- [ ] Spring Boot skeleton + `/health` + JPA connected to Postgres + Flyway runs an empty `V1`.
- [ ] FastAPI skeleton + `/health` (port the BluHorizon `main.py` shell).
- [ ] nginx gateway routing `/`, `/api`, `/ai`.
- **Done when:** `docker compose up` → the page shows both backends OK and DB is connected.

## Sprint 1 — Portfolio core + first deploy · ~1 week
Goal: the actual portfolio, live on a public URL.
- [ ] Project showcase: list + detail pages (`/projects`, `/projects/[slug]`), responsive, Tailwind.
- [ ] Decide project content source (DB table vs MDX files) — **pick MDX for speed initially**.
- [ ] Home/about/landing, nav, basic SEO metadata.
- [ ] Deploy the **cheap always-on demo** (Fly.io/Render) → real URL for your resume.
- **Done when:** a stranger can visit the URL and browse your projects.

## Sprint 2 — Auth + feedback · ~1 week
Goal: identity + the feedback form, your first real DB writes.
- [ ] Schema design session → Flyway `V2` for `users`, `feedback` (we design tables here).
- [ ] Spring Security: register/login, BCrypt, JWT in httpOnly cookie; guest (anonymous id) support.
- [ ] Feedback form (frontend) → `POST /api/feedback` → persisted.
- [ ] Auth UI: login/register, "logged in as…" state.
- **Done when:** you can register, log in, and submit feedback that's saved.

## Sprint 3 — AMA RAG bot · ~1–1.5 weeks
Goal: anyone can ask questions about you and get sourced answers with **zero setup** (free/cheap
default model), with **optional BYOK** for a better/own model.
- [ ] Flyway `V3`: `documents`, `document_chunks(embedding vector(384))` + pgvector index.
- [ ] Port BluHorizon retrieval: `rag_pipeline.py`, `embedding.py`, swap FAISS → `pgvector_store.py`.
- [ ] **Generation provider abstraction** (`generation/base.py` + a free/cheap default + Claude/OpenAI);
      `/ai/chat` accepts `{question, provider?, apiKey?}` — falls back to the DEFAULT free model;
      any BYOK key used in-memory, never stored/logged.
- [ ] **Daily cap + rate limit** on the default model so it can't run away (`ratelimit.py`).
- [ ] `/ai/ingest` to load your resume + project write-ups; `/ai/chat` streaming endpoint.
- [ ] Chat widget in the frontend: works with no key; optional "use my own key" field; citations.
- **Done when:** a visitor with no key gets a grounded, cited answer; pasting a key uses their model.

## Sprint 4 — Mini-games vs the LLM · ~1.5 weeks
Goal: play tic-tac-toe and Connect-4 against a computer opponent; scores tracked.
- [ ] Flyway `V4`: `game_sessions` / scores (guest + user).
- [ ] Game engines in Spring Boot (move validation, win detection) — start with **tic-tac-toe**.
- [ ] `/ai/games/move`: board state → configurable LLM provider (BYOK) → move; Spring validates + persists.
- [ ] Game board UI + leaderboard/your-stats; then Connect-4.
- **Done when:** you can play both games, and scores persist (merged into account on login).

## Sprint 5 — Kubernetes (local) · ~1 week
Goal: the same images run on k8s, not just Compose.
- [ ] Write manifests in `infra/k8s/` (Deployments, Services, Postgres, Ingress, Secrets/ConfigMaps).
- [ ] Run on **kind/minikube**; nginx-ingress reproduces the `/api` `/ai` routing.
- **Done when:** `kubectl apply -f infra/k8s` brings the whole app up locally.

## Sprint 6 — AWS + CI/CD · ~1–2 weeks
Goal: cloud-grade deploy + automated pipeline (the headline showcase).
- [ ] Terraform: VPC, **EKS**, **RDS Postgres**, **ECR**, IAM, Secrets Manager.
- [ ] GitHub Actions: build/test → push images to ECR → run Flyway → deploy to EKS.
- [ ] Keep the cheap demo as the always-on public link; spin EKS up for demos to manage cost.
- **Done when:** a push to `main` ships to EKS, and you can demo it on AWS.

## Stretch / outreach goals (post-MVP)
- 🧪 **Runnable in-page demos** — embed live, interactive demos *inside* each project page (e.g. a
  "RAG Lab" widget that shows retrieval + scores + citations live), so visitors can try the tech
  without leaving the portfolio. The headline outreach goal.
- ♟️ **Chess** mini-game (heavier board state + move quality).
- 📈 **Trading-AI** demo project (if you want the separate trading agent).
- 📊 Observability: Prometheus + Grafana dashboards.
- 🔐 OAuth social login; rate limiting on AI endpoints; **optional** server-side capped model as a
  no-BYOK fallback for non-technical visitors.

---

### Critical-path summary
```
S0 skeleton → S1 portfolio LIVE → S2 auth/feedback → S3 RAG bot → S4 games → S5 k8s → S6 AWS
            ▲ employers can see it here                                    ▲ skill showcase peaks here
```
Cut scope, not order: if time is tight, S1 alone is a credible live portfolio; everything after is
incremental and independently shippable.
