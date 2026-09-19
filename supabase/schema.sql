-- ==============================================================================
-- ESPORTIX COMPLETE SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Games Table
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  default_scoring_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tournament Users
CREATE TABLE IF NOT EXISTS public.tournament_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'VIEWER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tournaments Table
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  status TEXT NOT NULL DEFAULT 'UPCOMING',
  visibility TEXT NOT NULL DEFAULT 'PUBLIC',
  format TEXT NOT NULL DEFAULT 'SQUAD',
  team_size INT NOT NULL DEFAULT 4,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_by UUID REFERENCES public.tournament_users(id) ON DELETE SET NULL,
  custom_colors JSONB NOT NULL DEFAULT '{"primary": "#2563EB", "accent": "#F5C400"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tournament Admins
CREATE TABLE IF NOT EXISTS public.tournament_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.tournament_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Scoring Rules Table
CREATE TABLE IF NOT EXISTS public.scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID UNIQUE NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  placement_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  kill_points NUMERIC NOT NULL DEFAULT 1,
  win_bonus NUMERIC NOT NULL DEFAULT 0,
  bonus_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  penalty_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  tie_breaker_priority JSONB NOT NULL DEFAULT '["total_points", "finish_points", "placement_points", "wins"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  logo_url TEXT,
  seed INT NOT NULL DEFAULT 0,
  group_name TEXT NOT NULL DEFAULT 'Group A',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Players Table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  player_identifier TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  match_number INT NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  map_name TEXT,
  round_name TEXT NOT NULL DEFAULT 'Round 1',
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Match Results Table
CREATE TABLE IF NOT EXISTS public.match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  placement INT NOT NULL DEFAULT 0,
  kills INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  placement_points NUMERIC NOT NULL DEFAULT 0,
  finish_points NUMERIC NOT NULL DEFAULT 0,
  bonus_points NUMERIC NOT NULL DEFAULT 0,
  penalty_points NUMERIC NOT NULL DEFAULT 0,
  total_points NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_match_team UNIQUE(match_id, team_id)
);

-- 10. Tournament Audit Logs Table
CREATE TABLE IF NOT EXISTS public.tournament_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  user_id UUID,
  user_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allow anon and authenticated full access for tournament operations
-- ==============================================================================

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Games policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'games' AND policyname = 'Allow public full access on games') THEN
    CREATE POLICY "Allow public full access on games" ON public.games FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Tournament users policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_users' AND policyname = 'Allow public full access on tournament_users') THEN
    CREATE POLICY "Allow public full access on tournament_users" ON public.tournament_users FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Tournaments policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournaments' AND policyname = 'Allow public full access on tournaments') THEN
    CREATE POLICY "Allow public full access on tournaments" ON public.tournaments FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Tournament admins policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_admins' AND policyname = 'Allow public full access on tournament_admins') THEN
    CREATE POLICY "Allow public full access on tournament_admins" ON public.tournament_admins FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Scoring rules policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scoring_rules' AND policyname = 'Allow public full access on scoring_rules') THEN
    CREATE POLICY "Allow public full access on scoring_rules" ON public.scoring_rules FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Teams policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teams' AND policyname = 'Allow public full access on teams') THEN
    CREATE POLICY "Allow public full access on teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Players policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'players' AND policyname = 'Allow public full access on players') THEN
    CREATE POLICY "Allow public full access on players" ON public.players FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Matches policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'matches' AND policyname = 'Allow public full access on matches') THEN
    CREATE POLICY "Allow public full access on matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Match results policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_results' AND policyname = 'Allow public full access on match_results') THEN
    CREATE POLICY "Allow public full access on match_results" ON public.match_results FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Audit logs policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_audit_logs' AND policyname = 'Allow public full access on tournament_audit_logs') THEN
    CREATE POLICY "Allow public full access on tournament_audit_logs" ON public.tournament_audit_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Badges policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Allow public full access on badges') THEN
    CREATE POLICY "Allow public full access on badges" ON public.badges FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tournaments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'match_results'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.match_results;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'teams'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'scoring_rules'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scoring_rules;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Realtime publication might not exist or be configurable in all environments
    NULL;
END $$;

-- ==============================================================================
-- SEED DEFAULT GAMES
-- ==============================================================================
INSERT INTO public.games (id, name, slug, logo_url, description, default_scoring_rules)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Battlegrounds Mobile India (BGMI)',
    'bgmi',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=256&auto=format&fit=crop&q=80',
    'Tactical Battle Royale mobile esports with placement & finish points.',
    '{"kill_points": 1, "win_bonus": 0, "placement_rules": {"1": 10, "2": 6, "3": 5, "4": 4, "5": 3, "6": 2, "7": 1, "8": 1}, "tie_breaker_priority": ["total_points", "finish_points", "placement_points", "wins", "total_kills", "best_placement"]}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Free Fire Max',
    'free-fire',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=256&auto=format&fit=crop&q=80',
    'Fast-paced Battle Royale featuring Booyah bonuses and elimination multipliers.',
    '{"kill_points": 1, "win_bonus": 0, "placement_rules": {"1": 12, "2": 9, "3": 8, "4": 7, "5": 6, "6": 5, "7": 4, "8": 3, "9": 2, "10": 1}, "tie_breaker_priority": ["total_points", "finish_points", "placement_points", "wins", "total_kills"]}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Valorant',
    'valorant',
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=256&auto=format&fit=crop&q=80',
    '5v5 Character-based tactical FPS shooter with round differential scoring.',
    '{"kill_points": 1, "win_bonus": 3, "placement_rules": {"1": 3, "2": 0}, "tie_breaker_priority": ["total_points", "wins", "total_kills"]}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Call of Duty: Mobile',
    'cod-mobile',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=256&auto=format&fit=crop&q=80',
    'Competitive Battle Royale and Multiplayer warfare.',
    '{"kill_points": 1, "win_bonus": 0, "placement_rules": {"1": 15, "2": 12, "3": 10, "4": 8, "5": 6, "6": 4, "7": 2, "8": 1}, "tie_breaker_priority": ["total_points", "finish_points", "placement_points", "wins"]}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Custom Esports Title',
    'custom',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=256&auto=format&fit=crop&q=80',
    'Configure your own game rules, point systems, and tie-breakers.',
    '{"kill_points": 1, "win_bonus": 0, "placement_rules": {"1": 10, "2": 6, "3": 5, "4": 4, "5": 3, "6": 2, "7": 1, "8": 1}, "tie_breaker_priority": ["total_points", "finish_points", "placement_points", "wins"]}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  description = EXCLUDED.description,
  default_scoring_rules = EXCLUDED.default_scoring_rules;
