const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Patterns that indicate junk/error content
const JUNK_PATTERNS = [
  /your version of .* is not longer supported/i,
  /please \[?upgrade your browser\]?/i,
  /internet explorer/i,
  /how-to-troubleshoot/i,
  /filters date neighborhood category format price/i,
  /enable javascript/i,
  /cookies are required/i,
  /access denied/i,
  /page not found/i,
  /404 error/i,
  /403 forbidden/i,
  /captcha/i,
  /verify you are human/i,
  /sign in to continue/i,
  /log in to see/i,
];

const LISTING_PAGE_PATTERNS = [
  /^discover .* events & activities in/i,
  /^events and things to do in/i,
  /^find .* events in/i,
  /^browse .* events/i,
  /^search results for/i,
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch all unverified events
    const { data: events, error } = await supabase
      .from('events')
      .select('id, title, description, event_date')
      .eq('verified', false);

    if (error) throw error;
    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No unverified events to check', removed: 0, flagged: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let removed = 0;
    let flagged = 0;
    const idsToDelete: string[] = [];

    for (const event of events) {
      const title = event.title || '';
      const desc = event.description || '';

      // Check for junk titles (listing pages, error pages)
      const isJunkTitle = LISTING_PAGE_PATTERNS.some(p => p.test(title)) ||
        JUNK_PATTERNS.some(p => p.test(title));

      // Check for junk descriptions
      const isJunkDesc = JUNK_PATTERNS.some(p => p.test(desc));

      // Check for expired events (more than 7 days in the past)
      let isExpired = false;
      if (event.event_date) {
        const eventDate = new Date(event.event_date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        isExpired = eventDate < sevenDaysAgo;
      }

      // Check for empty/very short descriptions with generic titles
      const isTooShort = desc.length < 5 && title.length < 15;

      if (isJunkTitle || isJunkDesc || isTooShort) {
        idsToDelete.push(event.id);
        removed++;
      } else if (isExpired) {
        idsToDelete.push(event.id);
        removed++;
      }
    }

    // Batch delete junk/expired events
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('Error deleting junk events:', deleteError);
      }
    }

    // Clean up descriptions on remaining events (sanitize in-place)
    const { data: remaining } = await supabase
      .from('events')
      .select('id, description')
      .eq('verified', false);

    if (remaining) {
      for (const event of remaining) {
        const desc = event.description || '';
        // Remove markdown artifacts, URLs, navigation text
        let clean = desc
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
          .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
          .replace(/https?:\/\/[^\s)]+/g, '')
          .replace(/\s{2,}/g, ' ')
          .trim();

        // Remove nav/filter lines
        clean = clean.split('\n')
          .filter(line => {
            const t = line.trim();
            if (t.length < 3) return false;
            if (/^(filters|date|neighborhood|category|format|price|language|currency)\b/i.test(t)) return false;
            return true;
          })
          .join(' ')
          .trim();

        if (clean !== desc) {
          await supabase
            .from('events')
            .update({ description: clean })
            .eq('id', event.id);
          flagged++;
        }
      }
    }

    console.log(`Verification complete: removed ${removed}, cleaned ${flagged}`);

    return new Response(
      JSON.stringify({ success: true, checked: events.length, removed, cleaned: flagged }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Verify error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
