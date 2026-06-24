# ─────────────────────────────────────────────────────────────────────
# Stage 1 — BUILD: compile the app into an executable jar using the JDK + Gradle.
# This stage is heavy (JDK, Gradle, your source, the build cache) but it's
# THROWN AWAY — only the jar it produces is carried forward to stage 2.
# ─────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy the Gradle wrapper + build config first (changes rarely) for layer caching.
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle gradle

# Copy the source last (changes often).
COPY src src

# Build only the executable boot jar. We use `bootJar` (not `build`) so it does
# NOT run tests — tests would need a live database, which isn't available here.
RUN chmod +x gradlew && ./gradlew clean bootJar --no-daemon

# ─────────────────────────────────────────────────────────────────────
# Stage 2 — RUNTIME: a small JRE image that contains ONLY the finished jar.
# No JDK, no Gradle, no source → much smaller, production-grade image.
# ─────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Pull just the jar from the build stage (bootJar produces a single *.jar).
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
