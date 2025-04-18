
import React, { useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface OpenStreetMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerTitle?: string;
  height?: string;
  className?: string;
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  latitude,
  longitude,
  zoom = 15,
  markerTitle = "Location",
  height = "400px",
  className = ""
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      try {
        // Skip if map ref is not available
        if (!mapRef.current) return;

        // Import Leaflet dynamically to avoid SSR issues
        const L = await import('leaflet');

        // Create map instance
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], zoom);
          
          // Add tile layer (OpenStreetMap)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapInstanceRef.current);
          
          // Fix marker icon issue
          const defaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          
          // Add marker
          L.marker([latitude, longitude], { icon: defaultIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(markerTitle)
            .openPopup();
            
          setIsLoaded(true);
        } else {
          // Update existing map view and marker
          mapInstanceRef.current.setView([latitude, longitude], zoom);
          
          // Clear existing markers and add new one
          mapInstanceRef.current.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) {
              mapInstanceRef.current.removeLayer(layer);
            }
          });
          
          const defaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          
          L.marker([latitude, longitude], { icon: defaultIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(markerTitle)
            .openPopup();
        }
      } catch (err) {
        console.error("Error loading OpenStreetMap:", err);
        setError("Failed to initialize map");
        setIsLoaded(true);
      }
    };

    loadMap();

    return () => {
      // Clean up map instance on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
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
          <p className="text-destructive mb-2">Unable to load map</p>
          <p className="text-sm text-muted-foreground text-center">{error}</p>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default OpenStreetMap;
