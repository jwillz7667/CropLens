Below is a focused, implementation-ready spec for **CropLens**: from product + UX all the way down to internal and external APIs and the modern UI/UX stack.

---

## 1. Product Overview

**Name:** CropLens
**Core Value:** Simple, actionable crop health insights from drone/satellite imagery for small–mid size farmers and agronomists.

**Key Capabilities:**

* Upload drone images (orthomosaics or individual tiles) per field.
* Pull recent satellite imagery per field via API.
* Compute NDVI (and later other indexes) and render map overlays.
* Generate simple recommendations (“North section is dry; irrigate by Tuesday.”).
* Store historical analyses and show trends over time.
* Notifications/alerts via email/SMS.
* Freemium for limited acreage; tiered plans for more acres & features.

**Primary Personas:**

* **Farmer / Grower (Owner/Operator)**
* **Agronomist / Crop Consultant**
* **Farm Manager (multi-farm organization)**

---

## 2. High-Level Architecture

You’ll have **two deployable apps**:

1. **Marketing + Dashboard SPA**

   * **Frontend:** React + Vite SPA
   * Hosts: Landing page + authenticated dashboard UI.
   * Deployed on Vercel / Netlify / Cloudflare Pages.

2. **Backend API (Serverless)**

   * **Backend:** Next.js (API routes only) or pure Node serverless functions (e.g., Vercel Functions / AWS Lambda).
   * Responsible for auth integration, business logic, NDVI processing orchestration, external API calls, billing webhooks.

**Core Infrastructure:**

* **Auth & DB:** Supabase (Postgres + Supabase Auth)
* **File Storage:** S3-compatible storage (AWS S3 / Supabase Storage) for image uploads
* **Payments:** Stripe
* **Email:** Resend or SendGrid
* **SMS:** Twilio
* **Satellite Imagery:** Sentinel Hub Process API (or similar provider)
* **Weather:** Open-Meteo or OpenWeather API
* **Analytics & Telemetry:** PostHog (product analytics) + Sentry (error tracking)

---

## 3. Frontend Spec (React + Vite)

### 3.1 Core Frontend Stack

* **Build Tool:** Vite + React 18+
* **Language:** TypeScript
* **Styling & Design System:**

  * Tailwind CSS
  * shadcn/ui (Radix-based component library)
  * Tailwind variants for design tokens (e.g., `class-variance-authority`)
* **UI/UX Enhancements:**

  * Framer Motion (micro-animations, transitions)
  * React Icons or Lucide React for iconography
* **Routing & State:**

  * React Router (app-level routing)
  * TanStack Query (React Query) for data fetching & caching
  * Zustand or Jotai for light global UI state (theme, layout preferences)
* **Forms & Validation:**

  * react-hook-form
  * Zod for schema validation
* **Data Viz & Maps:**

  * Mapbox GL JS or React-Leaflet for map view
  * Recharts or Tremor for charts (NDVI trends, field stats)
* **File Upload:**

  * uploadthing or custom S3 direct-upload integration

### 3.2 Landing Page (Public)

**Route:** `/`

Sections:

1. **Hero:**

   * Tagline: “See your fields clearly. Act before it’s too late.”
   * CTA buttons: “Start Free” / “View Demo”
   * Background: animated NDVI map / parallax drone imagery (Framer Motion).

2. **How It Works:**

   * 3 steps (Upload → Analyze → Act).
   * Animated cards with icons.

3. **Features:**

   * Field-level NDVI heatmaps
   * Irrigation & stress alerts
   * Historical insights and trends
   * Drone & satellite support

4. **Pricing:**

   * Free tier (X fields / Y acres / limited analyses)
   * Pro & Business tiers (more acres, multi-user, priority processing).

5. **Testimonials / Logos:**

   * Early adopter quotes.

6. **FAQ & Footer:**

   * Links to docs, support, privacy, terms.

### 3.3 Auth & Onboarding

**Routes:**

* `/login`
* `/signup`
* `/onboarding`

Use **Supabase Auth** with email/password + magic link; optionally OAuth (Google, Microsoft) later.

Onboarding Flow:

* Collect:

  * Farm name
  * Location (country, region)
  * Typical crops
  * Approx. acreage
* Create initial **Farm** and default **Field** polygons (optionally allow drawing boundaries on a map).

