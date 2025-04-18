
import { useState } from 'react';
import SalonCard, { SalonProps } from './SalonCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, List, Grid3x3, SlidersHorizontal } from 'lucide-react';

interface SalonListProps {
  salons: SalonProps[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
}

const SalonList = ({ 
  salons, 
  isLoading = false, 
  title = "Nearby Salons",
  subtitle = "Find and book the best salons near you"
}: SalonListProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recommended');

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-600 mt-1">{subtitle}</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <MapPin className="text-salon-primary" size={18} />
          <span className="font-medium">
            Showing salons near <span className="text-salon-primary">New York</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1 border rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-salon-light text-salon-primary' : ''}`}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-salon-light text-salon-primary' : ''}`}
            >
              <List size={18} />
            </button>
          </div>
          
          <Button variant="outline" className="hidden sm:flex items-center">
            <SlidersHorizontal size={16} className="mr-2" />
            Filter
          </Button>
          
          <div className="w-[130px]">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="distance">Nearest</SelectItem>
                <SelectItem value="wait">Shortest Wait</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md h-80 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {salons.length > 0 ? salons.map((salon) => (
            <SalonCard key={salon.id} {...salon} />
          )) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No salons found in this area.</p>
              <p className="text-gray-500">Try changing your search location.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalonList;
