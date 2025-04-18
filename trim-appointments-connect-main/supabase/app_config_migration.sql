
-- Create app_config table for storing application settings
CREATE TABLE IF NOT EXISTS public.app_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  map_provider TEXT NOT NULL DEFAULT 'openstreetmap',
  google_maps_api_key TEXT,
  smsalert_api_key TEXT,
  smsalert_sender_id TEXT DEFAULT 'SALONAPP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure only one row of app config is allowed
CREATE UNIQUE INDEX IF NOT EXISTS app_config_singleton_idx ON public.app_config ((true));

-- Add RLS policies to restrict access
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Only allow admins to manage app config
CREATE POLICY "Admins can manage app_config" 
ON public.app_config
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Add is_phone_verified field to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT false;

-- Create stored procedure for updating app_config (to avoid type issues with direct updates)
CREATE OR REPLACE FUNCTION public.update_app_config(
  p_map_provider TEXT,
  p_google_maps_api_key TEXT,
  p_smsalert_api_key TEXT,
  p_smsalert_sender_id TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.app_config
  SET 
    map_provider = p_map_provider,
    google_maps_api_key = p_google_maps_api_key,
    smsalert_api_key = p_smsalert_api_key,
    smsalert_sender_id = p_smsalert_sender_id,
    updated_at = NOW()
  WHERE true;
END;
$$;

-- Create stored procedure for inserting app_config (to avoid type issues with direct inserts)
CREATE OR REPLACE FUNCTION public.insert_app_config(
  p_map_provider TEXT,
  p_google_maps_api_key TEXT,
  p_smsalert_api_key TEXT,
  p_smsalert_sender_id TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.app_config (
    map_provider,
    google_maps_api_key,
    smsalert_api_key,
    smsalert_sender_id
  ) VALUES (
    p_map_provider,
    p_google_maps_api_key,
    p_smsalert_api_key,
    p_smsalert_sender_id
  );
END;
$$;
