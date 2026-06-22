# Tech Stack (planned)

Chosen for **industry-standard + reuses what you have + teaches the skills you listed**.

| Layer | Choice | Why this one | New to you? |
|-------|--------|--------------|-------------|
| **Frontend** | TypeScript + **Next.js (React)** + Tailwind CSS | THE standard for portfolio/marketing sites; SSR/SSG = good SEO; one place to learn TS well | TS: yes |
| **Core API** | **Java 21 + Spring Boot 3** (Spring Web, Spring Security, Spring Data JPA, Flyway) | Industry standard for enterprise REST APIs + auth; the Java you wanted to use | partly |
| **AI service** | **Python 3.12 + FastAPI** | Standard for AI/ML services; your BluHorizon RAG already lives here | no (you have it) |
| **LLM (generation)** | **Free/cheap model by default** (self-hosted Ollama, or free-tier API e.g. Groq/Gemini) + **optional BYOK** (Claude/OpenAI/…) | Zero-setup for any visitor; near-zero cost (default capped); BYOK lets technical users bring a better model; provider abstraction keeps it swappable | partly |
| **Embeddings (retrieval)** | **Sentence-Transformers** (local, **ours, fixed**) | Free, no extra API; outputs vectors for pgvector; must stay constant or search breaks — never BYOK | no |
| **Database** | **PostgreSQL 16 + pgvector** | Industry-standard relational DB; pgvector replaces FAISS so RAG + app data share one DB | yes |
| **DB migrations** | **Flyway** (Java side) | Versioned, repeatable schema — good habit + portfolio talking point | yes |
| **Auth** | **JWT** (Spring Security), httpOnly cookie; guest sessions allowed | Standard stateless auth; lets you show security skills | yes |
| **Gateway** | **nginx** (reverse-proxy in Compose; nginx-ingress in k8s) | Path-based routing to the two services; no app changes between envs | yes |
| **Containers** | **Docker** (multi-stage builds) | Required for k8s; you already use it | no |
| **Orchestration** | **Kubernetes** — kind/minikube locally → **AWS EKS** | Your headline skill goal | yes |
| **Cloud** | **AWS**: EKS, **RDS** (Postgres), ECR, ALB, Secrets Manager | The AWS skills you want | yes |
| **IaC** | **Terraform** | Standard, declarative AWS; reproducible infra to show employers | yes |
| **CI/CD** | **GitHub Actions** | Free, standard; build/test/push images, run migrations | partly |
| **Cheap live demo** | **Fly.io** or **Render** (or 1 small EC2 + Compose) | An always-on public URL without paying for EKS | yes |

## Versions / pins (proposed)
- Node 20 LTS · Next.js 14+ · TypeScript 5.x
- Java 21 (LTS) · Spring Boot 3.3+ · Maven (or Gradle)
- Python 3.12 · FastAPI (latest) · provider SDKs as needed for BYOK (e.g. `anthropic`, `openai`) · sentence-transformers (local embeddings)
- PostgreSQL 16 · `pgvector` extension
- Docker Engine + Compose v2 · kind or minikube · kubectl · Terraform 1.7+

## What you'll learn, mapped to the stack
- **TypeScript** → all of the frontend.
- **Postgres** → schema + Flyway + pgvector queries.
- **Java/Spring Boot** → the core API + JWT auth.
- **Docker** → one Dockerfile per service (you know this already).
- **Kubernetes** → Deployments, Services, Ingress, ConfigMaps/Secrets, then EKS.
- **AWS** → EKS, RDS, ECR, networking, Secrets Manager (+ Terraform to provision it).
- **Applied AI** → the RAG bot + LLM game agent (reuse + extend BluHorizon).

## Deliberately *not* now (avoid over-engineering)
- No message queue / Kafka, no Redis cache, no service mesh — add only if a feature needs it.
- No third extra microservice — two backends is enough to demonstrate the pattern.
- No managed auth provider — rolling Spring Security JWT is itself a skill to showcase.
