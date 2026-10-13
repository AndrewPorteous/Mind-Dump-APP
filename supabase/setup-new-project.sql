-- The Alchemist Path — Mind Dump: full database setup for a NEW Supabase project.
-- Paste this whole file into Supabase > SQL Editor > New query, then click Run (once).
-- It combines the files in supabase/migrations in order.

-- ===== 20260202232907_a8151cae-55cd-40ca-a5ab-b859571c7d3c.sql =====
-- Create tips table for email tips library
CREATE TABLE public.tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  sequence_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on tips
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

-- Tips are readable by everyone (for admin access, we'll handle auth separately)
CREATE POLICY "Tips are readable by authenticated users" 
ON public.tips FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only admins can modify tips (using a simple role check)
CREATE POLICY "Only admins can insert tips" 
ON public.tips FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update tips" 
ON public.tips FOR UPDATE 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete tips" 
ON public.tips FOR DELETE 
USING (auth.jwt() ->> 'role' = 'admin');

-- Create user_preferences table for email opt-in and settings
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tips_opted_in BOOLEAN NOT NULL DEFAULT false,
  tips_last_sent_at TIMESTAMPTZ,
  tips_last_index INTEGER NOT NULL DEFAULT 0,
  email_frequency_hours INTEGER NOT NULL DEFAULT 48,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see their own preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences FOR UPDATE 
USING (auth.uid() = user_id);

-- Create ai_suggestions table for audit trail
CREATE TABLE public.ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('classify', 'goals', 'pareto', 'split')),
  input JSONB,
  output JSONB,
  model TEXT,
  confidence FLOAT,
  accepted BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on ai_suggestions
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own suggestions
CREATE POLICY "Users can view their own AI suggestions" 
ON public.ai_suggestions FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own suggestions (via edge function)
CREATE POLICY "Users can insert AI suggestions" 
ON public.ai_suggestions FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  email TEXT,
  payment_status TEXT NOT NULL DEFAULT 'free' CHECK (payment_status IN ('free', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tips_updated_at
BEFORE UPDATE ON public.tips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial tips for the library
INSERT INTO public.tips (title, body, category, difficulty, sequence_order) VALUES
('Eat the Frog First', 'Start your day by tackling your most challenging task. Once it''s done, everything else feels easier. This reduces procrastination and builds momentum.', 'productivity', 'beginner', 1),
('The 2-Minute Rule', 'If a task takes less than 2 minutes, do it immediately instead of adding it to your list. This prevents small tasks from piling up.', 'efficiency', 'beginner', 2),
('Time Blocking', 'Schedule specific blocks of time for different types of work. This reduces context-switching and improves focus.', 'planning', 'intermediate', 3),
('The Pomodoro Technique', 'Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break. This maintains focus and prevents burnout.', 'focus', 'beginner', 4),
('Weekly Review', 'Spend 30 minutes each week reviewing your goals, tasks, and calendar. This keeps you aligned with what truly matters.', 'planning', 'intermediate', 5),
('Single-Tasking', 'Focus on one task at a time. Multitasking reduces productivity by up to 40% and increases errors.', 'focus', 'beginner', 6),
('Energy Management', 'Schedule your most important work during your peak energy hours. Know when you''re at your best.', 'productivity', 'intermediate', 7),
('The Eisenhower Matrix', 'Categorize tasks by urgency and importance. Focus on important but not urgent tasks (Q2) for long-term success.', 'prioritization', 'intermediate', 8),
('Batch Similar Tasks', 'Group similar tasks together and do them in one session. This reduces setup time and mental switching costs.', 'efficiency', 'intermediate', 9),
('Learn to Say No', 'Every yes to something unimportant is a no to something that matters. Protect your time ruthlessly.', 'boundaries', 'advanced', 10);

-- ===== 20260203040704_29b8af2e-47a8-49fd-8c07-f6ff8a6700da.sql =====
-- Table pour les items de mind dump
CREATE TABLE public.mind_dump_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  is_actionable BOOLEAN,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les tâches
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  quadrant TEXT NOT NULL,
  est_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les goals
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  title TEXT NOT NULL,
  why TEXT,
  horizon TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les wheel scores
CREATE TABLE public.wheel_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  scores JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour purpose & values
CREATE TABLE public.alignment_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  purpose_answers JSONB DEFAULT '{}',
  purpose_statement TEXT DEFAULT '',
  selected_values_10 TEXT[] DEFAULT '{}',
  selected_values_5 TEXT[] DEFAULT '{}',
  ranked_values TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les plans
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  plan_date TEXT NOT NULL, -- date string or year-month/year-week
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_type, plan_date)
);

-- Table pour SAVERS config et progress
CREATE TABLE public.savers_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  config JSONB NOT NULL DEFAULT '[]',
  progress JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.mind_dump_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alignment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savers_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mind_dump_items
CREATE POLICY "Users can view their own mind dump items" ON public.mind_dump_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mind dump items" ON public.mind_dump_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mind dump items" ON public.mind_dump_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mind dump items" ON public.mind_dump_items
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for goals
CREATE POLICY "Users can view their own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for wheel_scores
CREATE POLICY "Users can view their own wheel scores" ON public.wheel_scores
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wheel scores" ON public.wheel_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wheel scores" ON public.wheel_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for alignment_data
CREATE POLICY "Users can view their own alignment data" ON public.alignment_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own alignment data" ON public.alignment_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alignment data" ON public.alignment_data
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for plans
CREATE POLICY "Users can view their own plans" ON public.plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own plans" ON public.plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plans" ON public.plans
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plans" ON public.plans
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for savers_data
CREATE POLICY "Users can view their own savers data" ON public.savers_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own savers data" ON public.savers_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own savers data" ON public.savers_data
  FOR UPDATE USING (auth.uid() = user_id);

-- ===== 20260511175806_906c4e64-8d27-4f4d-9028-d8a565990fd1.sql =====
-- 1. Create app_role enum and user_roles table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2. Fix tips policies: replace JWT-claim admin check with has_role
DROP POLICY IF EXISTS "Only admins can delete tips" ON public.tips;
DROP POLICY IF EXISTS "Only admins can insert tips" ON public.tips;
DROP POLICY IF EXISTS "Only admins can update tips" ON public.tips;

CREATE POLICY "Only admins can delete tips"
  ON public.tips FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert tips"
  ON public.tips FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update tips"
  ON public.tips FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix ai_suggestions: tighten INSERT, add DELETE
DROP POLICY IF EXISTS "Users can insert AI suggestions" ON public.ai_suggestions;
CREATE POLICY "Users can insert their own AI suggestions"
  ON public.ai_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI suggestions"
  ON public.ai_suggestions FOR DELETE
  USING (auth.uid() = user_id);

-- ===== 20260903202434_6c2305b8-cd80-4aee-8c01-e01d94020051.sql =====
DROP TABLE IF EXISTS public.ai_suggestions CASCADE;
