import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRank = 0 | 1 | 2 | 3; // initiate, steward, captain, admin

export const RANK_LABELS: Record<UserRank, string> = {
  0: "Initiate",
  1: "Steward",
  2: "Captain",
  3: "Admin",
};

export function useUserRank() {
  const { user } = useAuth();
  const [rank, setRank] = useState<UserRank>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRank(0);
      setLoading(false);
      return;
    }

    const fetchRank = async () => {
      const { data, error } = await supabase.rpc("get_user_rank", {
        _user_id: user.id,
      });

      if (!error && data !== null) {
        setRank(data as UserRank);
      }
      setLoading(false);
    };

    fetchRank();
  }, [user]);

  return {
    rank,
    label: RANK_LABELS[rank],
    loading,
    isInitiate: rank >= 0,
    isSteward: rank >= 1,
    isCaptain: rank >= 2,
    isAdmin: rank >= 3,
  };
}
