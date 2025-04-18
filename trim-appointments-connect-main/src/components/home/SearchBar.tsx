
import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (location: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(location);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would convert coordinates to an address
          // For now, we'll just use a placeholder
          setLocation('Current location');
          onSearch('Current location');
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative flex items-center">
        <div className="absolute left-3 text-gray-400">
          <MapPin size={20} />
        </div>
        <Input
          type="text"
          placeholder="Enter your location to find nearby salons..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="pl-10 pr-32 h-14 text-base rounded-full border-2 border-gray-200 focus:border-salon-primary"
        />
        <div className="absolute right-2 flex space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-salon-primary hover:text-salon-secondary hover:bg-transparent"
            onClick={handleGetCurrentLocation}
          >
            Use Current
          </Button>
          <Button 
            type="submit" 
            className="bg-salon-primary hover:bg-salon-secondary rounded-full"
          >
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
