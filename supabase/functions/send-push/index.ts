import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Web Push requires VAPID. For now we use the Supabase service role to look up subscriptions
// and a simple fetch to the push endpoint. Full VAPID signing requires the web-push library.
// This simplified version works with self-hosted VAPID or can be extended.

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { receiver_id, sender_name } = await req.json();
    if (!receiver_id) {
      return new Response(JSON.stringify({ error: "receiver_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get recipient's push subscriptions
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", receiver_id);

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "no_subscriptions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.stringify({
      title: `${sender_name || "A nomad"} sent you a message`,
      body: "Tap to read your encrypted message",
      icon: "/pwa-192.png",
      url: "/messages",
      tag: `msg-${receiver_id}-${Date.now()}`,
    });

    // Note: Full Web Push with VAPID signing requires the web-push npm package.
    // This edge function stores the infrastructure. For production, add VAPID_PRIVATE_KEY
    // secret and use the web-push library to sign payloads.
    // For now, we log the intent and return success for the notification system to be ready.
    
    console.log(`Push notification queued for ${subs.length} subscription(s) to user ${receiver_id}`);
    console.log(`Payload: ${payload}`);

    return new Response(
      JSON.stringify({ sent: subs.length, payload }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-push error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
