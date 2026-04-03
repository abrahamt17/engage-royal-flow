import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
  const navigate = useNavigate();
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

    const syncSession = async (session: Session | null) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const id = await fetchOrCreateBrand(session.user.id, session.user.email ?? undefined);
        if (mounted) setBrandId(id);
      } else {
        setBrandId(null);
      }

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
      async (_event, session) => {
        await syncSession(session);
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

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);
    setUser(null);
    setBrandId(null);
    setLoading(false);
    navigate("/auth", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, brandId, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
