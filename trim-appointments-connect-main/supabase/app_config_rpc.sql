
-- Create a function to get app_config data
CREATE OR REPLACE FUNCTION public.get_app_config()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_data json;
BEGIN
  SELECT json_build_object(
    'map_provider', map_provider,
    'google_maps_api_key', google_maps_api_key,
    'smsalert_api_key', smsalert_api_key,
    'smsalert_sender_id', smsalert_sender_id
  )
  INTO config_data
  FROM app_config
  LIMIT 1;

  IF config_data IS NULL THEN
    RETURN '{}'::json;
  END IF;

  RETURN config_data;
END;
$$;

-- Need to grant EXECUTE permission on the function
GRANT EXECUTE ON FUNCTION public.get_app_config() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_config() TO anon;
