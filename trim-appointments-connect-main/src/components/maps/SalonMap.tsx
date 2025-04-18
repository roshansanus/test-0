
import React, { useEffect, useState } from 'react';
import GoogleMap from './GoogleMap';
import OpenStreetMap from './OpenStreetMap';
import { MapProvider } from '@/config/appConfig';
import { getCurrentMapProvider } from '@/services/mapService';
import { Loader } from 'lucide-react';

interface SalonMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  salonName?: string;
  height?: string;
  className?: string;
}

const SalonMap: React.FC<SalonMapProps> = ({
  latitude,
  longitude,
  zoom = 15,
  salonName = "Salon Location",
  height = "400px",
  className = ""
}) => {
  const [mapProvider, setMapProvider] = useState<MapProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProvider = async () => {
      try {
        const provider = await getCurrentMapProvider();
        setMapProvider(provider);
      } catch (error) {
        console.error("Error loading map provider:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProvider();
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {mapProvider === 'google' ? (
        <GoogleMap
          latitude={latitude}
          longitude={longitude}
          zoom={zoom}
          markerTitle={salonName}
          height={height}
          className={className}
        />
      ) : (
        <OpenStreetMap
          latitude={latitude}
          longitude={longitude}
          zoom={zoom}
          markerTitle={salonName}
          height={height}
          className={className}
        />
      )}
    </>
  );
};

export default SalonMap;
