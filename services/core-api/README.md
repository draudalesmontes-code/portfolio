# Core API (Java 21 + Spring Boot) — step 4

Generate the project with **Spring Initializr** (https://start.spring.io) and drop the
generated `pom.xml` + `src/` into this folder (the package skeleton below is already created):

- Project: **Maven**, Language: **Java 21**, Spring Boot **3.3+**
- Group: `com.diego`  ·  Artifact: `portfolio`  ·  Package: `com.diego.portfolio`
- Dependencies:
  - Spring Web
  - Spring Security
  - Spring Data JPA
  - PostgreSQL Driver
  - Flyway Migration
  - Validation
  - Spring Boot Actuator (gives you `/actuator/health`)

## Package layout (already stubbed under src/main/java/com/diego/portfolio/)
- `auth/`     — register/login, JWT filter, security config, guest sessions
- `projects/` — project showcase endpoints
- `feedback/` — feedback form persistence
- `games/`    — game sessions/scores + client to the AI service
- `common/`   — config, error handling, shared DTOs

## Database
- Flyway migrations live in `src/main/resources/db/migration/` (`V1__init.sql`, …).
- Schema is designed in **Sprint 2** — see docs/04-sprint-plan.md.
- pgvector extension is enabled separately by `db/init/01-extensions.sql`.

Add a multi-stage `Dockerfile` here when you containerize.
