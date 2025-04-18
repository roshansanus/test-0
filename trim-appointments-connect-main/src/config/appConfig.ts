
// App-wide configuration with defaults
import { supabase } from '@/integrations/supabase/client';

export type MapProvider = 'google' | 'openstreetmap';

export interface AppConfig {
  mapProvider: MapProvider;
  googleMapsApiKey: string;
  smsAlertApiKey: string;
  smsAlertSenderId: string;
}

// Default configuration with dummy keys
const defaultConfig: AppConfig = {
  mapProvider: 'openstreetmap', // Default to open source option
  googleMapsApiKey: 'DUMMY_GOOGLE_MAPS_API_KEY',
  smsAlertApiKey: 'DUMMY_SMSALERT_API_KEY',
  smsAlertSenderId: 'SALONAPP',
};

// Keep a cached version to avoid repeated DB calls
let cachedConfig: AppConfig | null = null;

// Function to fetch config from database or use defaults
export const getAppConfig = async (): Promise<AppConfig> => {
  // Return cached config if available
  if (cachedConfig) return cachedConfig;
  
  try {
    // Use type assertion to bypass TypeScript checking for RPC function
    const { data, error } = await (supabase.rpc as any)('get_app_config');
    
    if (error || !data) {
      console.log('Using default config, DB fetch failed:', error?.message);
      cachedConfig = defaultConfig;
      return defaultConfig;
    }
    
    // Cast the data to our expected structure
    const configData = data as {
      map_provider: string;
      google_maps_api_key: string;
      smsalert_api_key: string;
      smsalert_sender_id: string;
    };
    
    // Map the database fields to our config object
    cachedConfig = {
      mapProvider: (configData.map_provider as MapProvider) || defaultConfig.mapProvider,
      googleMapsApiKey: configData.google_maps_api_key || defaultConfig.googleMapsApiKey,
      smsAlertApiKey: configData.smsalert_api_key || defaultConfig.smsAlertApiKey,
      smsAlertSenderId: configData.smsalert_sender_id || defaultConfig.smsAlertSenderId,
    };
    
    return cachedConfig;
  } catch (err) {
    console.error('Error fetching app config:', err);
    cachedConfig = defaultConfig;
    return defaultConfig;
  }
};

// Function to get the current map provider
export const getCurrentMapProvider = async (): Promise<MapProvider> => {
  const config = await getAppConfig();
  return config.mapProvider;
};
