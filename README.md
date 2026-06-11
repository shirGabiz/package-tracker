# Package Tracker

Personal package tracker that aggregates delivery notifications from email,
SMS, WhatsApp, and manual entry into one place so I can see status, location,
and ETA for every parcel.

> **Status:** Bootstrapping. See [ADR-0001](./docs/adr/0001-initial-architecture.md)
> for the architecture decisions driving this repo.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + TypeScript, MSAL for Azure AD B2C, hosted on Azure Static Web Apps |
| Backend | NestJS + Prisma (TypeScript), hosted on Azure App Service |
| Database | Azure SQL Database (Serverless tier) |
| Auth | Azure AD B2C (OIDC + PKCE) |
| Infra | Bicep templates in `infra/` |
| CI/CD | GitHub Actions |

## Repository layout

```
package-tracker/
├── apps/
│   ├── api/              # NestJS backend
│   └── web/              # React + Vite frontend
├── packages/
│   └── shared/           # Shared TypeScript types / DTOs
├── infra/                # Bicep modules per Azure resource
├── docs/
│   └── adr/              # Architecture decision records
└── .github/workflows/    # CI + deploy pipelines
```

## Getting started

> Tooling expected: Node.js 20+, npm 10+, Azure CLI (for infra/deploy).

```bash
# install dependencies for all workspaces
npm install

# run the backend (NestJS) in watch mode
npm run dev:api

# run the frontend (Vite) in dev mode
npm run dev:web
```

Environment variables go in `apps/api/.env` and `apps/web/.env.local`.
See each app's README for the required keys.

## Roadmap

1. **MVP (in progress)** — manual entry, list/detail views, single user auth
2. Email ingestion (Microsoft Graph / Gmail)
3. SMS + WhatsApp ingestion (Twilio webhook)
4. Notification parsing (per-carrier regex, then LLM fallback)
5. Mobile-friendly PWA polish
