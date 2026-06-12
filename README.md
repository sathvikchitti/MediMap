# \# MediMap — Setup Guide

# 

# \## 1. Install dependencies

# ```bash

# npm install

# ```

# 

# \## 2. Set up Supabase

# 

# 1\. Create a project at https://supabase.com

# 2\. Go to SQL Editor → paste and run `supabase-schema.sql`

# 3\. Go to Storage → create a bucket named `reports` (set to \*\*private\*\*)

# 4\. Go to Project Settings → API → copy your URL and anon key

# 

# \## 3. Set up Groq API

# 

# 1\. Create a Groq API key in your Groq dashboard
# 2\. Use the key for Llama 3.3 70B Versatile requests

# 

# \## 4. Configure environment variables

# 

# ```bash

# cp .env.local.example .env.local

# ```

# 

# Fill in `.env.local`:

# ```

# NEXT\_PUBLIC\_SUPABASE\_URL=url

# NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=kry

# SUPABASE\_SERVICE\_ROLE\_KEY=ey

# NEXTAUTH\_SECRET=run: openssl rand -base64 32

# GROQ\_API\_KEY=YOUR\_GROQ\_API\_KEY

# ```

# 

# \## 5. Run the app

# ```bash

# npm run dev

# ```

# 

# Open http://localhost:3000

# 

# \---

# 

# \## File Structure

# 

# ```

# src/

# &#x20; app/

# &#x20;   page.tsx                    ← Landing page

# &#x20;   login/page.tsx              ← Sign in

# &#x20;   register/page.tsx           ← Sign up

# &#x20;   onboarding/page.tsx         ← 3-step onboarding

# &#x20;   dashboard/page.tsx          ← Post-login home

# &#x20;   upload/page.tsx             ← Upload + AI extraction

# &#x20;   reports/

# &#x20;     page.tsx                  ← Reports vault

# &#x20;     \[id]/page.tsx             ← Per-report analysis

# &#x20;   health-overview/

# &#x20;     page.tsx                  ← Trends + recommended tests + doctors

# &#x20;     HealthCharts.tsx          ← Recharts client component

# &#x20;   profile/

# &#x20;     page.tsx                  ← Profile page

# &#x20;     ProfileEditForm.tsx       ← Editable form client component

# &#x20;   api/

# &#x20;     upload/route.ts           ← PDF upload + OCR + AI analysis

# &#x20;     reports/route.ts          ← CRUD for reports/values

# &#x20;     auth/register/route.ts    ← Registration endpoint

# &#x20; components/

# &#x20;   layout/Sidebar.tsx          ← Shared sidebar

# &#x20; lib/

# &#x20;   llamaService.ts             ← Groq/Llama AI utilities

# &#x20;   supabase/client.ts          ← Browser Supabase client

# &#x20;   supabase/server.ts          ← Server Supabase client

# &#x20; types/index.ts                ← TypeScript types

# supabase-schema.sql             ← Run this in Supabase SQL Editor

# ```

# 

# \## Flow

# 

# 1\. User registers → redirected to `/onboarding`

# 2\. Onboarding saves profile + conditions to Supabase

# 3\. User uploads PDF at `/upload` → goes to `/api/upload`

# 4\. API uploads file to Supabase Storage, extracts values locally, runs Groq analysis, saves results

# 5\. User reviews/edits values → saves → redirected to `/reports/\[id]`

# 6\. Report analysis page shows AI summary, abnormal flags, parameters table

# 7\. `/health-overview` shows trends across reports + recommended tests



