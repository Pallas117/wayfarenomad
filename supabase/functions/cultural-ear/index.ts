const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AUDD_API_KEY = Deno.env.get("AUDD_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { audio, userId } = await req.json();

    if (!audio) {
      return new Response(
        JSON.stringify({ error: "No audio data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let track = null;
    let sharedVibe = null;

    if (AUDD_API_KEY) {
      // Real AudD API call
      const formData = new FormData();
      formData.append("api_token", AUDD_API_KEY);
      formData.append("audio", audio);
      formData.append("return", "spotify,apple_music");

      const auddResponse = await fetch("https://api.audd.io/", {
        method: "POST",
        body: formData,
      });

      const auddData = await auddResponse.json();

      if (auddData.status === "success" && auddData.result) {
        const r = auddData.result;
        track = {
          title: r.title || "Unknown Track",
          artist: r.artist || "Unknown Artist",
          album: r.album || null,
          genre: r.genre || inferGenre(r.title, r.artist),
          origin: inferOrigin(r.artist),
          spotifyUrl: r.spotify?.external_urls?.spotify || `https://open.spotify.com/search/${encodeURIComponent(r.title + " " + r.artist)}`,
          appleMusicUrl: r.apple_music?.url || `https://music.apple.com/search?term=${encodeURIComponent(r.title + " " + r.artist)}`,
        };
      }
    } else {
      // Demo mode — return a sample track for development
      const demoTracks = [
        { title: "Amália Disse", artist: "Mariza", genre: "Fado", origin: "Portuguese Traditional" },
        { title: "Habibi", artist: "Tamino", genre: "Arabic Fusion", origin: "Belgian-Egyptian" },
        { title: "Svefn-g-englar", artist: "Sigur Rós", genre: "Post-Rock", origin: "Icelandic" },
        { title: "Bambarabanda", artist: "La Pegatina", genre: "Mestizo", origin: "Spanish Catalonian" },
      ];
      const demo = demoTracks[Math.floor(Math.random() * demoTracks.length)];
      track = {
        ...demo,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(demo.title)}`,
        appleMusicUrl: `https://music.apple.com/search?term=${encodeURIComponent(demo.title)}`,
      };
    }

    // Log the identification and check for shared vibes
    if (track && userId) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Store music identification
      const { error: insertError } = await supabase.from("music_identifications").insert({
        user_id: userId,
        track_title: track.title,
        track_artist: track.artist,
        genre: track.genre,
        origin: track.origin,
      });

      if (insertError) {
        console.error("Error storing identification:", insertError);
      }

      // Check for shared vibes — same track identified in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: sharedVibes } = await supabase
        .from("music_identifications")
        .select("user_id, profiles!inner(display_name)")
        .eq("track_title", track.title)
        .eq("track_artist", track.artist)
        .neq("user_id", userId)
        .gte("created_at", oneHourAgo)
        .limit(1);

      if (sharedVibes && sharedVibes.length > 0) {
        sharedVibe = {
          userId: sharedVibes[0].user_id,
          userName: (sharedVibes[0] as any).profiles?.display_name || "A nearby nomad",
        };
      }
    }

    return new Response(
      JSON.stringify({ track, sharedVibe }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cultural Ear error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to identify track" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function inferGenre(title: string, artist: string): string | null {
  const combined = `${title} ${artist}`.toLowerCase();
  if (combined.includes("fado")) return "Fado";
  if (combined.includes("samba") || combined.includes("bossa")) return "Brazilian";
  if (combined.includes("flamenco")) return "Flamenco";
  if (combined.includes("techno") || combined.includes("electronic")) return "Electronic";
  if (combined.includes("jazz")) return "Jazz";
  if (combined.includes("oud") || combined.includes("arabic")) return "Arabic Traditional";
  return null;
}

function inferOrigin(artist: string): string | null {
  // Simple heuristic, could be enriched with a database
  return null;
}
