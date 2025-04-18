
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';
import { getAppConfig } from '@/config/appConfig';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerTitle?: string;
  height?: string;
  className?: string;
}

// For TypeScript - define Google Maps types that we need
declare global {
  interface Window {
    initGoogleMap?: () => void;
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        Animation: {
          DROP: number;
        };
      };
    };
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  latitude,
  longitude,
  zoom = 15,
  markerTitle = "Location",
  height = "400px",
  className = ""
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      try {
        // Get API key from config
        const config = await getAppConfig();
        
        // Skip if the map ref is not available or key is not set
        if (!mapRef.current || !config.googleMapsApiKey || config.googleMapsApiKey === 'DUMMY_GOOGLE_MAPS_API_KEY') {
          setError("Google Maps API key not configured");
          return;
        }

        // Check if Google Maps API is already loaded
        if (window.google && window.google.maps) {
          initMap();
          return;
        }

        // Create script element for Google Maps
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&callback=initGoogleMap`;
        script.async = true;
        script.defer = true;
        
        // Define global callback
        window.initGoogleMap = initMap;
        
        // Handle errors
        script.onerror = () => {
          setError("Failed to load Google Maps");
          setIsLoaded(true);
        };
        
        document.head.appendChild(script);
        
        return () => {
          // Clean up
          if (script.parentNode) {
            document.head.removeChild(script);
          }
          delete window.initGoogleMap;
        };
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError("Failed to initialize map");
        setIsLoaded(true);
      }
    };

    const initMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps) return;
      
      try {
        const mapOptions = {
          center: { lat: latitude, lng: longitude },
          zoom: zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        };
        
        const map = new window.google.maps.Map(mapRef.current, mapOptions);
        
        // Add marker
        new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map,
          title: markerTitle,
          animation: window.google.maps.Animation.DROP,
        });
        
        setIsLoaded(true);
      } catch (err) {
        console.error("Error initializing Google Maps:", err);
        setError("Failed to initialize map");
        setIsLoaded(true);
      }
    };

    loadMap();
  }, [latitude, longitude, zoom, markerTitle]);

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 flex-col p-4">
          <p className="text-destructive mb-2">Unable to load Google Maps</p>
          <p className="text-sm text-muted-foreground text-center">{error}</p>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default GoogleMap;
