-- Trigger type regeneration for existing tables
-- This migration ensures TypeScript types are up to date
-- No schema changes, just refreshing the type definitions

-- Add a comment to trigger type sync
COMMENT ON TABLE public.profiles IS 'User profile information';
COMMENT ON TABLE public.portfolio_holdings IS 'User cryptocurrency holdings';
COMMENT ON TABLE public.price_alerts IS 'Price alert configurations';
COMMENT ON TABLE public.watchlist IS 'User watchlist for cryptocurrencies';
COMMENT ON TABLE public.user_settings IS 'User preferences and settings';