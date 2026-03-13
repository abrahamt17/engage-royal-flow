import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * OAuth callback: Supabase redirects here with tokens in the URL hash.
 * We manually set the session from the hash so the user is logged in.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      // Supabase can send tokens/errors in hash (implicit) or query (code flow)
      const hash = window.location.hash?.slice(1) || "";
      const query = window.location.search?.slice(1) || "";
      const queryParams = new URLSearchParams(query);
      const hashParams = new URLSearchParams(hash);

      const errParam =
        queryParams.get("error_description") ||
        queryParams.get("error") ||
        hashParams.get("error_description") ||
        hashParams.get("error");

      if (errParam) {
        const decoded = decodeURIComponent(errParam);
        if (decoded.includes("Unable to exchange external code")) {
          setError(
            "Redirect URL not allowed. In Supabase: Authentication → URL Configuration → Redirect URLs, add exactly: " +
              window.location.origin + "/auth/callback — or try the wildcard: " + window.location.origin + "/**"
          );
        } else {
          setError(decoded);
        }
        return;
      }

      // Code flow: exchange the code for a session (client has PKCE verifier from when we started the flow)
      const code = queryParams.get("code");
      if (code) {
        const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        if (sessionData?.session) {
          window.history.replaceState(null, "", window.location.pathname);
          navigate("/", { replace: true });
          return;
        }
      }

      // Hash flow: tokens in fragment
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error: err } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (err) {
          setError(err.message);
          return;
        }
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/", { replace: true });
        return;
      }

      // Already have session (e.g. client auto-recovered)
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/", { replace: true });
        return;
      }
      setError("No session found. Try signing in again.");
    };
    run();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
        <p className="text-sm text-destructive">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/auth", { replace: true })}
          className="text-sm text-primary underline"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Completing sign in…</p>
      </div>
    </div>
  );
};

export default AuthCallback;
