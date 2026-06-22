# Diego's Portfolio Platform

Not a normal portfolio site — a small **distributed system** that doubles as a live demo of the
skills it describes (TypeScript, Java/Spring Boot, Python, Postgres, Docker, Kubernetes, AWS, and
applied AI/LLM work).

## What it does
- **Project showcase** — each project with description, tech stack, links, write-up.
- **"Ask Me Anything" AI bot** — a RAG chatbot grounded on Diego's resume & projects so visitors
  can ask questions and get sourced answers. Works with **zero setup** via a free/cheap default
  model; technical users can optionally **Bring-Your-Own-Key** for their own model. Retrieval
  (embeddings + pgvector) is always ours. (Reuses the BluHorizon RAG pipeline.)
- **AI mini-games** — play against an LLM opponent. Phase 1: tic-tac-toe + Connect-4 + a word game.
  Stretch: chess.
- **Accounts & feedback** — guest play (anonymous score tracking) with optional login for
  persistent stats, plus a feedback form on the portfolio itself.

## Planning docs (read in order)
1. [Architecture](docs/01-architecture.md)
2. [Tech stack](docs/02-tech-stack.md)
3. [Repo skeleton](docs/03-skeleton.md)
4. [Sprint plan](docs/04-sprint-plan.md)
5. [Decisions log](docs/05-decisions.md)

> Database table design is intentionally deferred — see the "Data" section in the architecture doc
> for the entity list we'll flesh out together.
