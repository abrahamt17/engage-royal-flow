import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
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
    const { data: brand } = await supabase
      .from("brands")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (brand) return brand.id;

    const { data: newBrand } = await supabase
      .from("brands")
      .insert({
        user_id: userId,
        company_name: email?.split("@")[0] ?? "My Brand",
      })
      .select("id")
      .single();

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

    // Safety timeout - never stay loading more than 5s
    const timeout = setTimeout(() => {
      if (mounted && loadingRef.current) {
        console.warn("Auth loading timeout - forcing loaded state");
        setLoading(false);
      }
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (!session) setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, brandId, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
