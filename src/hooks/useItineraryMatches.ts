import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ItineraryMatch {
  userId: string;
  displayName: string;
  avatar: string;
  bio: string | null;
  city: string;
  arrivalDate: string;
  departureDate: string;
  overlapDays: number;
  teaches: string[];
  learns: string[];
  stardustPoints: number;
  visionScore: number; // calculated similarity
}

function calculateOverlap(
  startA: string, endA: string,
  startB: string, endB: string
): number {
  const a0 = new Date(startA).getTime();
  const a1 = new Date(endA).getTime();
  const b0 = new Date(startB).getTime();
  const b1 = new Date(endB).getTime();
  const overlapStart = Math.max(a0, b0);
  const overlapEnd = Math.min(a1, b1);
  if (overlapEnd <= overlapStart) return 0;
  return Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
}

function calculateVisionScore(
  myTeaches: string[], myLearns: string[],
  theirTeaches: string[], theirLearns: string[]
): number {
  // Score based on complementary skills
  let matches = 0;
  let total = 0;
  for (const skill of myLearns) {
    total++;
    if (theirTeaches.map(s => s.toLowerCase()).includes(skill.toLowerCase())) matches++;
  }
  for (const skill of myTeaches) {
    total++;
    if (theirLearns.map(s => s.toLowerCase()).includes(skill.toLowerCase())) matches++;
  }
  if (total === 0) return 50; // neutral
  return Math.round((matches / total) * 100);
}

export function useItineraryMatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["itinerary-matches", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get my itineraries
      const { data: myItineraries } = await supabase
        .from("itineraries")
        .select("*")
        .eq("user_id", user.id);

      if (!myItineraries || myItineraries.length === 0) return [];

      // Get my profile
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("teaches, learns")
        .eq("user_id", user.id)
        .single();

      const myTeaches = myProfile?.teaches || [];
      const myLearns = myProfile?.learns || [];

      // Get all other itineraries
      const { data: allItineraries } = await supabase
        .from("itineraries")
        .select("*")
        .neq("user_id", user.id);

      if (!allItineraries) return [];

      // Get profiles for matched users
      const userIds = [...new Set(allItineraries.map(i => i.user_id))];
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("user_id, display_name, bio, teaches, learns, stardust_points")
        .in("user_id", userIds);

      const profileMap = new Map((profiles as any[])?.map((p: any) => [p.user_id, p]) || []);

      // Calculate matches
      const matches: ItineraryMatch[] = [];
      const seen = new Set<string>();

      for (const myIt of myItineraries) {
        for (const theirIt of allItineraries) {
          if (seen.has(theirIt.user_id)) continue;
          if (theirIt.city_name.toLowerCase() !== myIt.city_name.toLowerCase()) continue;

          const overlap = calculateOverlap(
            myIt.arrival_date, myIt.departure_date,
            theirIt.arrival_date, theirIt.departure_date
          );

          if (overlap <= 0) continue;
          seen.add(theirIt.user_id);

          const profile = profileMap.get(theirIt.user_id) as any;
          const theirTeaches = profile?.teaches || [];
          const theirLearns = profile?.learns || [];

          matches.push({
            userId: theirIt.user_id,
            displayName: profile?.display_name || "Nomad",
            avatar: (profile?.display_name || "N").slice(0, 2).toUpperCase(),
            bio: profile?.bio,
            city: theirIt.city_name,
            arrivalDate: theirIt.arrival_date,
            departureDate: theirIt.departure_date,
            overlapDays: overlap,
            teaches: theirTeaches,
            learns: theirLearns,
            stardustPoints: profile?.stardust_points || 0,
            visionScore: calculateVisionScore(myTeaches, myLearns, theirTeaches, theirLearns),
          });
        }
      }

      // Sort by overlap days desc, then vision score
      return matches.sort((a, b) => b.overlapDays - a.overlapDays || b.visionScore - a.visionScore);
    },
    enabled: !!user,
  });
}
