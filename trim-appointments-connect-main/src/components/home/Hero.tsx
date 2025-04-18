
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <div className="relative bg-gradient-to-b from-salon-light to-white py-16 md:py-24">
      <div className="salon-container">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Book Your Perfect <span className="bg-gradient-to-r from-salon-primary to-salon-secondary bg-clip-text text-transparent">Salon Experience</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Find nearby salons, compare services, and book appointments instantly.
            No more waiting in lines!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild size="lg" className="bg-salon-primary hover:bg-salon-secondary">
              <Link to="/salons">
                Find Salons Near Me <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/signup/salon">Join as a Salon Owner</Link>
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-4">
              <div className="text-3xl font-bold text-salon-primary">500+</div>
              <div className="text-sm text-gray-600">Salons</div>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="text-3xl font-bold text-salon-primary">10k+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="text-3xl font-bold text-salon-primary">50k+</div>
              <div className="text-sm text-gray-600">Bookings</div>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="text-3xl font-bold text-salon-primary">15+</div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