### 3.4 Dashboard UI

**Layout:**
Persistent left sidebar + top bar.

* **Sidebar**:

  * Farm switcher
  * Links: Overview, Fields, Imagery, Insights, Alerts, Billing, Settings.

* **Top bar**:

  * User avatar/menu
  * Notifications bell
  * Theme toggle (light/dark)

**Key Screens:**

1. **Overview (`/dashboard`)**

   * Map showing all fields with NDVI-colored polygon overlays.
   * Cards:

     * Active Alerts (e.g., “Field North: low NDVI in north section”)
     * Last Imagery Date
     * Acres monitored in current billing cycle
   * NDVI trend chart (last 30 days for selected field).

2. **Fields (`/dashboard/fields`)**

   * Table of fields with:

     * Name
     * Crop type
     * Area
     * Last analysis date
     * Health status badge (Good / Watch / Critical)
   * Button: “Add Field” (map draw polygon wizard using Mapbox/Leaflet).
   * Field detail view: polygon on map with latest NDVI overlay + last 3 analyses.

3. **Imagery (`/dashboard/imagery`)**

   * Tabs: **Drone Upload** / **Satellite**.
   * Drone:

     * Drag-and-drop area for image upload.
     * Show upload progress, validation (size, geo-tag check if available).
   * Satellite:

     * Date selector & provider (e.g., Sentinel).
     * “Fetch latest good image” button.

4. **Insights (`/dashboard/insights`)**

   * Cards with actionable recommendations:

     * “Field A – irrigate north section within 3 days.”
     * “Field B – potential nitrogen deficiency in east patch.”
   * Filter by field & severity.
   * Each insight links to the corresponding analysis map.

5. **Alerts (`/dashboard/alerts`)**

   * Alert configuration:

     * Thresholds for NDVI change, absolute NDVI, etc.
     * Alert channels: Email, SMS.
   * List of historical alerts with status (acknowledged / dismissed).

6. **Billing (`/dashboard/billing`)**

   * Current plan, usage (acres, analyses).
   * Stripe customer portal embedded link.

7. **Settings (`/dashboard/settings`)**

   * Profile, language, time zone.
   * Units (metric/imperial).
   * API keys (for future advanced users).

---

## 4. Backend Spec (Next.js Serverless API)

### 4.1 Core Backend Stack

* Next.js (API routes only) with TypeScript
* Supabase client for DB/Auth
* Prisma ORM (optional but recommended) against Supabase Postgres
* Node bindings for:

  * AWS SDK or Supabase Storage SDK
  * Stripe Node SDK
  * Twilio Node SDK
  * Resend / SendGrid Node SDK
  * External imagery/NDVI libs:

    * OpenCV (via opencv4nodejs or using a separate worker container)
    * `ndvi` calculation logic in Node or Python via a microservice (if needed)

Deployed as:

* Vercel functions (or AWS Lambda + API Gateway).

### 4.2 Data Model (Main Entities)

Core tables (in Supabase / Postgres):

* **users**

  * id (uuid, from Supabase)
  * email
  * name
  * role (owner, admin, viewer)
  * created_at, updated_at

* **farms**

  * id (uuid)
  * owner_id (fk → users.id)
  * name
  * location (text)
  * geometry (GeoJSON for farm boundary)
  * created_at, updated_at

* **fields**

  * id (uuid)
  * farm_id (fk → farms.id)
  * name
  * crop_type
  * geometry (GeoJSON polygon)
  * area_ha
  * created_at, updated_at

* **imagery_sources**

  * id (uuid)
  * field_id (fk → fields.id)
  * type (enum: `drone`, `satellite`)
  * provider (e.g., `upload`, `sentinel`)
  * uri (URL to image / mosaic)
  * capture_date (timestamp)
  * metadata (jsonb – resolution, cloud cover, etc.)
  * created_at

* **analyses**

  * id (uuid)
  * field_id (fk → fields.id)
  * imagery_id (fk → imagery_sources.id)
  * ndvi_raster_uri (URL to NDVI image/tiles)
  * summary_stats (jsonb: avg_ndvi, min_ndvi, max_ndvi, low_ndvi_area_pct, etc.)
  * status (pending/running/completed/failed)
  * created_at, updated_at

