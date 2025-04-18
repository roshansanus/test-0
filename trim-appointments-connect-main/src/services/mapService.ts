
import { getAppConfig, MapProvider } from '@/config/appConfig';

// Function to calculate distance between coordinates using Haversine formula
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Service to get the current map provider from config
export const getCurrentMapProvider = async (): Promise<MapProvider> => {
  const config = await getAppConfig();
  return config.mapProvider;
};

// Format a distance nicely
export const formatDistance = (distanceInKm: number): string => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
};

// Get directions URL based on map provider
export const getDirectionsUrl = async (
  destinationLat: number, 
  destinationLng: number,
  destinationName?: string
): Promise<string> => {
  const config = await getAppConfig();
  const provider = config.mapProvider;
  
  if (provider === 'google') {
    return `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}&destination_place_id=${encodeURIComponent(destinationName || '')}`;
  }
  
  // OpenStreetMap/OSM
  return `https://www.openstreetmap.org/directions?from=&to=${destinationLat},${destinationLng}`;
};
