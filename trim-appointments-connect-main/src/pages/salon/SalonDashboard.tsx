
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Scissors, Users, Clock, BarChart, CheckCircle, AlertCircle } from 'lucide-react';
import { Appointment, AppointmentWithServices } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const SalonDashboard = () => {
  const { user, profile } = useAuth();
  const [salon, setSalon] = useState<any>(null);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentWithServices[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    totalServices: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSalonAndAppointments = async () => {
      if (!user || !profile || profile.role !== 'salon_owner') return;

      try {
        // Fetch salon details
        const { data: salonData, error: salonError } = await supabase
          .from('salons')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (salonError) throw salonError;
        setSalon(salonData);

        const today = new Date().toISOString().split('T')[0];

        // Fetch today's appointments
        const { data: todayAppts, error: apptError } = await supabase
          .from('appointments')
          .select(`
            *,
            user:user_id(
              first_name, 
              last_name,
              phone_number
            )
          `)
          .eq('salon_id', salonData.id)
          .eq('appointment_date', today)
          .order('appointment_time');

        if (apptError) throw apptError;
        setTodayAppointments(todayAppts as AppointmentWithServices[]);

        // Fetch appointment stats
        const { data: totalAppts, error: totalError } = await supabase
          .from('appointments')
          .select('count', { count: 'exact' })
          .eq('salon_id', salonData.id);
        
        const { data: pendingAppts, error: pendingError } = await supabase
          .from('appointments')
          .select('count', { count: 'exact' })
          .eq('salon_id', salonData.id)
          .eq('status', 'pending');
          
        const { data: todayCount, error: todayError } = await supabase
          .from('appointments')
          .select('count', { count: 'exact' })
          .eq('salon_id', salonData.id)
          .eq('appointment_date', today);

        const { data: servicesCount, error: servicesError } = await supabase
          .from('services')
          .select('count', { count: 'exact' })
          .eq('salon_id', salonData.id);

        setStats({
          totalAppointments: totalAppts?.[0]?.count || 0,
          pendingAppointments: pendingAppts?.[0]?.count || 0,
          todayAppointments: todayCount?.[0]?.count || 0,
          totalServices: servicesCount?.[0]?.count || 0
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load salon information',
          variant: 'destructive',
        });
        console.error('Error fetching salon data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalonAndAppointments();
  }, [user, profile]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: 'confirmed' | 'completed' | 'cancelled' | 'no_show') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      setTodayAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

      toast({
        title: 'Status Updated',
        description: `Appointment status has been updated to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update appointment status',
        variant: 'destructive',
      });
      console.error('Error updating status:', error);
    }
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

  if (!salon) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Salon Found</h2>
              <p className="text-muted-foreground mb-4">
                You don't have a salon registered. Please create a salon first.
              </p>
              <Button asChild>
                <Link to="/salon/setup">Create Salon</Link>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{salon.name} Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your salon, appointments, and services
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{stats.todayAppointments}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Services Offered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Scissors className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{stats.totalServices}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map(appointment => (
                    <div key={appointment.id} className="border rounded-md p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            <h4 className="font-medium">
                              {appointment.user?.first_name} {appointment.user?.last_name}
                              {appointment.readable_id && (
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                  #{appointment.readable_id}
                                </span>
                              )}
                            </h4>
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock className="h-4 w-4 mr-2" />
                            <p className="text-sm">{appointment.appointment_time.slice(0, 5)}</p>
                          </div>
                          {appointment.user?.phone_number && (
                            <p className="text-sm mt-1">
                              Phone: {appointment.user?.phone_number}
                            </p>
                          )}
                          <div className="mt-2">
                            <Badge className={
                              appointment.status === 'confirmed' ? 'bg-green-500' :
                              appointment.status === 'pending' ? 'bg-yellow-500' :
                              appointment.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                            }>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {appointment.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
                          {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                            >
                              Mark Completed
                            </Button>
                          )}
                          {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateStatus(appointment.id, 'no_show')}
                            >
                              No Show
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            asChild
                          >
                            <Link to={`/salon/appointments/${appointment.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Button asChild>
                  <Link to="/salon/appointments">View All Appointments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link to="/salon/appointments">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Appointments
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link to="/salon/services">
                  <Scissors className="mr-2 h-4 w-4" />
                  Manage Services
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/salon/profile">
                  <Users className="mr-2 h-4 w-4" />
                  Edit Salon Profile
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/salon/analytics">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SalonDashboard;
