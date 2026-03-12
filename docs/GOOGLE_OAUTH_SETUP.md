# Fix "Unsupported provider: missing OAuth secret"

This error means **Google OAuth is not fully configured** in your Supabase project. Configure it in the Supabase Dashboard (not in code).

## 1. Create Google OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and select (or create) a project.
2. Open **APIs & Services** → **Credentials**.
3. Click **Create credentials** → **OAuth client ID**.
4. If asked, configure the **OAuth consent screen** (User type: External is fine for testing).
5. Application type: **Web application**.
6. **Authorized JavaScript origins:**
   - `http://localhost:8080` (or your dev URL)
   - Your production URL (e.g. `https://your-app.vercel.app`)
7. **Authorized redirect URIs:** add:
   - `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
   - Find your project ref in Supabase: Project Settings → General → Reference ID.
8. Create the client and copy the **Client ID** and **Client secret**.

## 2. Add them in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. In the left sidebar, click **Authentication**. You may see **Users** (list of users) first. Look for a sub-menu or tabs:
   - **Sign In** or **Sign In / Providers** or **Providers** — click that to see the list of providers (Email, Google, GitHub, etc.).
   - Or open the Google provider page directly:  
     **Authentication** → **Sign In** (or **Providers**) in the left nav, or go to:  
     `https://supabase.com/dashboard/project/YOUR_PROJECT_REF/auth/providers`  
     (replace `YOUR_PROJECT_REF` with your project’s Reference ID from Project Settings → General.)
3. Find **Google** in the list, enable it, then paste the **Client ID** and **Client secret** from Google.
4. Save.

## 3. Test

Use **Sign in with Google** again. The "missing OAuth secret" error should be gone once the secret is saved in Supabase.

---

**Note:** Email/password sign-in does not need this; only the Google (OAuth) provider does.
