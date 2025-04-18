
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Phone, Mail, Clock, Calendar, Scissors, Star, ArrowRight } from 'lucide-react';
import { Service, Salon } from '@/types';

const SalonBusinessPage = () => {
  const { id } = useParams<{ id: string }>();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSalonDetails = async () => {
      if (!id) return;

      try {
        // Fetch salon details
        const { data: salonData, error: salonError } = await supabase
          .from('salons')
          .select('*')
          .eq('id', id)
          .single();

        if (salonError) throw salonError;

        if (!salonData.is_verified) {
          toast({
            title: 'Salon Not Available',
            description: 'This salon is currently pending verification.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        setSalon(salonData);

        // Fetch salon services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('salon_id', id)
          .eq('is_active', true)
          .order('name');

        if (servicesError) throw servicesError;
        setServices(servicesData || []);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load salon information',
          variant: 'destructive',
        });
        console.error('Error fetching salon details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalonDetails();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!salon) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Salon Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The salon you're looking for doesn't exist or is not available at the moment.
              </p>
              <Button asChild>
                <Link to="/salons">Browse Other Salons</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="relative mb-6">
          <div className="h-48 md:h-64 w-full bg-gradient-to-r from-salon-primary to-salon-secondary rounded-lg overflow-hidden">
            {salon.banner_url ? (
              <img 
                src={salon.banner_url} 
                alt={salon.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white text-2xl font-bold">
                {salon.name}
              </div>
            )}
          </div>
          <div className="absolute -bottom-12 left-8 h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
            {salon.logo_url ? (
              <img 
                src={salon.logo_url} 
                alt={salon.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-salon-primary text-white font-bold text-2xl">
                {salon.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                {salon.name}
                {salon.is_verified && (
                  <Badge className="ml-2 bg-green-500">Verified</Badge>
                )}
              </h1>
              <p className="text-muted-foreground flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {salon.address}, {salon.city}, {salon.state}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button asChild>
                <Link to={`/book/${salon.id}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="about" className="mt-8">
          <TabsList className="mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>About {salon.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {salon.description ? (
                      <p>{salon.description}</p>
                    ) : (
                      <p className="text-muted-foreground">No description available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Contact & Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {salon.phone_number && (
                        <div className="flex">
                          <Phone className="h-5 w-5 mr-3 text-primary" />
                          <span>{salon.phone_number}</span>
                        </div>
                      )}
                      {salon.email && (
                        <div className="flex">
                          <Mail className="h-5 w-5 mr-3 text-primary" />
                          <span>{salon.email}</span>
                        </div>
                      )}
                      <div className="flex">
                        <Clock className="h-5 w-5 mr-3 text-primary" />
                        <span>
                          {salon.opening_time?.slice(0, 5)} - {salon.closing_time?.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
                <CardDescription>
                  Below are the services available at {salon.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground">
                      No services listed for this salon yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => (
                      <Card key={service.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <Scissors className="h-5 w-5 mr-2 mt-1 text-primary" />
                              <div>
                                <h3 className="font-semibold">{service.name}</h3>
                                {service.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {service.duration_minutes} minutes
                              </span>
                            </div>
                            <p className="font-semibold">₹{service.price}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="mt-6 text-center">
              <Button asChild>
                <Link to={`/book/${salon.id}`}>
                  Book an Appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SalonBusinessPage;
