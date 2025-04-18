
import { Star, Clock, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface SalonProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  address: string;
  distance?: string;
  isOpen: boolean;
  waitTime?: string;
  services: string[];
}

const SalonCard = ({
  id,
  name,
  image,
  rating,
  reviewCount,
  address,
  distance,
  isOpen,
  waitTime,
  services
}: SalonProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        {distance && (
          <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <MapPin size={12} className="mr-1 text-salon-primary" />
            {distance} away
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg truncate">{name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="font-medium">{rating}</span>
            <span className="text-gray-500 text-xs ml-1">({reviewCount})</span>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm mt-1 flex items-center">
          <MapPin size={14} className="mr-1" />
          {address}
        </p>
        
        <div className="flex items-center mt-2 space-x-2">
          <Badge 
            variant={isOpen ? "default" : "outline"}
            className={isOpen ? "bg-green-500 hover:bg-green-600" : "text-gray-500"}
          >
            {isOpen ? "Open Now" : "Closed"}
          </Badge>
          
          {waitTime && isOpen && (
            <Badge variant="outline" className="flex items-center">
              <Clock size={12} className="mr-1" />
              {waitTime} wait
            </Badge>
          )}
        </div>
        
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-1">Services:</div>
          <div className="flex flex-wrap gap-1">
            {services.slice(0, 3).map((service, index) => (
              <Badge key={index} variant="secondary" className="bg-salon-light text-salon-secondary">
                {service}
              </Badge>
            ))}
            {services.length > 3 && (
              <Badge variant="secondary" className="bg-salon-light text-salon-secondary">
                +{services.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <Users size={14} className="mr-1" />
            {Math.floor(Math.random() * 10) + 1} people booked today
          </div>
          <Button asChild className="bg-salon-primary hover:bg-salon-secondary">
            <Link to={`/salon/${id}`}>Book Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SalonCard;
