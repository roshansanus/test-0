
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentWithServices, Service } from '@/types';
import { Calendar, Clock, MapPin, Phone, Mail, Scissors, AlertCircle, X, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'cancelled':
      return 'bg-red-500';
    case 'completed':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle className="h-4 w-4 mr-1" />;
    case 'pending':
      return <AlertCircle className="h-4 w-4 mr-1" />;
    case 'cancelled':
      return <X className="h-4 w-4 mr-1" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 mr-1" />;
    default:
      return null;
  }
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const AppointmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<AppointmentWithServices | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!id || !user) return;

      try {
        // Fetch appointment with salon details
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            *,
            salon:salon_id(*)
          `)
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (appointmentError) throw appointmentError;

        // Fetch services for this appointment
        const { data: servicesData, error: servicesError } = await supabase
          .from('appointment_services')
          .select(`
            service:service_id(*)
          `)
          .eq('appointment_id', id);

        if (servicesError) throw servicesError;

        const extractedServices = servicesData.map(item => item.service as Service);

        setAppointment(appointmentData as AppointmentWithServices);
        setServices(extractedServices);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load appointment details',
          variant: 'destructive',
        });
        console.error('Error fetching appointment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [id, user]);

  const handleCancelAppointment = async () => {
    if (!appointment || !user) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointment.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAppointment({
        ...appointment,
        status: 'cancelled'
      });

      toast({
        title: 'Appointment Cancelled',
        description: 'Your appointment has been cancelled successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment',
        variant: 'destructive',
      });
      console.error('Error cancelling appointment:', error);
    }
  };

  const calculateTotalAmount = () => {
    return services.reduce((total, service) => total + Number(service.price), 0);
  };

  const canCancel = () => {
    if (!appointment) return false;
    
    return ['pending', 'confirmed'].includes(appointment.status) && 
           new Date(appointment.appointment_date) > new Date();
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!appointment) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Appointment Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The appointment you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button asChild>
                <a href="/user/appointments">Back to Appointments</a>
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
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            Appointment Details
            {appointment.readable_id && (
              <span className="ml-2 text-lg font-normal text-muted-foreground">
                #{appointment.readable_id}
              </span>
            )}
          </h1>
          <div className="flex items-center">
            <Badge className={`flex items-center ${getStatusColor(appointment.status)}`}>
              {getStatusIcon(appointment.status)}
              {formatStatus(appointment.status)}
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-3">
                      <Calendar className="mr-2 h-5 w-5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p>{new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric' 
                        })}</p>
                      </div>
                    </div>
                    <div className="flex items-center mb-3">
                      <Clock className="mr-2 h-5 w-5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p>{appointment.appointment_time.slice(0, 5)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
                      <p>{appointment.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Selected Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map(service => (
                    <div key={service.id} className="flex justify-between items-center">
                      <div className="flex items-start">
                        <Scissors className="mr-2 h-5 w-5 mt-1" />
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.duration_minutes} minutes
                          </p>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold">₹{service.price}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total Amount</p>
                  <p className="font-semibold">₹{calculateTotalAmount()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Salon Information</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg">{appointment.salon?.name}</h3>
                <div className="mt-3 space-y-3">
                  <div className="flex">
                    <MapPin className="mr-2 h-5 w-5" />
                    <p className="text-sm">
                      {appointment.salon?.address}, {appointment.salon?.city}, {appointment.salon?.state}
                    </p>
                  </div>
                  {appointment.salon?.phone_number && (
                    <div className="flex">
                      <Phone className="mr-2 h-5 w-5" />
                      <p className="text-sm">{appointment.salon?.phone_number}</p>
                    </div>
                  )}
                  {appointment.salon?.email && (
                    <div className="flex">
                      <Mail className="mr-2 h-5 w-5" />
                      <p className="text-sm">{appointment.salon?.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              {canCancel() && (
                <Button 
                  variant="destructive" 
                  className="w-full mb-4"
                  onClick={handleCancelAppointment}
                >
                  Cancel Appointment
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <a href="/user/appointments">Back to Appointments</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentDetail;
