
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin } from 'lucide-react';
import { Salon } from '@/types';
import { getAllSalons, getNearbySalons } from '@/services/salonService';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const SalonSearch = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch all salons on page load
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    setLoading(true);
    try {
      const data = await getAllSalons();
      setSalons(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load salons. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNearbySearch = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          
          try {
            const nearbySalons = await getNearbySalons(latitude, longitude);
            setSalons(nearbySalons);
            
            toast({
              title: 'Location found',
              description: `Found ${nearbySalons.length} salons near your location.`,
            });
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to find nearby salons.',
              variant: 'destructive',
            });
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: 'Location access denied',
            description: 'Please enable location services to find nearby salons.',
            variant: 'destructive',
          });
          setLoading(false);
        }
      );
    } else {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      fetchSalons();
      return;
    }
    
    const filteredSalons = salons.filter(salon => 
      salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSalons(filteredSalons);
  };

  const renderSalonCard = (salon: Salon) => (
    <Card key={salon.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative bg-muted">
        {salon.banner_url ? (
          <img 
            src={salon.banner_url} 
            alt={salon.name} 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-salon-primary to-salon-secondary text-white font-bold text-xl">
            {salon.name}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">{salon.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center">
              <MapPin size={14} className="mr-1" />
              {salon.address}, {salon.city}
            </p>
          </div>
          {salon.logo_url && (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow">
              <img 
                src={salon.logo_url} 
                alt={`${salon.name} logo`} 
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm">
            <span className="font-medium">Hours:</span> {salon.opening_time} - {salon.closing_time}
          </p>
          {salon.is_accepting_appointments ? (
            <p className="text-sm text-green-600 font-medium">Accepting appointments</p>
          ) : (
            <p className="text-sm text-red-600 font-medium">Not accepting appointments</p>
          )}
        </div>
        <div className="mt-4">
          <Button asChild className="w-full bg-salon-primary hover:bg-salon-secondary">
            <Link to={`/salon/${salon.id}`}>View Details & Book</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="salon-container py-8">
        <h1 className="text-3xl font-bold mb-6">Find Salons</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search by name, city, or address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            Search
          </Button>
          <Button onClick={handleNearbySearch} variant="outline" disabled={loading}>
            <MapPin className="mr-2" size={16} />
            Nearby Salons
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {salons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {salons.map(renderSalonCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium">No salons found</h3>
                <p className="text-muted-foreground mt-2">Try a different search or check nearby salons.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default SalonSearch;
