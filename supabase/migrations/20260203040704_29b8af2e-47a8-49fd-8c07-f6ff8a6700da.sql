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