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

// Patterns that indicate junk/error content from scraped pages
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

// Words/phrases that indicate a listing page, not an actual event
const LISTING_PAGE_PATTERNS = [
  /^discover .* events & activities in/i,
  /^events and things to do in/i,
  /^find .* events in/i,
  /^browse .* events/i,
  /^search results for/i,
];

function sanitizeDescription(raw: string): string {
  // Remove markdown links syntax but keep text
  let clean = raw.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  // Remove image references
  clean = clean.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  // Remove URLs
  clean = clean.replace(/https?:\/\/[^\s)]+/g, '');
  // Remove excessive whitespace
  clean = clean.replace(/\s{2,}/g, ' ').trim();
  // Remove lines that are just navigation/filter text
  clean = clean.split('\n')
    .filter(line => {
      const trimmed = line.trim();
      if (trimmed.length < 3) return false;
      // Filter out nav/filter lines
      if (/^(filters|date|neighborhood|category|format|price|language|currency)\b/i.test(trimmed)) return false;
      return true;
    })
    .join(' ')
    .trim();
  // If after cleaning it's mostly junk, return empty
  if (JUNK_PATTERNS.some(p => p.test(clean))) return '';
  return clean;
}

function sanitizeTitle(title: string): string {
  // Remove " - Eventbrite", " | Luma", etc. suffixes
  return title
    .replace(/\s*[-|–]\s*(Eventbrite|Luma|Instagram|Facebook).*$/i, '')
    .replace(/\s*·\s*(Eventbrite|Luma).*$/i, '')
    .trim();
}

function isJunkEntry(title: string, description: string): boolean {
  // Skip listing/directory pages
  if (LISTING_PAGE_PATTERNS.some(p => p.test(title))) return true;
  // Skip if description is all junk
  if (JUNK_PATTERNS.some(p => p.test(title))) return true;
  // Skip if title is generic
  if (/^untitled event$/i.test(title)) return true;
  // Skip very short descriptions that are likely broken
  if (description.length === 0 && title.length < 10) return true;
  return false;
}

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
              const rawDesc = result.markdown?.slice(0, 500) || result.description || '';
              const sourceUrl = result.url || '';

              // Sanitize description: remove junk scraped content
              const description = sanitizeDescription(rawDesc);

              // Skip entries that are clearly not real events
              if (isJunkEntry(title, description)) {
                console.log(`Skipping junk entry: ${title.slice(0, 60)}`);
                continue;
              }

              // Determine category from content
              let category = 'festival';
              const lower = (title + ' ' + description).toLowerCase();
              if (lower.includes('tech') || lower.includes('code') || lower.includes('developer') || lower.includes('startup') || lower.includes('ai') || lower.includes('hackathon')) {
                category = 'tech';
              } else if (lower.includes('music') || lower.includes('concert') || lower.includes('dj') || lower.includes('live')) {
                category = 'music';
              }

              allEvents.push({
                title: sanitizeTitle(title).slice(0, 200),
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
