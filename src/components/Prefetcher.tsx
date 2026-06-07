import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Warms react-query caches for Social & Marketplace data while the
 * "Scanning the Stars" overlay is on screen, so those pages render
 * instantly once the user lands on them.
 */
export function Prefetcher() {
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // ── Social: hangouts ──
    queryClient.prefetchQuery({
      queryKey: ["hangouts", undefined],
      queryFn: async () => {
        const { data: hangouts, error } = await supabase
          .from("hangouts")
          .select("*")
          .gte("hangout_time", new Date().toISOString())
          .order("hangout_time", { ascending: true });
        if (error) throw error;
        if (!hangouts?.length) return [];

        const hangoutIds = hangouts.map((h) => h.id);
        const [{ data: attendees }, { data: profiles }] = await Promise.all([
          supabase
            .from("hangout_attendees")
            .select("hangout_id, user_id")
            .in("hangout_id", hangoutIds),
          supabase
            .from("public_profiles")
            .select("user_id, display_name, avatar_url")
            .in("user_id", [...new Set(hangouts.map((h) => h.creator_id))]),
        ]);

        const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
        const countMap = new Map<string, number>();
        const userAttending = new Set<string>();
        attendees?.forEach((a: any) => {
          countMap.set(a.hangout_id, (countMap.get(a.hangout_id) ?? 0) + 1);
          if (a.user_id === user?.id) userAttending.add(a.hangout_id);
        });

        return hangouts.map((h: any) => {
          const profile = profileMap.get(h.creator_id) as any;
          return {
            ...h,
            attendee_count: countMap.get(h.id) ?? 0,
            is_attending: userAttending.has(h.id),
            creator_name: profile?.display_name ?? "Nomad",
            creator_avatar: (profile?.display_name ?? "N")
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
          };
        });
      },
      staleTime: 60_000,
    });

    // ── Social: itinerary matches (warm network only; shape differs from
    // hook's queryKey so we don't seed that cache with the wrong shape) ──
    if (user?.id) {
      void Promise.all([
        supabase.from("itineraries").select("*").eq("user_id", user.id),
        supabase.from("itineraries").select("*").neq("user_id", user.id),
      ]).catch(() => {});
    }

    // ── Marketplace: expeditions (warms network/cache) ──
    queryClient.prefetchQuery({
      queryKey: ["expeditions", "all"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("expeditions")
          .select("*")
          .order("start_date", { ascending: true });
        if (error) throw error;
        return data ?? [];
      },
      staleTime: 60_000,
    });
  }, [queryClient, user?.id, loading]);

  return null;
}