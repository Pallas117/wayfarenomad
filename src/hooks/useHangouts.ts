import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Hangout {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  location_name: string | null;
  lat: number | null;
  lng: number | null;
  hangout_time: string;
  max_attendees: number;
  category: string;
  created_at: string;
  attendee_count?: number;
  is_attending?: boolean;
  creator_name?: string;
  creator_avatar?: string;
}

export function useHangouts(city?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["hangouts", city],
    queryFn: async () => {
      // Fetch hangouts
      let query = supabase
        .from("hangouts")
        .select("*")
        .gte("hangout_time", new Date().toISOString())
        .order("hangout_time", { ascending: true });

      const { data: hangouts, error } = await query;
      if (error) throw error;
      if (!hangouts?.length) return [];

      // Fetch attendee counts
      const hangoutIds = hangouts.map((h) => h.id);
      const { data: attendees } = await supabase
        .from("hangout_attendees")
        .select("hangout_id, user_id")
        .in("hangout_id", hangoutIds);

      // Fetch creator profiles
      const creatorIds = [...new Set(hangouts.map((h) => h.creator_id))];
      const { data: profiles } = await supabase
        .from("public_profiles" as any)
        .select("user_id, display_name, avatar_url")
        .in("user_id", creatorIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p])
      );

      const countMap = new Map<string, number>();
      const userAttending = new Set<string>();
      attendees?.forEach((a) => {
        countMap.set(a.hangout_id, (countMap.get(a.hangout_id) ?? 0) + 1);
        if (a.user_id === user?.id) userAttending.add(a.hangout_id);
      });

      return hangouts.map((h) => {
        const profile = profileMap.get(h.creator_id);
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
        } as Hangout;
      });
    },
    enabled: !!user,
  });
}

export function useCreateHangout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hangout: {
      title: string;
      description?: string;
      location_name?: string;
      lat?: number;
      lng?: number;
      hangout_time: string;
      max_attendees?: number;
      category: string;
      creator_id: string;
    }) => {
      const { data, error } = await supabase
        .from("hangouts")
        .insert(hangout)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hangouts"] });
    },
  });
}

export function useJoinHangout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hangoutId,
      userId,
    }: {
      hangoutId: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from("hangout_attendees")
        .insert({ hangout_id: hangoutId, user_id: userId });
      if (error) throw error;

      // Send push notification to hangout creator
      const { data: hangout } = await supabase
        .from("hangouts")
        .select("creator_id, title")
        .eq("id", hangoutId)
        .single();

      if (hangout && hangout.creator_id !== userId) {
        const { data: profile } = await supabase
          .from("public_profiles" as any)
          .select("display_name")
          .eq("user_id", userId)
          .single();

        supabase.functions.invoke("send-push", {
          body: {
            type: "hangout_join",
            receiver_id: hangout.creator_id,
            sender_name: profile?.display_name || "A traveler",
            hangout_title: hangout.title,
          },
        }).catch(console.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hangouts"] });
    },
  });
}

export function useLeaveHangout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hangoutId,
      userId,
    }: {
      hangoutId: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from("hangout_attendees")
        .delete()
        .eq("hangout_id", hangoutId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hangouts"] });
    },
  });
}