* **insights**

  * id (uuid)
  * analysis_id (fk → analyses.id)
  * type (e.g., `irrigation`, `stress`, `anomaly`)
  * severity (low/medium/high)
  * message (text)
  * actions (jsonb)
  * created_at

* **alerts**

  * id (uuid)
  * user_id (fk → users.id)
  * field_id (fk → fields.id)
  * type (threshold/time-based)
  * config (jsonb – threshold values, channels)
  * active (bool)
  * created_at, updated_at

* **subscriptions**

  * id (uuid)
  * user_id (fk → users.id)
  * stripe_customer_id
  * stripe_subscription_id
  * plan (free/pro/business)
  * status
  * current_period_end
  * acreage_limit
  * created_at, updated_at

---

## 5. Internal API Endpoints (Your Backend)

All routes under `/api`, typically secured with Supabase JWT.

### 5.1 Auth & User

Supabase handles core auth; API just reads user from JWT. Minimal endpoints:

* `GET /api/me`
  Returns current user profile & subscription info.

### 5.2 Farms & Fields

* `GET /api/farms`
  Returns list of farms for current user.

* `POST /api/farms`
  Body: `{ name, location, geometry }`
  Creates a new farm.

* `GET /api/farms/:farmId`
  Get farm detail.

* `PATCH /api/farms/:farmId`
  Update farm meta.

* `GET /api/farms/:farmId/fields`
  Get all fields for a farm.

* `POST /api/farms/:farmId/fields`
  Body: `{ name, crop_type, geometry }`
  Creates field (includes area calculation).

* `GET /api/fields/:fieldId`
  Field detail.

* `PATCH /api/fields/:fieldId`
  Update field.

* `DELETE /api/fields/:fieldId`
  Soft delete a field.

### 5.3 Imagery Handling

#### Drone Upload

* `POST /api/fields/:fieldId/imagery/upload-url`
  Returns a pre-signed URL to upload image (S3 or Supabase Storage).
  Body: `{ fileName, contentType }`
  Response: `{ uploadUrl, fileUrl }`

* `POST /api/fields/:fieldId/imagery`
  Body: `{ type: "drone", provider: "upload", uri, capture_date, metadata }`
  Creates imagery record; triggers NDVI analysis job.

#### Satellite Imagery

* `POST /api/fields/:fieldId/imagery/satellite`
  Body: `{ provider: "sentinel", dateRange?, cloudCoverMax? }`
  Backend:

  * Calls external satellite API (e.g., Sentinel Hub Process API).
  * Stores result (URI to imagery).
  * Creates imagery record and triggers NDVI analysis.
    Response: imagery record with status.

* `GET /api/fields/:fieldId/imagery`
  List imagery records for a field (paginated).

* `GET /api/imagery/:imageryId`
  Imagery detail (including NDVI analysis link if created).

### 5.4 Analysis & Insights

* `POST /api/analysis`
  Body: `{ fieldId, imageryId }`
  Triggers NDVI calculation; performs:

  * Download imagery
  * Compute NDVI
  * Generate NDVI overlay and summary_stats
  * Store `analyses` row and optional `insights`.
    Response: analysis job ID.

* `GET /api/analysis/:analysisId`
  Returns analysis details (status, NDVI stats, links to NDVI raster, insights).

* `GET /api/fields/:fieldId/analysis`
  Returns list of analyses for field.

* `GET /api/fields/:fieldId/insights`
  Returns insights based on latest analysis (or all with filters).

### 5.5 Alerts & Notifications

* `GET /api/alerts/config`
  Returns current alert configurations for user.

* `POST /api/alerts/config`
  Body example:

  ```json
  {
    "fieldId": "uuid",
    "type": "ndvi_threshold",
    "config": { "threshold": 0.35, "direction": "below" },
    "channels": ["email", "sms"]
  }
  ```

* `DELETE /api/alerts/config/:alertId`

**Webhook Consumers (server-only):**

* `/api/webhooks/email-bounce` (if using a provider that sends bounce events).
* Scheduled job (e.g., cron) to:

  * Check new analyses against alert configs.
  * Send email/SMS using Resend/Twilio.

### 5.6 Billing (Stripe)

* `POST /api/billing/create-checkout-session`
  Body: `{ planId }`
  Creates Stripe Checkout session; returns `checkoutUrl`.

