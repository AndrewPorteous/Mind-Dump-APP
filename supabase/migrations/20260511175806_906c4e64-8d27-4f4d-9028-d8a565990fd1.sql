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