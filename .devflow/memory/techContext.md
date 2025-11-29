---
created: 2025-11-29
category: technical-setup
---

# Technical Context — Devflow

This file captures the concrete technical choices, local setup, and constraints for Devflow. Use it as the single-source-of-truth for onboarding contributors and maintainers on how to run and operate the project.

## Snapshot (one-line)

Devflow is implemented primarily in TypeScript with a repo-first approach (templates + GitHub Actions) and an optional lightweight orchestration service backed by Postgres + Redis. The repo uses Bun tooling where available but remains compatible with Node/npm workflows.

## Core tech stack

- Languages: TypeScript (primary), small helper scripts may use Bash.
- Runtime: Node.js 18+ (Node 20 recommended). Bun is supported for local developer ergonomics (repository contains `bun.lock` and `bunfig.toml`).
- Frameworks / libraries:
    - Backend: Fastify or Express-style minimal HTTP layer (implementation-agnostic; prefer Fastify for perf).
    - Job queue: Redis + BullMQ (workers).
    - DB: PostgreSQL (primary state for orchestration).
    - Caching / ephemeral state: Redis.
- CI: GitHub Actions (primary CI environment).
- Auth: GitHub OAuth / GitHub Apps for automation.
- Local tooling: A lightweight CLI / local-runner to validate templates and run a subset of CI checks locally.
- Linting & formatting: ESLint + Prettier.
- Type checking: TypeScript (tsc) and optionally eslint-type-checking rules.
- Testing: Jest or Vitest for unit tests; Playwright for any E2E if UI surfaces exist.

## Repository conventions

- Package manager: Bun is first-class (use `bun install`, `bun run`); fallback to `npm` or `pnpm` is supported.
- Monorepo: Project is organized to allow modular packages and adapters (if you add packages, follow existing structure).
- Branching: Use trunk-based or GitHub Flow (short-lived feature branches, PR reviews required).
- Commits: Conventional commits recommended (helps with automated changelogs).

## Local development — quick start

Prereqs:

