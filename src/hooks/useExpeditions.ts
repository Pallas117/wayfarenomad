import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Expedition {
  id: string;
  title: string;
  description: string | null;
  location_name: string | null;
  start_date: string;
  end_date: string;
  cost_usd: number | null;
  max_participants: number | null;
  status: string | null;
  host_id: string;
  created_at: string;
  booking_count?: number;
  is_booked?: boolean;
}

export function useExpeditions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("expeditions")
      .select("*")
      .order("start_date", { ascending: true });

    if (error) {
      toast({ title: "Error loading expeditions", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Get booking counts and user's bookings
    let enriched: Expedition[] = (data ?? []).map((e) => ({ ...e, booking_count: 0, is_booked: false }));

    if (user?.id && data && data.length > 0) {
      const ids = data.map((e) => e.id);

      // Get user's own bookings
      const { data: myBookings } = await supabase
        .from("expedition_bookings")
        .select("expedition_id")
        .eq("user_id", user.id)
        .in("expedition_id", ids);

      const bookedSet = new Set((myBookings ?? []).map((b: any) => b.expedition_id));
      enriched = enriched.map((e) => ({ ...e, is_booked: bookedSet.has(e.id) }));
    }

    setExpeditions(enriched);
    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => { load(); }, [load]);

  const createExpedition = useCallback(async (exp: {
    title: string;
    description?: string;
    location_name?: string;
    start_date: string;
    end_date: string;
    cost_usd?: number;
    max_participants?: number;
  }) => {
    if (!user?.id) return null;
    const { data, error } = await supabase
      .from("expeditions")
      .insert({ ...exp, host_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: "Failed to create expedition", description: error.message, variant: "destructive" });
      return null;
    }
    toast({ title: "Expedition created! ✨", description: "Your expedition is now live." });
    await load();
    return data;
  }, [user?.id, toast, load]);

  const bookExpedition = useCallback(async (expeditionId: string) => {
    if (!user?.id) return false;
    const { error } = await supabase
      .from("expedition_bookings")
      .insert({ expedition_id: expeditionId, user_id: user.id });

    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Booked! +10 Stardust ⭐", description: "You've joined this expedition." });
    await load();
    return true;
  }, [user?.id, toast, load]);

  const cancelBooking = useCallback(async (expeditionId: string) => {
    if (!user?.id) return;
    await supabase
      .from("expedition_bookings")
      .delete()
      .eq("expedition_id", expeditionId)
      .eq("user_id", user.id);
    toast({ title: "Booking cancelled" });
    await load();
  }, [user?.id, toast, load]);

  const updateExpedition = useCallback(async (id: string, updates: { status?: string; title?: string; description?: string }) => {
    const { error } = await supabase
      .from("expeditions")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return false;
    }
    if (updates.status === "completed") {
      toast({ title: "Expedition completed! +50 Stardust ⭐" });
    }
    await load();
    return true;
  }, [toast, load]);

  return { expeditions, loading, createExpedition, bookExpedition, cancelBooking, updateExpedition, refresh: load };
}
