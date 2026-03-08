import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, receiver_id, receiver_ids, sender_name, hangout_title, group_name } = body;

    // Support both single receiver and multiple receivers
    const targets: string[] = receiver_ids?.length ? receiver_ids : receiver_id ? [receiver_id] : [];

    if (!targets.length) {
      return new Response(JSON.stringify({ error: "receiver_id or receiver_ids required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Build notification payload based on type
    let title: string;
    let notifBody: string;
    let url = "/messages";
    let tag: string;

    switch (type) {
      case "hangout_join":
        title = `${sender_name || "Someone"} joined your hangout`;
        notifBody = hangout_title ? `"${hangout_title}" has a new attendee! 🎉` : "A new traveler joined your hangout!";
        url = "/social";
        tag = `hangout-join-${Date.now()}`;
        break;

      case "group_message":
        title = `${sender_name || "Someone"} in ${group_name || "group chat"}`;
        notifBody = "New message in group chat";
        url = "/messages";
        tag = `group-msg-${Date.now()}`;
        break;

      case "dm":
      default:
        title = `${sender_name || "A nomad"} sent you a message`;
        notifBody = "Tap to read your encrypted message";
        url = "/messages";
        tag = `msg-${Date.now()}`;
        break;
    }

    const payload = JSON.stringify({
      title,
      body: notifBody,
      icon: "/pwa-192.png",
      url,
      tag,
    });

    // Get push subscriptions for all targets
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", targets);

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "no_subscriptions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Push notification (${type}) queued for ${subs.length} subscription(s)`);
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
