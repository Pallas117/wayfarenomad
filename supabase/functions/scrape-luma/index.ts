const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lumaUrl, city } = await req.json();

    if (!lumaUrl && !city) {
      return new Response(
        JSON.stringify({ success: false, error: 'Either lumaUrl or city is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine URL to scrape
    const targetUrl = lumaUrl || `https://lu.ma/${city.toLowerCase().replace(/\s+/g, '-')}`;

    console.log('Scraping Luma page:', targetUrl);

    // Use Firecrawl to scrape the Luma page
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        formats: [
          'markdown',
          {
            type: 'json',
            schema: {
              type: 'object',
              properties: {
                events: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      date: { type: 'string' },
                      venue: { type: 'string' },
                      description: { type: 'string' },
                      url: { type: 'string' },
                      category: { type: 'string' },
                    },
                  },
                },
              },
            },
            prompt: 'Extract all events from this Luma page. For each event, get the title, date (as ISO string or readable date), venue/location name, a short description, the event URL, and categorize it as one of: culture, entertainment, nightlife, fitness, creative, wellbeing, adventure, festival, event, singles, nature, shopping.',
          },
        ],
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok) {
      console.error('Firecrawl error:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: scrapeData.error || 'Scrape failed' }),
        { status: scrapeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract events from the JSON response
    const extractedEvents = scrapeData?.data?.json?.events || scrapeData?.json?.events || [];
    const targetCity = city || 'Unknown';

    console.log(`Found ${extractedEvents.length} events from Luma`);

    let inserted = 0;
    for (const event of extractedEvents) {
      if (!event.title) continue;

      const validCategories = [
        'wellbeing', 'culture', 'entertainment', 'shopping', 'nature',
        'event', 'festival', 'nightlife', 'fitness', 'adventure',
        'creative', 'singles', 'alien',
      ];
      const category = validCategories.includes(event.category?.toLowerCase())
        ? event.category.toLowerCase()
        : 'event';

      const { error } = await supabase.from('events').insert({
        title: event.title.slice(0, 200),
        description: event.description?.slice(0, 500) || null,
        venue: event.venue?.slice(0, 200) || null,
        event_date: event.date || null,
        source_url: event.url || targetUrl,
        city: targetCity,
        category,
        scraped_from: 'luma',
        verification_status: 'scraped',
        is_user_submitted: false,
      });

      if (!error) inserted++;
      else if (error.code !== '23505') {
        console.error('Insert error:', error);
      }
    }

    console.log(`Inserted ${inserted} Luma events`);

    return new Response(
      JSON.stringify({ success: true, scraped: extractedEvents.length, inserted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
