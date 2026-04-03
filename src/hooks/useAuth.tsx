import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  brandId: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  brandId: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const clearStoredAuth = () => {
  const keysToRemove: string[] = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (key?.startsWith("sb-")) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
};

async function fetchOrCreateBrand(userId: string, email?: string): Promise<string | null> {
  try {
    const { data: brands, error: brandError } = await supabase
      .from("brands")
      .select("id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1);

    if (brandError) {
      throw brandError;
    }

    if (brands && brands.length > 0) {
      return brands[0].id;
    }

    const { data: newBrand, error: insertError } = await supabase
      .from("brands")
      .insert({
        user_id: userId,
        company_name: email?.split("@")[0] ?? "My Brand",
      })
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    return newBrand?.id ?? null;
  } catch (err) {
    console.error("Brand setup error:", err);
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null);
  const loadingRef = useRef(loading);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    let mounted = true;

    const syncSession = (session: Session | null) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      setBrandId(null);

      if (mounted) setLoading(false);
    };

    // Safety timeout - never stay loading more than 5s
    const timeout = setTimeout(() => {
      if (mounted && loadingRef.current) {
        console.warn("Auth loading timeout - forcing loaded state");
        setLoading(false);
      }
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        syncSession(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      void syncSession(session);
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!user) {
      setBrandId(null);
      return () => {
        active = false;
      };
    }

    void (async () => {
      const id = await fetchOrCreateBrand(user.id, user.email ?? undefined);

      if (active) {
        setBrandId(id);
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  const signOut = async () => {
    let signOutError: unknown = null;

    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });

      if (error) {
        throw error;
      }
    } catch (error) {
      signOutError = error;
      console.error("Sign out error:", error);
    } finally {
      clearStoredAuth();
      setSession(null);
      setUser(null);
      setBrandId(null);
      setLoading(false);

      if (window.location.pathname !== "/auth") {
        window.location.replace("/auth");
      }
    }

    if (signOutError) {
      const message = signOutError instanceof Error ? signOutError.message : "Signed out locally, but Supabase sign-out reported an error";
      toast.error(message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, brandId, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
