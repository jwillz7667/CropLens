Repository Guidelines
=====================

## Project Structure & Module Organization
- `apps/web`: Vite + React SPA containing landing, onboarding, and dashboard surfaces (`src/pages`, `src/features`, `src/components`). Shared hooks live under `src/hooks` and lib utilities under `src/lib`.
- `apps/api`: Next.js API routes in `pages/api/*` backed by Supabase helpers (`src/lib`). Geo/NDVI logic and integration clients also live under `src/lib`.
- `packages/*`: reserved for future shared libraries (currently empty but wired via npm workspaces). Global tooling and TS config sit at the repo root (`tsconfig.base.json`, `package.json`).

## Build, Test, and Development Commands
Use npm from the repo root because workspaces proxy commands into each app:
- `npm install`: installs all workspace dependencies.
- `npm run dev:web` / `npm run dev:api`: start the Vite client or Next.js API locally.
- `npm run build`: type-check + bundle the web app, then run `next build` for the API.
- `npm run lint`: runs `tsc --noEmit` across both apps for static typing.

## Coding Style & Naming Conventions
- TypeScript everywhere (React components are `.tsx`). Prefer functional components, hooks, and Tailwind utility classes.
- Keep files PascalCase for components/hooks (`FieldMap.tsx`, `useFields.ts`) and kebab-case for routes/endpoints.
- No automatic formatter is configured; stick to 2-space indentation, trailing commas where valid, and ASCII-only comments. When complex logic appears, add short comments explaining intent.

## Testing Guidelines
- Formal tests are not implemented yet. When adding them, colocate client tests under `apps/web/src/__tests__` and API tests under `apps/api/tests`.
- Favor Vitest + React Testing Library for the web app and integration tests hitting the Next API via `supertest`.
- Name specs after the module under test (e.g., `FieldMap.spec.tsx`). Ensure future PRs wire test commands into `package.json`.

## Commit & Pull Request Guidelines
- Follow the existing Conventional Commit style (`feat: …`, `fix: …`, `chore: …`). Keep subject lines under ~72 chars and describe scope clearly.
- PRs should include: summary of changes, testing evidence (`npm run build` output or test logs), screenshots/GIFs for UI tweaks, and references to roadmap tasks or GitHub issues.
- Before opening a PR, ensure `npm run build` passes and that no `.env*`, `.next`, or `dist` artifacts are committed (see `.gitignore`).

## Security & Configuration Notes
- Required secrets: Supabase URL + service role, S3 credentials, Sentinel Hub keys, Stripe secrets, Resend/Twilio keys, Sentry + PostHog tokens. Keep them in `.env.local` files within each app.
- Never log raw secrets or presigned URLs. When debugging, prefer synthetic IDs or redact sensitive fields before logging.