* `GET /api/billing/portal`
  Creates Stripe customer portal session; returns URL.

* `POST /api/webhooks/stripe`
  Stripe webhook for:

  * `checkout.session.completed`
  * `invoice.paid`
  * `customer.subscription.updated`
  * `customer.subscription.deleted`
    Updates `subscriptions` table and acreage limits accordingly.

### 5.7 Misc / Utilities

* `GET /api/fields/:fieldId/usage`
  Returns acreage and analysis usage vs plan limits.

* `GET /api/weather/:fieldId`
  Proxies weather forecast for the field, using external weather API.

---

## 6. External APIs & Services to Integrate

### 6.1 Satellite Imagery

**Preferred:**

* **Sentinel Hub Process API**

  * Endpoint: `POST https://services.sentinel-hub.com/api/v1/process`
  * You send AOI polygon + time range + band configuration (NIR, Red).
  * Response: image in requested format (GeoTIFF/PNG).

Alternative / Additional:

* Google Earth Engine (more overhead/permissions).
* Microsoft Planetary Computer (STAC + analysis, but more complex).
* Public USGS/NASA APIs (Landsat data).

### 6.2 Weather

* **Open-Meteo** (free, no key): hourly/daily forecast based on lat/lon.
* Or **OpenWeatherMap** for more features.

Used to:

* Enhance recommendations (e.g., “rain already forecast Tuesday – irrigation not necessary”).

### 6.3 Payments: Stripe

* Checkout & Billing portal.
* Webhooks to manage subscription state and acreage limits.

### 6.4 Notifications

* **Email:** Resend / SendGrid (transactional alerts, onboarding emails).

  * API: `POST /emails` with template ID or raw HTML.

* **SMS:** Twilio

  * API: `POST /2010-04-01/Accounts/{AccountSid}/Messages.json`

### 6.5 Auth & DB

* **Supabase**:

  * Auth (JWT-based).
  * Postgres DB.
  * Storage (optional alternative to S3).

### 6.6 Analytics & Monitoring

* **PostHog**: product analytics, feature usage, funnels.
* **Sentry**: backend & frontend error monitoring.

---

## 7. NDVI Processing Pipeline

1. **Image Acquisition**

   * Drone upload or satellite API fetch.
   * Stored as GeoTIFF or high-res imagery in S3/Storage.

2. **Pre-processing**

   * Normalize band ordering (ensure Red & NIR bands identified).
   * Re-project to standard CRS (e.g., EPSG:4326) if needed.
   * Clip imagery to field geometry.

3. **NDVI Calculation**

   * NDVI = (NIR - Red) / (NIR + Red)
   * Implemented via:

     * Node script with `geotiff` + numeric libs; or
     * Python microservice using rasterio + numpy.

4. **Derivation of Metrics**

   * Summary stats: mean, min, max, standard deviation.
   * % area below threshold (e.g., NDVI < 0.3).
   * Generate NDVI colormap raster (PNG tiles or vectorized contours).

5. **Storage**

   * Save NDVI raster to S3/Storage.
   * Save summary to `analyses.summary_stats`.
   * Save raster URL to `analyses.ndvi_raster_uri`.

6. **Insight Generation**

   * Rule-based engine:

     * If `low_ndvi_area_pct > X%` → create insight with severity=medium.
     * If `avg_ndvi` drops >Y% vs previous analysis → insight severity=high.
   * Persist to `insights` table.

7. **Alerts**

   * Cron job checks new insights against user alert configs.
   * Send notifications.

---

## 8. UX & Visual Design Notes

* **Theme:** modern, clean, “ag-tech” aesthetic (greens + neutrals).

* **Dashboard:**

  * Map as primary visual centerpiece.
  * Smooth zoom/pan (Mapbox/Leaflet) with NDVI overlay toggle.
  * Animated transitions when switching fields (Framer Motion).

* **Micro Interactions:**

  * Upload zone with subtle hover effects.
  * Button presses with spring-like animations.
  * Map layer toggles with fading transitions.

* **Responsive Design:**

  * Mobile: simplified map with card-based field list.
  * Desktop: map + details split view.

* **Accessibility:**

  * ARIA-friendly components via shadcn/Radix.
  * Proper color contrast for colorblind users (NDVI palette choices).

---