
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Appointment, AppointmentStatus, AppointmentWithServices } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const getStatusColor = (status: AppointmentStatus) => {
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

const getStatusIcon = (status: AppointmentStatus) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle className="h-4 w-4 mr-1" />;
    case 'pending':
      return <AlertCircle className="h-4 w-4 mr-1" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 mr-1" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 mr-1" />;
    default:
      return null;
  }
};

const formatStatus = (status: AppointmentStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const UserAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        let query = supabase
          .from('appointments')
          .select(`
            *,
            salon:salon_id(id, name, address, city, state)
          `)
          .eq('user_id', user.id);

        if (activeTab === 'upcoming') {
          query = query
            .in('status', ['pending', 'confirmed'])
            .gte('appointment_date', today);
        } else if (activeTab === 'past') {
          query = query
            .or(`appointment_date.lt.${today},and(status.eq.completed,status.eq.no_show,status.eq.cancelled)`);
        } else if (activeTab === 'cancelled') {
          query = query.eq('status', 'cancelled');
        }

        const { data, error } = await query
          .order('appointment_date', { ascending: activeTab === 'upcoming' })
          .order('appointment_time', { ascending: true });

        if (error) throw error;
        
        // Convert the response data to AppointmentWithServices type
        const appointmentsWithServices = (data || []).map(appointment => ({
          ...appointment,
          services: [], // Initialize with empty services array
          salon: appointment.salon || { 
            id: appointment.salon_id, 
            name: 'Unknown Salon', 
            address: '', 
            city: '', 
            state: ''
          }
        })) as AppointmentWithServices[];
        
        setAppointments(appointmentsWithServices);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load appointments',
          variant: 'destructive',
        });
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user, activeTab]);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
        )
      );

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

  const canCancel = (appointment: AppointmentWithServices) => {
    return ['pending', 'confirmed'].includes(appointment.status) && 
           new Date(appointment.appointment_date) > new Date();
  };

  const renderAppointmentsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No appointments found</p>
            <Button asChild>
              <Link to="/salons">Book an Appointment</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4">
        {appointments.map(appointment => (
          <Card key={appointment.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {appointment.salon?.name || 'Salon'}
                      {appointment.readable_id && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          #{appointment.readable_id}
                        </span>
                      )}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {appointment.salon?.address}, {appointment.salon?.city}
                    </p>
                    <div className="flex items-center mt-2">
                      <Badge className={`flex items-center ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        {formatStatus(appointment.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{appointment.appointment_time.slice(0, 5)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/user/appointments/${appointment.id}`}>View Details</Link>
                    </Button>
                    {canCancel(appointment) && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
          <p className="text-muted-foreground">View and manage all your appointments</p>
        </div>

        <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {renderAppointmentsList()}
          </TabsContent>

          <TabsContent value="past">
            {renderAppointmentsList()}
          </TabsContent>

          <TabsContent value="cancelled">
            {renderAppointmentsList()}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserAppointments;