- Node.js 18+ or Bun (recommended: Bun v1.x compatible with the repo lockfiles)
- PostgreSQL (local or container) for orchestration service (optional if you only use repo assets)
- Redis (for job queue; optional if you don't run workers)
- Git

Typical commands (adapt depending on package manager):

- Install dependencies (bun)
    - `bun install`
- If using npm:
    - `npm ci`
- Run typecheck
    - `bun run typecheck` or `npm run typecheck`
- Run lint
    - `bun run lint` or `npm run lint`
- Run unit tests
    - `bun run test` or `npm test`
- Start local dev server (orchestration service)
    - `bun run dev` or `npm run dev`

If you use Docker for local DB/services, the repo may include docker-compose snippets under `devflow/examples` or `devflow/scripts`. Use those to bring up Postgres + Redis quickly.

## Environment variables

Example minimal set for local orchestration service (do not check secrets into git):

- `NODE_ENV=development`
- `DATABASE_URL=postgres://devflow:password@localhost:5432/devflow`
- `REDIS_URL=redis://localhost:6379`
- `GITHUB_APP_ID=<app id>` (if using a GitHub App)
- `GITHUB_PRIVATE_KEY_PATH=./secrets/github.pem`
- `GITHUB_OAUTH_CLIENT_ID` (for maintainer auth flows)
- `GITHUB_OAUTH_CLIENT_SECRET`
- `TELEMETRY_ENABLED=false` (default: opt-in false)
- `PORT=3000`

Document additional env vars in `.env.example` or repo README. Keep sensitive values in GitHub Secrets for CI.

## Database & migrations

- Primary DB: PostgreSQL (12+; prefer 14/15 in production).
- Use a migrations tool (eg. `node-pg-migrate`, `knex`, or `prisma migrate`) — pick one consistently.
- Local developer workflow:
    - Create a local DB (`createdb devflow` or via docker-compose).
    - Run migrations: `bun run migrate:up` or `npm run migrate`.

## CI / GitHub Actions

- CI enforces:
    - Typechecking
    - Linting
    - Unit tests
    - Baseline integration checks (fast)
- Actions are used for repo-first behaviors (e.g., template validation, auto-labeling via workflows).
- Keep GitHub Actions workflows slim and fast — prefer orchestration service for heavier async flows.

## Observability & telemetry

- Telemetry is opt-in and anonymized.
- Minimal recommended metrics:
    - Guided PR count
    - Time-to-first-merge (guided)
    - Baseline CI pass rate
    - Queue depth / worker error rate
- Logging: structured JSON logs with correlation ids for orchestration service.
- Use Prometheus + Grafana or a managed APM for production grade metrics if you run the orchestration service in production.

## Security & secrets

- Use GitHub Secrets to store tokens for Actions.
- Prefer GitHub App model or short-lived tokens over long-lived personal tokens.
- Never commit private keys or secrets to the repo.
- Telemetry only collected when `TELEMETRY_ENABLED=true` and should be documented for maintainers.

## Operational guidance (orchestration service)

- The orchestration service is optional. Core value should be available from repository templates + Actions alone.
- If you run the service:
    - Provision small Postgres and Redis instances.
    - Keep horizontal scaling for workers to handle spike loads.
    - Monitor GitHub API rate limits and implement appropriate retry/backoff and batching.
- Backup Postgres regularly and set reasonable retention for telemetry.

## Testing strategy

- Unit tests: cover business logic, rule evaluation, and adapters.
- Integration tests: spin up Postgres + Redis (docker-compose) for critical paths like rule evaluation → worker → GitHub API mock.
- E2E tests: where applicable, validate the contributor flow (local runner → PR templates → Actions). Use Playwright or another lightweight E2E tool if UI exists.

## Dependency management

- Use lockfiles (`bun.lockb` / `package-lock.json`) and dependabot or similar to keep dependencies up to date.
- Follow semantic versioning for public packages or CLI tools.
- Regularly audit dependencies for security vulnerabilities.

## Performance & scalability constraints

- Design the orchestration service to be horizontally scalable.
- Primary potential bottlenecks:
    - GitHub API rate limits: batch operations and respect library-exposed rate info.
    - Worker processing throughput: scale workers; ensure idempotency of handlers.
    - DB connection limits: use pooling and sensible timeouts.

## Backwards compatibility & upgrade policy

- Keep repository templates backward-compatible where possible.
- When changing critical behavior (eg. PR templates that affect CI gating), document migration steps and provide an upgrade guide.
- Prefer additive, opt-in changes for default templates.

## Developer ergonomics & recommended editor tooling

- Editor: VS Code recommended with:
    - ESLint extension
    - TypeScript tooling
    - Prettier extension
- Git hooks: use Husky for lint-staged and pre-commit formatting checks.
- Local runner: use it to validate contributor-facing flows before opening PRs.

## Suggested infra (small-medium OSS project)

- Managed Postgres (small instance / free tier)
- Managed Redis (or small VM)
- GitHub Actions for CI
- Optional: lightweight VPS or serverless instance for orchestration service

## Notes & constraints

- Focus on GitHub-first experience; other VCS providers are out-of-scope for initial releases.
- Telemetry must remain opt-in to preserve community trust.
- Keep the "repo-first" experience functional without running any additional services — orchestration should add convenience and automation, not be required for baseline value.

## Useful commands (examples to add to README or CONTRIBUTING)

- Install deps (Bun): `bun install`
- Typecheck: `bun run typecheck`
- Lint: `bun run lint`
- Test: `bun test`
- Dev server: `bun run dev`
- Migrate DB: `bun run migrate:up`
- Run workers: `bun run worker`

---

Keep this document up-to-date as the project evolves (add exact versions, new infra components, and any major architecture changes).
