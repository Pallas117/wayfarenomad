import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type ReactionType = "star" | "like";

export function useEventReactions(eventIds: string[]) {
  const { user } = useAuth();
  // Map of eventId -> Set of reaction types the current user has
  const [userReactions, setUserReactions] = useState<Record<string, Set<ReactionType>>>({});

  useEffect(() => {
    if (!user || eventIds.length === 0) return;

    const load = async () => {
      const { data } = await supabase
        .from("event_reactions" as any)
        .select("event_id, reaction_type")
        .eq("user_id", user.id)
        .in("event_id", eventIds);

      if (data) {
        const map: Record<string, Set<ReactionType>> = {};
        for (const r of data as any[]) {
          if (!map[r.event_id]) map[r.event_id] = new Set();
          map[r.event_id].add(r.reaction_type as ReactionType);
        }
        setUserReactions(map);
      }
    };
    load();
  }, [user, eventIds.join(",")]);

  const toggleReaction = useCallback(
    async (eventId: string, type: ReactionType) => {
      if (!user) return;

      const current = userReactions[eventId] ?? new Set();
      const has = current.has(type);

      // Optimistic update
      setUserReactions((prev) => {
        const next = { ...prev };
        const s = new Set(next[eventId] ?? []);
        if (has) s.delete(type);
        else s.add(type);
        next[eventId] = s;
        return next;
      });

      if (has) {
        await supabase
          .from("event_reactions" as any)
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .eq("reaction_type", type);
      } else {
        await supabase
          .from("event_reactions" as any)
          .insert({ event_id: eventId, user_id: user.id, reaction_type: type });
      }
    },
    [user, userReactions]
  );

  const hasReaction = useCallback(
    (eventId: string, type: ReactionType) => {
      return userReactions[eventId]?.has(type) ?? false;
    },
    [userReactions]
  );

  return { toggleReaction, hasReaction };
}
