# Cloudbeds Integration Steps (2025-12-15)

This is a practical checklist to connect the Next.js app to Cloudbeds, verify auth, and exercise booking flows. Keep secrets server-side only.

## 1) Get access and choose auth
- Request a Cloudbeds sandbox via the developer portal: https://developers.cloudbeds.com/docs/about-cloudbeds-api.
- Decide auth: use API Key (recommended for tech partners/self-service) or OAuth 2.0 if required by your account type.
- If using API Key: generate it in the Cloudbeds portal; keep it server-side.
- If using OAuth: collect client_id, client_secret, redirect_uri and confirm the token endpoint from the Cloudbeds auth docs.

## 1A) Create credentials in the Cloudbeds portal (UI steps)
- In Cloudbeds: `Marketplace` → `API Credentials` (URL pattern like `https://hotels.cloudbeds.com/connect/<property-id>#/manage/marketplace/api-creditials`).
- Under “New API Integration”: enter a Name (e.g., “Website Booking Integration”).
- Integration Type: choose `API Key` if available (simplest); choose OAuth 2.0 only if your account requires it.
- Redirect URI: required for OAuth. The form enforces HTTPS—use `https://localhost:3000/api/cloudbeds/callback` (or `https://127.0.0.1:3000/api/cloudbeds/callback` if it accepts IPs). If it refuses localhost entirely, supply any valid HTTPS domain you control (staging/production) and update later. If the field is forced for API Key, enter the same HTTPS value.
- Click Save, then copy the generated secret(s):
  - API Key flow: copy the `API Key`.
  - OAuth flow: copy `Client ID` and `Client Secret`.
- Immediately place these in `.env.local` (see step 3) and do not share them in chat or commit them. Deleting a key set will revoke active sessions.

## 1B) Local HTTPS for OAuth testing (Next.js dev)
- Generate a local cert (mkcert recommended):
  - Install: `brew install mkcert` (and `brew install nss` if using Firefox), then run `mkcert -install`.
  - Create certs: `mkcert localhost 127.0.0.1 ::1` → you get `localhost-key.pem` and `localhost.pem` (store under `./certs/`).
- Start Next.js dev with HTTPS:
  - `npm run dev -- --experimental-https --experimental-https-key ./certs/localhost-key.pem --experimental-https-cert ./certs/localhost.pem --hostname localhost --port 3000`
  - Accept the self-signed cert warning in the browser.
- Redirect URI to use in Cloudbeds: `https://localhost:3000/api/cloudbeds/callback` (or `https://127.0.0.1:3000/api/cloudbeds/callback` if you created certs for that host).

## 2) Capture required IDs
- From the sandbox, collect: property_id, room/bed IDs, rate plan IDs, tax/fee IDs (if needed), and any source/channel identifiers required for bookings.
- Keep a short mapping file or note so the frontend can list valid options.

## 3) Configure local secrets
- Create `.env.local` in the project root (not committed):
  - For API Key auth:  
    `CLOUDBEDS_API_KEY=your_api_key_here`
  - For OAuth (if needed):  
    `CLOUDBEDS_CLIENT_ID=...`  
    `CLOUDBEDS_CLIENT_SECRET=...`  
    `CLOUDBEDS_REDIRECT_URI=http://localhost:3000/api/cloudbeds/callback`
- Add the base URL from the Cloudbeds API reference (currently v1.3):  
  `CLOUDBEDS_API_BASE=https://hotels.cloudbeds.com/api/v1.3`

## 4) Build a small server-side client
- Add a server-only helper (e.g., `src/lib/cloudbeds.ts`) that:
  - Reads secrets from env.
  - Attaches `Authorization` header (API Key or Bearer token).
  - Wraps `fetch` with basic error handling and logs Cloudbeds error payloads.
- Do **not** call Cloudbeds directly from the browser; always proxy via API routes.

## 5) Add API routes in Next.js (App Router)
- `/api/ping`: call a harmless Cloudbeds endpoint (e.g., account/property info) to verify auth.
- `/api/availability`: accept dates/guests, call the availability/rates endpoint, return normalized options.
- `/api/book`: accept guest + stay details, create a reservation, and return the confirmation payload.
- Validate inputs, handle Cloudbeds errors, and never echo secrets.

## 6) Minimal test UI
- Build a simple page with:
  - Availability form (dates, guests) hitting `/api/availability`.
  - Booking form hitting `/api/book` using a selected room/rate.
- Show raw JSON responses for quick debugging.

## 7) Webhooks (recommended)
- If supported in your account, register a webhook URL (e.g., `/api/webhooks/cloudbeds`) for reservations/availability updates so your site stays in sync when bookings come from OTA channels.
- Log and verify webhook signatures per Cloudbeds guidance.

## 8) Test flow (sandbox)
1) Set `.env.local` secrets; restart dev server if needed.  
2) Hit `/api/ping` to confirm auth.  
3) Run an availability search for test dates.  
4) Create a test reservation; verify it appears in the Cloudbeds sandbox.  
5) (If webhooks) trigger a sandbox event and confirm it’s received.  
6) Review error handling: expired token, invalid room/rate, overbooking scenarios.

## 9) Hardening and launch prep
- Add rate/room ID allowlists on the server to prevent arbitrary IDs from the client.
- Log request IDs/timestamps for support; avoid logging PII or secrets.
- Add simple retries/backoff for transient errors.
- Document required fields for bookings (name, email, phone, payment token/placeholder) per your property’s policy.

Reference: Cloudbeds developer docs (About APIs, Auth guides, API Reference) at https://developers.cloudbeds.com/docs/about-cloudbeds-api. 

