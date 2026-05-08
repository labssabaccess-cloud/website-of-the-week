-- OTW Schema Fix
-- Run this once in your Supabase SQL Editor

-- 1. Ensure is_current column exists on voting_weeks (rename from is_active if needed)
ALTER TABLE public.voting_weeks ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE;
UPDATE public.voting_weeks SET is_current = TRUE WHERE is_active = TRUE;

-- 2. Ensure votes.category column exists (rename from category_id if needed)
ALTER TABLE public.votes ADD COLUMN IF NOT EXISTS category TEXT;
UPDATE public.votes SET category = category_id WHERE category IS NULL;

-- 3. Ensure votes.weight column exists (rename from vote_weight if needed)
ALTER TABLE public.votes ADD COLUMN IF NOT EXISTS weight FLOAT DEFAULT 1.0;
UPDATE public.votes SET weight = vote_weight WHERE weight IS NULL;

-- 4. Ensure websites.favicon_url exists
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- 5. Ensure website_categories uses category (text), not category_id
ALTER TABLE public.website_categories ADD COLUMN IF NOT EXISTS category TEXT;

-- 6. Users table for reputation tracking
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  reputation_score FLOAT DEFAULT 1.0,
  account_age_days INT DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  is_verified_owner BOOLEAN DEFAULT FALSE,
  spam_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read" ON public.users FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Own update" ON public.users FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Own insert" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Seed current voting week if none exists
INSERT INTO public.voting_weeks (week_start, week_end, is_current)
SELECT DATE_TRUNC('week', NOW())::DATE,
       (DATE_TRUNC('week', NOW()) + INTERVAL '6 days')::DATE,
       TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.voting_weeks WHERE is_current = TRUE);

-- 9. cast_vote RPC (creates or transfers vote with reputation weighting)
CREATE OR REPLACE FUNCTION public.cast_vote(
  p_user_id UUID,
  p_website_id UUID,
  p_category_id TEXT,
  p_week_id UUID
)
RETURNS TABLE(transferred BOOLEAN, new_weight FLOAT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_weight FLOAT := 1.0;
  v_existing_id UUID;
  v_transferred BOOLEAN := FALSE;
  v_profile RECORD;
BEGIN
  SELECT reputation_score, account_age_days, spam_flagged, is_verified_owner
  INTO v_profile FROM public.users WHERE id = p_user_id;

  IF FOUND THEN
    IF v_profile.account_age_days < 7 THEN v_weight := 0.5; END IF;
    IF v_profile.spam_flagged THEN v_weight := 0.1; END IF;
    IF v_profile.is_verified_owner THEN v_weight := 1.2; END IF;
  END IF;

  SELECT id INTO v_existing_id FROM public.votes
  WHERE user_id = p_user_id AND category = p_category_id AND week_id = p_week_id;

  IF v_existing_id IS NOT NULL THEN
    UPDATE public.votes SET website_id = p_website_id, weight = v_weight WHERE id = v_existing_id;
    v_transferred := TRUE;
  ELSE
    INSERT INTO public.votes (user_id, website_id, category, week_id, weight)
    VALUES (p_user_id, p_website_id, p_category_id, p_week_id, v_weight);
  END IF;

  RETURN QUERY SELECT v_transferred, v_weight;
END;
$$;
