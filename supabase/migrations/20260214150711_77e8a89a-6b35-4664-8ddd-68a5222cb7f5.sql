
-- Citizen issue reports table
CREATE TABLE public.citizen_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.zones(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  severity TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'open',
  location GEOGRAPHY(Point, 4326),
  photo_url TEXT,
  address TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Citizen recycling activity log
CREATE TABLE public.citizen_recycling_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bin_id UUID REFERENCES public.bins(id),
  waste_type TEXT NOT NULL,
  weight_kg NUMERIC,
  points_earned INTEGER NOT NULL DEFAULT 0,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Citizen profiles (public info)
CREATE TABLE public.citizen_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  zone_id UUID REFERENCES public.zones(id),
  total_points INTEGER NOT NULL DEFAULT 0,
  recycling_streak INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.citizen_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_recycling_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_profiles ENABLE ROW LEVEL SECURITY;

-- Citizen issues policies
CREATE POLICY "Citizens can view their own issues" ON public.citizen_issues
  FOR SELECT USING (auth.uid() = citizen_user_id);

CREATE POLICY "Admins can view all issues" ON public.citizen_issues
  FOR SELECT USING (true);

CREATE POLICY "Citizens can create issues" ON public.citizen_issues
  FOR INSERT WITH CHECK (auth.uid() = citizen_user_id);

CREATE POLICY "Citizens can update their own issues" ON public.citizen_issues
  FOR UPDATE USING (auth.uid() = citizen_user_id);

-- Recycling logs policies
CREATE POLICY "Citizens can view their own logs" ON public.citizen_recycling_logs
  FOR SELECT USING (auth.uid() = citizen_user_id);

CREATE POLICY "Citizens can create logs" ON public.citizen_recycling_logs
  FOR INSERT WITH CHECK (auth.uid() = citizen_user_id);

-- Citizen profiles policies
CREATE POLICY "Anyone can view citizen profiles" ON public.citizen_profiles
  FOR SELECT USING (true);

CREATE POLICY "Citizens can insert own profile" ON public.citizen_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Citizens can update own profile" ON public.citizen_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create citizen profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_citizen()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.citizen_profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Citizen'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_citizen
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_citizen();

-- Enable realtime for issues
ALTER PUBLICATION supabase_realtime ADD TABLE public.citizen_issues;

-- Timestamp update trigger
CREATE TRIGGER update_citizen_issues_updated_at
  BEFORE UPDATE ON public.citizen_issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_citizen_profiles_updated_at
  BEFORE UPDATE ON public.citizen_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
