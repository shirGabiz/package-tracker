# ADR-0001: Initial Architecture for Package Tracker

- **Status:** Proposed
- **Date:** 2026-06-11
- **Deciders:** @shirGabiz

## Context

I receive package / delivery notifications from many sources (email, SMS,
WhatsApp, occasional manual updates from people). Today I have no single
place to:

- See which packages are in flight, delivered, or stuck
- Know where each package is and when it is expected
- Track historical deliveries
- Avoid losing notifications buried in email/chat threads

I want a small personal web app that aggregates these notifications into one
inbox, lets me confirm/edit them, and shows the status of each package over
time. Email/SMS/WhatsApp ingestion is complex (OAuth, webhooks, parsing) so
the first milestone is an MVP with **manual entry only**, with the data model
designed so ingestion adapters can be added later without breaking changes.

Non-functional goals:

- Hosted in Azure (per personal preference / existing familiarity)
- Free or near-free tier on all services while in MVP
- Single-user authentication for now, but multi-user-ready data model
- Reproducible infrastructure (infra-as-code) so I can tear down / rebuild
- CI/CD from `main` so I don't deploy by hand

## Decision

### High-level architecture

```
[ React SPA ]  ── HTTPS ──▶  [ NestJS API ]  ── TCP ──▶  [ Azure SQL ]
       │                          │
       │                          └── (future) ingestion workers
       │                                 ├── Email (Microsoft Graph / Gmail API)
       │                                 ├── SMS (Twilio webhook)
       │                                 └── WhatsApp (Twilio / Meta Cloud API)
       │
       └── Auth via Azure AD B2C (OIDC, PKCE)
```

### Frontend

- **React + Vite + TypeScript** SPA
- **TanStack Query** for server state, **React Router** for routing
- **MSAL.js** (`@azure/msal-react`) for Azure AD B2C login
- UI library: **Material UI** (good defaults, accessible, themeable)
- Hosted as a static site on **Azure Static Web Apps** (free tier)

### Backend

- **Node.js 20 + NestJS + TypeScript**
- REST API under `/api/v1`, OpenAPI spec auto-generated via `@nestjs/swagger`
- **Prisma ORM** against Azure SQL with migrations checked into the repo
- Validates JWTs issued by Azure AD B2C using `passport-azure-ad`
- Hosted on **Azure App Service (Linux, B1)** — can scale down to F1 for cost

### Database

- **Azure SQL Database**, Serverless tier (auto-pause when idle → cheap)
- Schema (initial):
  - `users` — id, b2c_object_id, email, display_name, created_at
  - `packages` — id, user_id, title, tracking_number, carrier, source,
    expected_at, delivered_at, status, notes
  - `package_events` — id, package_id, event_type, location, occurred_at,
    raw_payload (JSON)
  - `inbox_entries` — id, user_id, channel (email/sms/whatsapp/manual),
    raw_message, parsed_at, package_id (nullable until confirmed)
- Migrations via `prisma migrate` run during CI/CD deploy

### Authentication

- **Azure AD B2C** with built-in user flows (sign-up/sign-in, password reset)
- Frontend uses **OIDC + PKCE** via MSAL; backend validates access tokens
- Identity providers enabled: email/password (MVP), Google later
- App registrations: one for SPA, one for API (with custom scope
  `api://package-tracker/access`)

### Cloud deployment

- **GitHub Actions** for CI/CD:
  - PR pipeline: lint, typecheck, test, build (FE + BE)
  - `main` pipeline: build, run Prisma migrations, deploy API to App Service,
    deploy SPA to Static Web Apps
- **Bicep** templates in `infra/` provision: Resource Group, Azure SQL Server
  + DB, App Service Plan + App Service, Static Web App, AD B2C tenant
  reference, Application Insights, Key Vault for secrets
- Secrets (DB connection string, B2C client secret) live in Key Vault and
  are referenced by App Service via Managed Identity

### Repository layout

```
package-tracker/
├── apps/
│   ├── api/        # NestJS backend
│   └── web/        # React + Vite frontend
├── packages/
│   └── shared/     # Shared TS types (DTOs)
├── infra/          # Bicep modules + parameters per env (dev, prod)
├── docs/
│   └── adr/        # Architecture decision records
├── .github/workflows/
└── package.json    # npm workspaces
```

## Alternatives considered

| Area | Alternative | Why not (for now) |
|------|-------------|-------------------|
| BE framework | Express / Fastify | Less structure for future modules (ingestion, jobs) |
| BE language | Python FastAPI / .NET | TS everywhere = shared DTOs with FE, single toolchain |
| Database | Cosmos DB (NoSQL) | Relational fits packages/events/users cleanly |
| Database | Azure PostgreSQL Flexible | Azure SQL Serverless has better idle-cost profile for personal use |
| Auth | Auth0 | B2C is native to Azure, cheaper at low volume |
| Auth | Roll-your-own JWT | Avoid storing passwords; B2C handles password reset, MFA |
| Hosting | Azure Container Apps | Overkill for MVP; App Service is simpler |
| Monorepo tool | Nx / Turborepo | npm workspaces are enough for two apps; can adopt later |

## Consequences

**Positive**
- One language (TypeScript) across FE/BE/shared types
- Cheap to run while idle (SQL Serverless auto-pause, Static Web Apps free,
  App Service B1 / F1)
- Auth, secrets, monitoring all use managed Azure services — less code to own
- Data model already accounts for multi-channel ingestion, so MVP work is
  not throwaway

**Negative / trade-offs**
- Azure SQL Serverless has cold-start latency (~few seconds) after auto-pause
- Azure AD B2C UX is functional but not as polished as Auth0's hosted pages
- Bicep + multiple Azure resources = more upfront infra work than a single
  PaaS like Vercel + Supabase

**Follow-up ADRs (planned)**
- ADR-0002: Email ingestion adapter (Microsoft Graph vs Gmail API vs IMAP)
- ADR-0003: SMS / WhatsApp ingestion (Twilio vs Meta Cloud API)
- ADR-0004: Notification parsing strategy (regex per carrier vs LLM extraction)
