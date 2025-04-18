
import { supabase } from '@/integrations/supabase/client';
import { Salon, Service } from '@/types';

// Get all active salons
export const getAllSalons = async (): Promise<Salon[]> => {
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('is_active', true);
    
  if (error) {
    console.error('Error fetching salons:', error);
    throw error;
  }
  
  return data || [];
};

// Get nearby salons based on latitude and longitude
export const getNearbySalons = async (
  latitude: number,
  longitude: number,
  radiusInKm: number = 10
): Promise<Salon[]> => {
  // Note: This is a simple implementation that doesn't use PostGIS
  // Ideally, you'd use a geospatial query with PostGIS for better performance
  
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('is_active', true);
    
  if (error) {
    console.error('Error fetching salons:', error);
    throw error;
  }
  
  // Filter salons based on distance
  const nearbySalons = data?.filter(salon => {
    if (!salon.latitude || !salon.longitude) return false;
    
    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      latitude,
      longitude,
      salon.latitude,
      salon.longitude
    );
    
    return distance <= radiusInKm;
  });
  
  return nearbySalons || [];
};

// Get a salon by ID
export const getSalonById = async (id: string): Promise<Salon | null> => {
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching salon:', error);
    throw error;
  }
  
  return data;
};

// Get services for a salon
export const getSalonServices = async (salonId: string): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true);
    
  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
  
  return data || [];
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (
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
