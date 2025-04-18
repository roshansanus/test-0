
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Salon, Service } from '@/types';
import { getSalonById, getSalonServices } from '@/services/salonService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Clock, MapPin, Phone, Mail, Calendar, Info, Navigation } from 'lucide-react';
import SalonMap from '@/components/maps/SalonMap';
import { getDirectionsUrl } from '@/services/mapService';

const SalonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!id) return;
    
    const fetchSalonData = async () => {
      setLoading(true);
      try {
        const salonData = await getSalonById(id);
        setSalon(salonData);
        
        if (salonData) {
          const servicesData = await getSalonServices(salonData.id);
          setServices(servicesData);
        }
      } catch (error) {
        console.error('Error fetching salon details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load salon details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSalonData();
  }, [id, toast]);

  const handleGetDirections = async () => {
    if (!salon || !salon.latitude || !salon.longitude) return;
    
    try {
      const url = await getDirectionsUrl(
        salon.latitude, 
        salon.longitude, 
        salon.name
      );
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening directions:', error);
    }
  };
  
  const handleBookAppointment = () => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to book an appointment',
      });
      navigate('/login');
      return;
    }
    
    navigate(`/book/${id}`);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }
  
  if (!salon) {
    return (
      <Layout>
        <div className="salon-container py-12 text-center">
          <h2 className="text-2xl font-bold">Salon not found</h2>
          <p className="mt-4">The salon you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/salons')} className="mt-6">
            View All Salons
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="relative">
        <div className="h-64 bg-gradient-to-r from-salon-primary to-salon-secondary">
          {salon.banner_url && (
            <img
              src={salon.banner_url}
              alt={salon.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <div className="salon-container relative -mt-16">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center">
                <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-white shadow bg-gradient-to-r from-salon-primary to-salon-secondary flex items-center justify-center text-white">
                  {salon.logo_url ? (
                    <img 
                      src={salon.logo_url} 
                      alt={`${salon.name} logo`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold">{salon.name.charAt(0)}</span>
                  )}
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl md:text-3xl font-bold">{salon.name}</h1>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin size={16} className="mr-1" />
                    {salon.address}, {salon.city}, {salon.state}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleGetDirections}
                >
                  <Navigation className="mr-2" size={16} />
                  Get Directions
                </Button>
                
                <Button
                  className="bg-salon-primary hover:bg-salon-secondary"
                  onClick={handleBookAppointment}
                  disabled={!salon.is_accepting_appointments}
                >
                  <Calendar className="mr-2" size={16} />
                  {salon.is_accepting_appointments ? 'Book Appointment' : 'Not Accepting Bookings'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="salon-container py-8">
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>
            
            <TabsContent value="services">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.length > 0 ? (
                  services.map((service) => (
                    <Card key={service.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex justify-between">
                          <span>{service.name}</span>
                          <span>₹{service.price}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          {service.description || 'No description available'}
                        </p>
                        <div className="flex items-center text-sm">
                          <Clock size={14} className="mr-1" />
                          {service.duration_minutes} minutes
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <p>No services found for this salon.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="info">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Info size={18} className="mr-2" />
                        About
                      </h3>
                      <p>{salon.description || 'No description provided.'}</p>
                      
                      <h3 className="text-lg font-semibold mt-6 mb-3 flex items-center">
                        <Clock size={18} className="mr-2" />
                        Business Hours
                      </h3>
                      <p>Open from {salon.opening_time} to {salon.closing_time}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <MapPin size={18} className="mr-2" />
                        Location
                      </h3>
                      <p>
                        {salon.address}<br />
                        {salon.city}, {salon.state} {salon.postal_code}<br />
                        {salon.country}
                      </p>
                      
                      <h3 className="text-lg font-semibold mt-6 mb-3">Contact Information</h3>
                      {salon.phone_number && (
                        <div className="flex items-center mb-2">
                          <Phone size={16} className="mr-2" />
                          {salon.phone_number}
                        </div>
                      )}
                      {salon.email && (
                        <div className="flex items-center">
                          <Mail size={16} className="mr-2" />
                          {salon.email}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="location">
              <Card>
                <CardContent className="pt-6">
                  {salon.latitude && salon.longitude ? (
                    <div className="space-y-4">
                      <SalonMap 
                        latitude={salon.latitude}
                        longitude={salon.longitude}
                        salonName={salon.name}
                        height="400px"
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleGetDirections} variant="outline">
                          <Navigation className="mr-2" size={16} />
                          Get Directions
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p>Location coordinates not available for this salon.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default SalonDetail;
