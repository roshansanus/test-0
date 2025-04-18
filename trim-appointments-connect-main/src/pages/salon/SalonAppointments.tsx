
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentWithServices } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { format, compareAsc } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SalonAppointments = () => {
  const { user } = useAuth();
  const [salon, setSalon] = useState<any>(null);
  const [appointments, setAppointments] = useState<AppointmentWithServices[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchSalon = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('salons')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (error) throw error;
        setSalon(data);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load salon information',
          variant: 'destructive',
        });
        console.error('Error fetching salon:', error);
      }
    };

    fetchSalon();
  }, [user]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!salon) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        let query = supabase
          .from('appointments')
          .select(`
            *,
            user:user_id(
              id,
              first_name, 
              last_name,
              phone_number,
              email
            )
          `)
          .eq('salon_id', salon.id);

        if (activeTab === 'upcoming') {
          query = query
            .in('status', ['pending', 'confirmed'])
            .gte('appointment_date', today);
        } else if (activeTab === 'past') {
          query = query
            .or(`appointment_date.lt.${today},and(status.eq.completed,status.eq.no_show)`)
        } else if (activeTab === 'cancelled') {
          query = query.eq('status', 'cancelled');
        } else if (activeTab === 'all') {
          // No additional filtering
        }

        const { data, error } = await query
          .order('appointment_date', { ascending: activeTab === 'upcoming' })
          .order('appointment_time', { ascending: true });

        if (error) throw error;
        setAppointments(data as AppointmentWithServices[]);
        setFilteredAppointments(data as AppointmentWithServices[]);
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
  }, [salon, activeTab]);

  useEffect(() => {
    let filtered = [...appointments];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.user?.first_name?.toLowerCase().includes(query) ||
        appointment.user?.last_name?.toLowerCase().includes(query) ||
        appointment.user?.phone_number?.includes(query) ||
        (appointment.readable_id && appointment.readable_id.includes(query))
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(appointment => 
        appointment.appointment_date === dateFilter
      );
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, searchQuery, dateFilter]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: 'confirmed' | 'completed' | 'cancelled' | 'no_show') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

      setFilteredAppointments(prev =>
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

  const getStatusBadge = (status: string) => {
    let background = '';
    let icon = null;
    
    switch (status) {
      case 'confirmed':
        background = 'bg-green-500';
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        break;
      case 'pending':
        background = 'bg-yellow-500';
        icon = <AlertCircle className="h-4 w-4 mr-1" />;
        break;
      case 'cancelled':
        background = 'bg-red-500';
        icon = <XCircle className="h-4 w-4 mr-1" />;
        break;
      case 'completed':
        background = 'bg-blue-500';
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        break;
      case 'no_show':
        background = 'bg-gray-500';
        icon = <XCircle className="h-4 w-4 mr-1" />;
        break;
      default:
        background = 'bg-gray-500';
    }

    return (
      <Badge className={`flex items-center ${background}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const renderAppointmentsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (filteredAppointments.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No appointments found</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {filteredAppointments.map(appointment => (
          <Card key={appointment.id}>
            <CardContent className="p-4">
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
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                    </span>
                    <Clock className="h-4 w-4 ml-4 mr-2" />
                    <span>{appointment.appointment_time.slice(0, 5)}</span>
                  </div>
                  {appointment.user?.phone_number && (
                    <p className="text-sm mt-1">
                      Phone: {appointment.user?.phone_number}
                    </p>
                  )}
                  <div className="mt-2">
                    {getStatusBadge(appointment.status)}
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
                      Complete
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
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                    >
                      Cancel
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
          <h1 className="text-3xl font-bold mb-2">Appointments</h1>
          <p className="text-muted-foreground">Manage all your salon appointments</p>
        </div>

        <div className="mb-6 grid gap-4 sm:flex sm:gap-6">
          <div className="w-full sm:w-1/2">
            <Label htmlFor="searchQuery">Search</Label>
            <Input
              id="searchQuery"
              placeholder="Search by name, phone, or appointment ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-1/2">
            <Label htmlFor="dateFilter">Filter by Date</Label>
            <Input
              id="dateFilter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          {(searchQuery || dateFilter) && (
            <div className="flex items-end">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchQuery('');
                  setDateFilter('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
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

          <TabsContent value="all">
            {renderAppointmentsList()}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SalonAppointments;
