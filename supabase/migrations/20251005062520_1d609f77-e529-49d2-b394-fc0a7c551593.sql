-- Create portfolio holdings table
CREATE TABLE public.portfolio_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_symbol text NOT NULL,
  coin_name text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  purchase_price numeric NOT NULL CHECK (purchase_price >= 0),
  purchase_date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for portfolio_holdings
CREATE POLICY "Users can view their own holdings"
ON public.portfolio_holdings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own holdings"
ON public.portfolio_holdings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holdings"
ON public.portfolio_holdings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own holdings"
ON public.portfolio_holdings
FOR DELETE
USING (auth.uid() = user_id);

-- Create price alerts table
CREATE TABLE public.price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_symbol text NOT NULL,
  coin_name text NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'volume_spike')),
  target_value numeric NOT NULL CHECK (target_value >= 0),
  is_active boolean NOT NULL DEFAULT true,
  triggered_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for price_alerts
CREATE POLICY "Users can view their own alerts"
ON public.price_alerts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
ON public.price_alerts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON public.price_alerts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
ON public.price_alerts
FOR DELETE
USING (auth.uid() = user_id);

-- Create user settings table
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  default_currency text NOT NULL DEFAULT 'USD',
  theme_preference text NOT NULL DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  price_alert_notifications boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_portfolio_holdings_updated_at
BEFORE UPDATE ON public.portfolio_holdings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_price_alerts_updated_at
BEFORE UPDATE ON public.price_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();