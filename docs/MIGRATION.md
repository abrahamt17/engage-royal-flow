# Migrate from Lovable Cloud to Your Own Supabase

Use **your actual Supabase project reference ID** in commands below. Do **not** type `YOUR_PROJECT_REF` literally.

- Find it: **Supabase Dashboard** → your project → **Project Settings** → **General** → **Reference ID**
- It’s a 20-character string (e.g. `xvrcdupffthvgmrgrvmk`).

---

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and create/sign in.
2. **New project** → name, database password, region.
3. Note **Reference ID** and **API URL** (Project Settings → General + API).

---

## 2. Apply database schema and data

Run these in **SQL Editor** in your new Supabase project, in this order:

1. **`database/schema.sql`** — creates tables, enums, RLS.
2. **`database/export-data.sql`** — your data from Lovable (brands, creators, campaigns). If Lovable gave you the export in a message, paste it into `database/export-data.sql` and run that file.
3. **`database/seed.sql`** (optional) — sample data; only if you want it in addition to your export.

### Alternative: Supabase CLI (schema only)

If you prefer CLI and already have schema in migrations:

```bash
cd engage-royal-flow
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Then run **`database/export-data.sql`** (and optionally seed) in SQL Editor.

---

## 3. Fix brand user_id (important)

Your brand row points at a Lovable auth user: `c5b65b8a-c069-4fd8-833f-a20071a2a60f`. In your new project you must either:

**Option A — Use your new account as the brand owner (easiest)**  
After you sign up in the new project, run in SQL Editor (replace with your new user id from Authentication → Users):

```sql
UPDATE public.brands
SET user_id = 'YOUR_NEW_USER_ID_HERE'
WHERE user_id = 'c5b65b8a-c069-4fd8-833f-a20071a2a60f';
```

**Option B — Keep the old user id**  
Create an auth user with that exact ID (e.g. via Dashboard or a one-off script). Only needed if you rely on that UUID elsewhere.

---

## 4. Point the app at your project

In `.env` set (from Project Settings → API):

- `VITE_SUPABASE_PROJECT_ID` = your Reference ID  
- `VITE_SUPABASE_URL` = Project URL  
- `VITE_SUPABASE_PUBLISHABLE_KEY` = anon public key  

Enable **Email** (and **Google** if needed) under Authentication → Providers. See `docs/GOOGLE_OAUTH_SETUP.md` for Google.

---

## 5. Edge Functions (optional)

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase functions deploy
npx supabase secrets set OPENAI_API_KEY=sk-your-key   # etc.
```

---

Never use the literal placeholder `YOUR_PROJECT_REF` in commands; it will fail with "Invalid project ref format".
