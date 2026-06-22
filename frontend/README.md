# Frontend (Next.js + TypeScript) — step 3

Initialize **inside this folder** with the official tool (don't hand-create the config):

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
```

Then build the routes (see docs/01-architecture.md):
- `/`                  landing / about
- `/projects`          project list
- `/projects/[slug]`   project detail (later: embed runnable demos here — outreach goal)
- `/games`             mini-games vs the LLM
- `/ask`               "Ask Me Anything" RAG chat widget

The frontend talks ONLY to the gateway:
- `/api/*` → core-api (Spring Boot)
- `/ai/*`  → ai-service (FastAPI)

Add a `Dockerfile` here when you containerize (step 2/6).
