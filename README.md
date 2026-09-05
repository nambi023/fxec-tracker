# FXEC Student Tracker

Attendance + 7-slot presence tracker for Francis Xavier Engineering College.
Students sign in with their college Google account, check in during each of
the 7 daily slots by sharing location + what they're doing, and admins see a
live dashboard with flagged mismatches.

This is a real, working project — you don't need to write code, just follow
these steps in order. Total setup time: ~45-60 minutes, one time.

## What you're setting up (all free tier)
1. **Supabase** — database + login system
2. **Google Cloud** — lets students log in with their college Google account
3. **GitHub** — stores your code
4. **Vercel** — hosts the live website permanently, for free

---

## Step 1 — Create your Supabase project
1. Go to https://supabase.com → Sign up (free) → "New project"
2. Name it `fxec-tracker`, pick a database password (save it somewhere), pick
   the region closest to India (Singapore).
3. Once created, go to **SQL Editor** → New query → paste the entire content
   of `supabase/schema.sql` from this project → Run.
4. Go to **Project Settings → API** → copy the `Project URL` and the
   `anon public` key. You'll need these in Step 4.

## Step 2 — Set up Google login (restricted to college email)
1. Go to https://console.cloud.google.com → create a new project.
2. Go to **APIs & Services → OAuth consent screen** → External → fill basic
   app info (app name: "FXEC Tracker").
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth client
   ID** → Application type: Web application.
4. In Supabase: **Authentication → Providers → Google** → copy the callback
   URL shown there → paste it into Google's "Authorized redirect URIs".
5. Copy the Google **Client ID** and **Client Secret** → paste into
   Supabase's Google provider settings → Save.
6. Back in Supabase: **Authentication → Hooks → Before User Created** →
   select the `restrict_signup_domain` function (created by the SQL script
   in Step 1). This blocks any non-`@francisxavier.ac.in` email at the
   database level, even if someone tries to bypass the app.

## Step 3 — Calibrate your campus zones (important!)
Open `src/lib/zones.js`. The coordinates in there are placeholders spread
around your campus center. To make attendance accurate:
1. Open Google Maps → find your campus → satellite view.
2. Right-click the Library building → "What's here?" → copy the lat/long
   shown → paste into the `library` zone's `lat`/`lng`.
3. Repeat for Academic Block, Auditorium, Ground/Canteen.
4. Set `radiusMeters` to roughly how wide each building is (60-100m is
   usually right for a single building).

This is the single most important step — it decides how strict/accurate the
attendance checks are.

## Step 4 — Run it locally to test (optional but recommended)
You'll need Node.js installed (https://nodejs.org, download the LTS version).
1. Open a terminal in this project folder.
2. Copy `.env.example` to a new file named `.env`, paste in your Supabase
   URL + anon key from Step 1.
3. Run:
   ```
   npm install
   npm run dev
   ```
4. Open the link it shows (usually `http://localhost:5173`) on your phone
   (same wifi) or laptop to test.

## Step 5 — Put it on GitHub
1. Go to https://github.com → New repository → name it `fxec-tracker` →
   Create.
2. Upload all files in this folder (GitHub's web "Add file → Upload files"
   works fine, no command line needed).

## Step 6 — Deploy for free with Vercel (this makes it permanent & live)
1. Go to https://vercel.com → Sign up with GitHub.
2. "Add New → Project" → import your `fxec-tracker` repo.
3. Before deploying, add environment variables (Vercel asks for this):
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — same values as your
   `.env` file.
4. Click Deploy. In ~1 minute you'll get a permanent URL like
   `fxec-tracker.vercel.app` — this is your live website, free forever, and
   updates automatically every time you push changes to GitHub.

## Step 7 — Make yourself admin
Once you've logged in once through the live site:
1. Go to Supabase → **Table Editor → profiles** → find your row.
2. Change `role` from `student` to `admin`.
3. Log out and back in on the site — you'll now land on the admin dashboard
   at `/admin`.

## How the pieces work together
- **Login** (`src/pages/Login.jsx`) — Google sign-in, domain-checked twice
  (frontend for a friendly error message, backend via the Postgres hook so it
  can't be bypassed).
- **Zones** (`src/lib/zones.js`) — your 4 campus zones + fallback + the 7
  daily time slots + activity options students can claim.
- **Geofencing** (`src/lib/geofence.js`) — distance math (Haversine formula)
  and the consistency check between claimed activity and detected GPS zone.
- **Check-in** (`src/pages/CheckIn.jsx`) — what a student sees during an
  active slot: share location → pick activity → submit. Flags mismatches
  automatically.
- **Student dashboard** (`src/pages/StudentDashboard.jsx`) — attendance %,
  today's slot ledger.
- **Admin dashboard** (`src/pages/AdminDashboard.jsx`) — live feed of all
  check-ins today, flagged list for manual review.

## Notifications (next addition)
The current version is "student opens the app during their slot to check
in." To add automatic push reminders per slot without any paid service, the
next step is a Web Push subscription (free, browser-native) — ask me when
you're ready to add this and I'll build it in.

## What this doesn't fully solve (be upfront with your club/faculty about this)
No free system can be 100% fake-proof — GPS can be spoofed by determined
users. This design (zone-matching + activity cross-check + random slot
timing + pattern flags for admin review) is the same layered approach real
companies use; it makes faking attendance hard and inconsistent rather than
impossible, with humans reviewing the flagged edge cases.
