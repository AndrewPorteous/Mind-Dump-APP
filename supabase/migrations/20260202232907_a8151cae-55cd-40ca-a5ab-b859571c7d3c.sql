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