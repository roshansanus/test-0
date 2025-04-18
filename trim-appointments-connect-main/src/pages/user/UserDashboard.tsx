import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock, Scissors } from 'lucide-react';
import { Appointment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AppointmentWithSalon extends Appointment {
  salon?: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
}

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithSalon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            salon:salon_id(name, address, city, state)
          `)
          .eq('user_id', user.id)
          .in('status', ['pending', 'confirmed'])
          .gt('appointment_date', new Date().toISOString().split('T')[0])
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true })
          .limit(5);

        if (error) throw error;
        setUpcomingAppointments(data || []);
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
  }, [user]);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {profile?.first_name || 'User'}</h1>
          <p className="text-muted-foreground">
            Manage your appointments and profile all in one place
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <User className="mr-2 h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Update your personal information and preferences
              </p>
              <Button asChild>
                <Link to="/user/profile">View Profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Calendar className="mr-2 h-5 w-5" />
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                View and manage all your upcoming appointments
              </p>
              <Button asChild>
                <Link to="/user/appointments">View Appointments</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Scissors className="mr-2 h-5 w-5" />
                Book Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Find a salon and book a new appointment
              </p>
              <Button asChild>
                <Link to="/salons">Browse Salons</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {appointment.salon?.name || 'Salon'}
                        </h3>
                        <p className="text-muted-foreground">
                          {appointment.salon?.address}, {appointment.salon?.city}
                        </p>
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
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/user/appointments/${appointment.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">You don't have any upcoming appointments</p>
                <Button asChild>
                  <Link to="/salons">Book an Appointment</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
