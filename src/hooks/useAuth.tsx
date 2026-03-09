import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            // Fetch or create brand profile
            const { data: brand } = await supabase
              .from("brands")
              .select("id")
              .eq("user_id", session.user.id)
              .maybeSingle();

            if (brand) {
              setBrandId(brand.id);
            } else {
              // Auto-create brand on first login
              const { data: newBrand } = await supabase
                .from("brands")
                .insert({
                  user_id: session.user.id,
                  company_name: session.user.email?.split("@")[0] ?? "My Brand",
                })
                .select("id")
                .single();
              setBrandId(newBrand?.id ?? null);
            }
          } catch (err) {
            console.error("Brand setup error:", err);
            setBrandId(null);
          }
        } else {
          setBrandId(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
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
