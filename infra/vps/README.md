# Production VPS deployment

This is the inexpensive production path for the complete portfolio stack:

```text
Internet
   |
   | HTTPS :443
   v
Caddy (automatic TLS)
   |
   v
nginx (routing + rate limits)
   |-------- /api/* --> Spring Boot
   |-------- /ai/*  --> FastAPI
   `-------- /*     --> Next.js

Private Docker network: PostgreSQL + Redis
```

Only ports `80` and `443` are published. PostgreSQL, Redis, Spring Boot,
FastAPI, Next.js, and nginx remain private.

## Hosting choice

### Recommended for deploying today

Use an Ubuntu x86-64 VPS with at least:

- 4 shared vCPUs
- 8 GB RAM
- 80 GB SSD

The AI embedding model, JVM, Next.js, PostgreSQL, and image builds make 8 GB
the comfortable size. Hetzner's CX33 class is usually the least expensive
reliable fit. DigitalOcean is easier for some users, but its comparable 4 GB
and 8 GB plans cost substantially more.

### Free option

Oracle Cloud's Always Free Ampere A1 allocation can run this stack if capacity
is available in your home region. Choose Ubuntu Arm64 and allocate enough of
the monthly Always Free OCPU/RAM allowance to one VM. Account approval and
instance capacity are less predictable, so this is not the safest same-day
option.

Render's free services are not a good fit: each free service has little RAM,
and the free PostgreSQL database is time-limited.

## 1. Create the server

Create an Ubuntu 24.04 server and add your SSH public key. At the provider
firewall, allow inbound:

| Port | Purpose |
| --- | --- |
| `22/tcp` | SSH |
| `80/tcp` | HTTP redirect and certificate validation |
| `443/tcp` | HTTPS |
| `443/udp` | HTTP/3 |

Do not expose PostgreSQL (`5432`), Redis (`6379`), Spring (`8080`), FastAPI
(`8000`), or Next.js (`3000`).

Install Git and Docker Engine using Docker's official Ubuntu instructions:

<https://docs.docker.com/engine/install/ubuntu/>

Confirm:

```bash
docker --version
docker compose version
git --version
```

## 2. Choose a hostname

### Custom domain

Create an `A` record pointing your domain or subdomain to the VPS IPv4:

```text
portfolio.example.com -> 203.0.113.10
```

### Free temporary hostname

If the VPS address is `203.0.113.10`, use:

```text
portfolio-203-0-113-10.sslip.io
```

`sslip.io` extracts the embedded address and resolves the hostname to the VPS.
This is useful for launching immediately, but a domain you control is better
for a permanent portfolio and email reputation.

## 3. Clone and configure

```bash
git clone YOUR_REPOSITORY_URL portfolio
cd portfolio
cp infra/vps/production.env.example .env.production
chmod 600 .env.production
nano .env.production
```

Generate safe values:

```bash
openssl rand -hex 32
openssl rand -base64 48
```

Use the hexadecimal value for `POSTGRES_PASSWORD` and the Base64 value for
`JWT_SECRET`.

The hostname fields must agree:

```dotenv
DOMAIN=portfolio.example.com
BASE_URL=https://portfolio.example.com
```

Important production values:

```dotenv
POSTGRES_PASSWORD=...
JWT_SECRET=...
RESEND_API_KEY=...
RESEND_FROM="Portfolio <portfolio@your-verified-domain.example>"
GROQ_API_KEY=...
```

Never commit `.env.production`.

## 4. Deploy

```bash
./infra/vps/deploy.sh
```

The script validates the environment, builds the images, starts the services,
and recreates nginx after application updates so it cannot retain stale Docker
addresses.

Caddy obtains and renews the HTTPS certificate automatically. Certificate
issuance requires the hostname to resolve to the server and ports `80` and
`443` to be publicly reachable.

The first AI startup may take several minutes while the embedding model is
downloaded into its persistent cache.

## 5. Check the deployment

```bash
docker compose \
  --env-file .env.production \
  -f infra/vps/compose.yml \
  ps
```

```bash
docker compose \
  --env-file .env.production \
  -f infra/vps/compose.yml \
  logs --tail=200 caddy gateway core-api ai-service frontend
```

Health checks:

```bash
curl https://YOUR_DOMAIN/api/actuator/health
curl https://YOUR_DOMAIN/ai/health
curl --head https://YOUR_DOMAIN/games
```

## Updating

```bash
git pull --ff-only
./infra/vps/deploy.sh
```

## Database backups

Create a compressed PostgreSQL backup:

```bash
./infra/vps/backup.sh
```

Backups are written to `infra/vps/backups/`, retained locally for seven days,
and ignored by Git. Copy backups to a different machine or object-storage
provider; a backup stored only on the VPS will be lost if the VPS disk fails.

Example daily cron entry:

```cron
0 3 * * * /home/deploy/portfolio/infra/vps/backup.sh >> /home/deploy/portfolio/backup.log 2>&1
```

Restore a backup only during a maintenance window:

```bash
docker compose \
  --env-file .env.production \
  -f infra/vps/compose.yml \
  exec -T db \
  pg_restore \
  --username folioAdmin \
  --dbname portfolio \
  --clean \
  --if-exists < infra/vps/backups/portfolio-TIMESTAMP.dump
```

## Useful operations

```bash
# Follow logs
docker compose --env-file .env.production -f infra/vps/compose.yml logs -f

# Restart one service, then refresh nginx's Docker DNS resolution
docker compose --env-file .env.production -f infra/vps/compose.yml restart core-api
docker compose --env-file .env.production -f infra/vps/compose.yml up -d --force-recreate gateway caddy

# Stop without deleting persistent data
docker compose --env-file .env.production -f infra/vps/compose.yml down
```

Do not run `docker compose down --volumes` in production unless you intend to
delete the database, Redis data, model cache, and TLS certificate data.
