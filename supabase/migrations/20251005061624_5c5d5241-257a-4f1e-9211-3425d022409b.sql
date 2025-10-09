-- Add profile_completed field to track if user has completed initial profile setup
ALTER TABLE public.profiles ADD COLUMN profile_completed boolean NOT NULL DEFAULT false;

-- Add additional profile fields for more user information
ALTER TABLE public.profiles ADD COLUMN phone text;
ALTER TABLE public.profiles ADD COLUMN location text;
ALTER TABLE public.profiles ADD COLUMN website text;
ALTER TABLE public.profiles ADD COLUMN twitter text;
ALTER TABLE public.profiles ADD COLUMN linkedin text;