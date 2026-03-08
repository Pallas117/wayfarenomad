
-- Cultural bridge enum
CREATE TYPE public.cultural_bridge AS ENUM ('western', 'dao-ist', 'islamic');

-- Add new columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bridge cultural_bridge DEFAULT 'western',
  ADD COLUMN IF NOT EXISTS encrypted_private_key TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Expeditions (Marketplace trips)
CREATE TABLE public.expeditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_participants INTEGER,
  cost_usd DECIMAL(10,2),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expeditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Expeditions viewable by authenticated" ON public.expeditions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Hosts can insert expeditions" ON public.expeditions FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update own expeditions" ON public.expeditions FOR UPDATE TO authenticated USING (auth.uid() = host_id);

-- Itineraries (travel plans per city)
CREATE TABLE public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  city_name TEXT NOT NULL,
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all itineraries" ON public.itineraries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own itineraries" ON public.itineraries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own itineraries" ON public.itineraries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own itineraries" ON public.itineraries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add shared_vision_score to matches
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS shared_vision_score INTEGER;

-- Instant meetups
CREATE TABLE public.instant_meetups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_time TIMESTAMPTZ,
  travel_time_minutes INTEGER,
  transit_mode TEXT CHECK (transit_mode IN ('rail', 'bus', 'walking', 'driving')),
  calendar_sync_status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.instant_meetups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own meetups" ON public.instant_meetups FOR SELECT TO authenticated USING (auth.uid() = initiator_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can create meetups" ON public.instant_meetups FOR INSERT TO authenticated WITH CHECK (auth.uid() = initiator_id);
CREATE POLICY "Users can update own meetups" ON public.instant_meetups FOR UPDATE TO authenticated USING (auth.uid() = initiator_id OR auth.uid() = recipient_id);

-- Roaming beacons (4hr location share)
CREATE TABLE public.roaming_beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fuzzed_lat DOUBLE PRECISION,
  fuzzed_lng DOUBLE PRECISION,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '4 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.roaming_beacons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view active beacons" ON public.roaming_beacons FOR SELECT TO authenticated USING (expires_at > now());
CREATE POLICY "Users can insert own beacons" ON public.roaming_beacons FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own beacons" ON public.roaming_beacons FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add pulse_rank to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS pulse_rank INTEGER;

-- Transactions (payment logs)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  stripe_payment_id TEXT,
  platform_commission DECIMAL(15,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  expedition_id UUID REFERENCES public.expeditions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can insert as sender" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
