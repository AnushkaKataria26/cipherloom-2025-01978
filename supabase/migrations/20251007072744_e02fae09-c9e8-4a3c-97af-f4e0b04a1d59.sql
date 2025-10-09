-- Create watchlist table for user's favorite cryptocurrencies
CREATE TABLE public.watchlist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  coin_id text NOT NULL,
  coin_symbol text NOT NULL,
  coin_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, coin_id)
);

-- Enable RLS
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own watchlist"
ON public.watchlist
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own watchlist"
ON public.watchlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own watchlist"
ON public.watchlist
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);