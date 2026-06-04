import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

// ============================================================
// ALPHA TESTER MOCK MODE
// Bypasses authentication so pre-alpha testers can explore the
// app without creating an account. Flip this to `false` (or
// remove the block) to restore real auth.
// ============================================================
const ALPHA_MOCK_AUTH = true;

const MOCK_USER = {
  id: "00000000-0000-0000-0000-000000000a1f",
  email: "alpha-tester@wayfare.app",
  user_metadata: { display_name: "Alpha Tester" },
  app_metadata: { provider: "mock" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as unknown as User;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const authEventFired = useRef(false);

  useEffect(() => {
    if (ALPHA_MOCK_AUTH) {
      setUser(MOCK_USER);
      setSession(null);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        authEventFired.current = true;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!authEventFired.current) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (ALPHA_MOCK_AUTH) return;
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
}
