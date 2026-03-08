import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface CompassLock {
  id: string;
  user_a: string;
  user_b: string;
  verification_method: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

/** Get all compass-locked connections for the current user */
export function useCompassLocks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["compass-locks", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compass_locks")
        .select("*")
        .or(`user_a.eq.${user!.id},user_b.eq.${user!.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as CompassLock[];
    },
  });
}

/** Check if two users are compass-locked */
export function useIsCompassLocked(otherUserId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["compass-lock-check", user?.id, otherUserId],
    enabled: !!user?.id && !!otherUserId && user.id !== otherUserId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_compass_locked", {
        _user_a: user!.id,
        _user_b: otherUserId!,
      });
      if (error) throw error;
      return data as boolean;
    },
  });
}

/** Create a compass lock between two users */
export function useCreateCompassLock() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      otherUserId,
      method,
      lat,
      lng,
    }: {
      otherUserId: string;
      method: "qr" | "gps";
      lat?: number;
      lng?: number;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Normalize ordering to avoid duplicate constraint issues
      const [a, b] = [user.id, otherUserId].sort();

      const { data, error } = await supabase
        .from("compass_locks")
        .insert({
          user_a: a,
          user_b: b,
          verification_method: method,
          lat: lat ?? null,
          lng: lng ?? null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // Already locked — not an error
          return null;
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compass-locks"] });
      queryClient.invalidateQueries({ queryKey: ["compass-lock-check"] });
    },
  });
}

/** Generate a unique compass code for the current user (deterministic, short-lived) */
export function useCompassCode() {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    // Create a time-windowed code: userId + 5-min window
    const window = Math.floor(Date.now() / 300000); // 5 min windows
    const raw = `${user.id}:${window}`;
    // Simple hash for display
    const hash = Array.from(raw).reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0);
    const display = `CL-${Math.abs(hash).toString(36).toUpperCase().slice(0, 6)}`;
    setCode(display);
  }, [user?.id]);

  return { code, userId: user?.id };
}

/** Parse a compass code payload (the QR contains the user ID directly) */
export function parseCompassQR(payload: string): string | null {
  // QR payload format: "compass://userId"
  if (payload.startsWith("compass://")) {
    return payload.replace("compass://", "");
  }
  return null;
}

/** Check GPS proximity between two positions (returns true if within threshold meters) */
export function isWithinProximity(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  thresholdMeters = 50
): boolean {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c <= thresholdMeters;
}
