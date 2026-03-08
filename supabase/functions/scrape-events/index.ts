const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CITIES = [
  { name: 'Kuala Lumpur', query: 'events in Kuala Lumpur' },
  { name: 'Singapore', query: 'events in Singapore' },
  { name: 'Krabi', query: 'events in Krabi Thailand' },
];

const SOURCES = [
  { name: 'eventbrite', domains: ['eventbrite.com', 'eventbrite.sg', 'eventbrite.co.uk'] },
  { name: 'luma', domains: ['lu.ma'] },
  { name: 'instagram', domains: ['instagram.com'] },
];

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const targetCity = body.city || null;
    const citiesToScrape = targetCity
      ? CITIES.filter(c => c.name.toLowerCase() === targetCity.toLowerCase())
      : CITIES;

    const allEvents: any[] = [];

    for (const city of citiesToScrape) {
      for (const source of SOURCES) {
        const searchQuery = `${city.query} site:${source.domains[0]}`;

        try {
          const searchResp = await fetch('https://api.firecrawl.dev/v1/search', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: searchQuery,
              limit: 5,
              scrapeOptions: { formats: ['markdown'] },
            }),
          });

          const searchData = await searchResp.json();

          if (searchData.success && searchData.data) {
            for (const result of searchData.data) {
              // Extract event info from the scraped content
              const title = result.title || result.metadata?.title || 'Untitled Event';
              const description = result.markdown?.slice(0, 300) || result.description || '';
              const sourceUrl = result.url || '';

              // Determine category from content
              let category = 'festival';
              const lower = (title + ' ' + description).toLowerCase();
              if (lower.includes('tech') || lower.includes('code') || lower.includes('developer') || lower.includes('startup') || lower.includes('ai') || lower.includes('hackathon')) {
                category = 'tech';
              } else if (lower.includes('music') || lower.includes('concert') || lower.includes('dj') || lower.includes('live')) {
                category = 'music';
              }

              allEvents.push({
                title: title.slice(0, 200),
                description: description.slice(0, 500),
                city: city.name,
                category,
                source_url: sourceUrl,
                scraped_from: source.name,
                verified: false,
              });
            }
          }
        } catch (err) {
          console.error(`Error scraping ${source.name} for ${city.name}:`, err);
        }
      }
    }

    // Upsert events (avoid duplicates by source_url)
    if (allEvents.length > 0) {
      for (const event of allEvents) {
        // Check if event with same title+city already exists
        const { data: existing } = await supabase
          .from('events')
          .select('id')
          .eq('title', event.title)
          .eq('city', event.city)
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.from('events').insert(event);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, scraped: allEvents.length, cities: citiesToScrape.map(c => c.name) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Scrape error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
