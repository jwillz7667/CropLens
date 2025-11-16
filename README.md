# CropLens

Implementation of the CropLens platform described in `PROJECT-OVERVIEW.md`, featuring the marketing/dashboard SPA (React + Vite) and the serverless API (Next.js) that orchestrates NDVI processing, Sentinel Hub fetches, Supabase persistence, and Stripe/webhook integrations.

## Prerequisites

- Node.js 18+
- npm 10+
- Supabase project (Postgres + Auth)
- S3-compatible storage (AWS S3 or Supabase Storage)
- Sentinel Hub Process API key + instance ID
- Stripe account + webhook secret (for billing)
- Optional: Resend key, Twilio credentials, PostHog key, Sentry DSN

## Install dependencies

```bash
npm install
```

## Development scripts

| Command | Description |
| --- | --- |
| `npm run dev:web` | Start the Vite SPA on port `5173` |
| `npm run dev:api` | Start the Next.js API locally on port `3000` |
| `npm run build` | Build both apps |
| `npm run lint` | Type-check both workspaces |

## Frontend (apps/web)

- React 18 + Vite + TypeScript
- Tailwind CSS + Lucide icons + Framer Motion enhancements
- React Router for `/` (marketing) and `/app` (dashboard) routes
- TanStack Query handles all API calls (fields, analyses, insights)
- Leaflet map overlays render NDVI rasters + field geometry
- React Hook Form + Zod manage field onboarding + integration forms
- Upload flow (react-dropzone) requests S3 presigned URLs from the API

Configure the API base URL via `VITE_API_BASE_URL` in `apps/web/.env` when the backend runs elsewhere. By default it proxies to `/api` assuming the Next.js API is deployed on the same origin behind a reverse proxy (e.g., Vercel multi-project).

## Backend (apps/api)

- Next.js API routes only (no pages/app router)
- Supabase client for `fields`, `analyses`, `insights`, and `integrations`
- S3 uploads for both raw imagery (presigned PUT) and NDVI rasters (server uploaded)
- Sentinel Hub Process API client downloads multispectral GeoTIFFs
- `geotiff` + `pngjs` compute NDVI and generate heatmap tiles
- Weather enrichment via Open-Meteo
- Stripe webhook handler for subscription lifecycle tracking
- Resend + Twilio helpers ready for alerting flows
- PostHog + Sentry instrumentation hooks (`sentry.server.config.ts`)

### Required environment variables

Create `apps/api/.env.local` (Next.js convention) with at least:

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
S3_BUCKET=
S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SENTINEL_INSTANCE_ID=
SENTINEL_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
UPLOADS_BUCKET=
STORAGE_PUBLIC_BASE_URL=
RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
POSTHOG_API_KEY=
POSTHOG_API_HOST=
SENTRY_DSN=
ALERT_TEST_EMAIL=
```

(Only supply the integrations you plan to use; logging helpers warn if a key is missing.)

### Database expectations

Supabase tables: `fields`, `analyses`, `insights`, `integrations` as described in the overview. See `apps/api/src/lib/database-types.ts` for exact column expectations.

## Testing the flow

1. Start both apps: `npm run dev:api` in one terminal, `npm run dev:web` in another.
2. Visit `http://localhost:5173/` for the marketing experience; `/app` loads the authenticated dashboard shell.
3. Add a field with centroid + acreage; data persists to Supabase.
4. Upload a GeoTIFF via the dashboard or trigger a Sentinel run to queue NDVI processing.
5. Review NDVI stats, insight cards, and the Leaflet overlay.

## Deployment notes

- Deploy `apps/web` to Vercel/Netlify (static) with env `VITE_API_BASE_URL` pointing to the API domain.
- Deploy `apps/api` to Vercel serverless (Next.js) or AWS Lambda@Edge. Provide the same environment variables + S3/Sentinel/Stripe credentials.
- Stripe webhooks should target `/api/webhooks/stripe`.
- Configure CRON (e.g., Vercel Cron or GitHub Actions) to poll `insights` and send notifications when needed.

Refer to `PROJECT-OVERVIEW.md` for the complete product/UX specification that this code follows.
