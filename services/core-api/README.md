# Core API (Java 21 + Spring Boot) — step 4

Generate the project with **Spring Initializr** (https://start.spring.io) and drop the
generated `build.gradle` + `settings.gradle` + `gradlew` + `src/` into this folder
(the package skeleton below is already created):

- Project: **Gradle - Kotlin** (`build.gradle.kts`), Language: **Java 21**, Spring Boot **3.5.15**
- Group: `com.diego`  ·  Artifact: `portfolio`  ·  Package: `com.diego.portfolio`
## Dependencies (and why)

Core set (add all 7):

| Dependency | Why we need it |
|---|---|
| **Spring Web** | REST controllers + embedded Tomcat + JSON for every `/api/*` endpoint. Also bundles `RestClient`, used for the server-to-server call to the FastAPI AI service — so no separate HTTP client is needed. |
| **Spring Security** | Login/register, BCrypt password hashing, JWT issue/validate, guest sessions, endpoint protection. |
| **Spring Data JPA** | Repository/ORM (Hibernate) over `users`, `projects`, `feedback`, `game_sessions` — no hand-written SQL. |
| **PostgreSQL Driver** | The JDBC driver that actually connects JPA/Hibernate to the Postgres container. |
| **Flyway Migration** | Versioned schema migrations (`V1__init.sql`, …) in `src/main/resources/db/migration/`; runs on startup, schema tracked in git. |
| **Validation** | Bean Validation (`@Valid`, `@NotBlank`, `@Email`) on request bodies (feedback form, register) → clean 400s. |
| **Spring Boot Actuator** | `/actuator/health` for the walking-skeleton health check and k8s liveness/readiness probes. |

Optional (convenience only — add if you want them):
- **Lombok** — generates getters/setters/builders to cut entity/DTO boilerplate.
- **Spring Boot DevTools** — auto-restart on code change during local dev.

Deliberately NOT added:
- **No pgvector/vector dependency** — embeddings + vector search live entirely in the Python AI
  service; core-api only touches relational tables, so the plain Postgres driver suffices.
- **No extra HTTP client** (RestTemplate/WebClient/OkHttp) — `RestClient` ships with Spring Web.

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
