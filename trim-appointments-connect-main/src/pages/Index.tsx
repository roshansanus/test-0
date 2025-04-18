
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import SearchBar from '@/components/home/SearchBar';
import SalonList from '@/components/salons/SalonList';
import { SalonProps } from '@/components/salons/SalonCard';

const mockSalons: SalonProps[] = [
  {
    id: '1',
    name: 'Classic Cuts Barbershop',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGJhcmJlcnxlbnwwfHwwfHx8MA%3D%3D',
    rating: 4.8,
    reviewCount: 124,
    address: '123 Main St, Brooklyn, NY',
    distance: '0.5 mi',
    isOpen: true,
    waitTime: '15 min',
    services: ['Haircut', 'Beard Trim', 'Shave']
  },
  {
    id: '2',
    name: 'Elite Hair Studio',
    image: 'https://images.unsplash.com/photo-1572157510206-7e9a99c00384?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmFyYmVyfGVufDB8fDB8fHww',
    rating: 4.5,
    reviewCount: 89,
    address: '456 Park Ave, Manhattan, NY',
    distance: '1.2 mi',
    isOpen: true,
    waitTime: '30 min',
    services: ['Haircut', 'Color', 'Highlights', 'Styling']
  },
  {
    id: '3',
    name: 'Modern Grooming Lounge',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJhcmJlciUyMHNob3B8ZW58MHx8MHx8fDA%3D',
    rating: 4.9,
    reviewCount: 212,
    address: '789 Broadway, Queens, NY',
    distance: '1.8 mi',
    isOpen: true,
    services: ['Haircut', 'Beard Trim', 'Facial', 'Hot Towel']
  },
  {
    id: '4',
    name: 'Luxury Salon & Spa',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGJhcmJlciUyMHNob3B8ZW58MHx8MHx8fDA%3D',
    rating: 4.7,
    reviewCount: 176,
    address: '321 Oak St, Bronx, NY',
    distance: '2.5 mi',
    isOpen: false,
    services: ['Haircut', 'Color', 'Styling', 'Manicure', 'Pedicure']
  },
  {
    id: '5',
    name: 'Gentleman\'s Quarters',
    image: 'https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGJhcmJlciUyMHNob3B8ZW58MHx8MHx8fDA%3D',
    rating: 4.6,
    reviewCount: 95,
    address: '567 Pine St, Staten Island, NY',
    distance: '3.1 mi',
    isOpen: true,
    waitTime: '10 min',
    services: ['Haircut', 'Beard Design', 'Shave', 'Hair Treatment']
  },
  {
    id: '6',
    name: 'Trendy Cuts & Styles',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGFpciUyMHNhbG9ufGVufDB8fDB8fHww',
    rating: 4.4,
    reviewCount: 67,
    address: '890 Maple Ave, Brooklyn, NY',
    distance: '1.5 mi',
    isOpen: true,
    waitTime: '45 min',
    services: ['Haircut', 'Color', 'Blowout', 'Extensions']
  }
];

const Index = () => {
  const [salons, setSalons] = useState<SalonProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch salons
    const fetchSalons = async () => {
      setIsLoading(true);
      // In a real application, we would fetch from API
      // For now, we'll use our mock data with a delay to simulate loading
      setTimeout(() => {
        setSalons(mockSalons);
        setIsLoading(false);
      }, 1000);
    };

    fetchSalons();
  }, []);

  const handleSearch = (location: string) => {
    console.log('Searching near:', location);
    // In a real app, we would fetch salons near the location
    // For now, we'll just use our mock data
    setIsLoading(true);
    setTimeout(() => {
      setSalons(mockSalons);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Layout>
      <Hero />
      
      <section className="py-12 bg-gray-50">
        <div className="salon-container">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl font-bold mb-4">Find Nearby Salons</h2>
            <p className="text-gray-600">
              Enter your location to discover the best salons near you
            </p>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>
      
      <section className="py-12">
        <div className="salon-container">
          <SalonList 
            salons={salons} 
            isLoading={isLoading}
          />
        </div>
      </section>
      
      <section className="py-12 bg-salon-light">
        <div className="salon-container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600">
              Book your salon appointment in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-salon-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-salon-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find a Salon</h3>
              <p className="text-gray-600">
                Search for salons near you and browse services, ratings, and availability.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-salon-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-salon-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book an Appointment</h3>
              <p className="text-gray-600">
                Select your preferred services, choose a time slot, and confirm your booking.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-salon-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-salon-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Service</h3>
              <p className="text-gray-600">
                Arrive at the salon at your scheduled time and skip the waiting line.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
