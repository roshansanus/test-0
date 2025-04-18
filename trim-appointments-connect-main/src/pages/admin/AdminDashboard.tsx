
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, Building2, Scissors, Calendar, DollarSign, BarChart, Settings, UserPlus, Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSalons: 0,
    pendingSalons: 0,
    totalAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile || profile.role !== 'admin') return;

      try {
        // Fetch users count
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('count', { count: 'exact' })
          .eq('role', 'user');
        
        if (usersError) throw usersError;

        // Fetch all salons count
        const { data: salonsData, error: salonsError } = await supabase
          .from('salons')
          .select('count', { count: 'exact' });
          
        if (salonsError) throw salonsError;

        // Fetch pending salons (not verified)
        const { data: pendingSalonsData, error: pendingSalonsError } = await supabase
          .from('salons')
          .select('count', { count: 'exact' })
          .eq('is_verified', false);
          
        if (pendingSalonsError) throw pendingSalonsError;

        // Fetch appointments count
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('count', { count: 'exact' });
          
        if (appointmentsError) throw appointmentsError;

        setStats({
          totalUsers: usersData[0]?.count || 0,
          totalSalons: salonsData[0]?.count || 0,
          pendingSalons: pendingSalonsData[0]?.count || 0,
          totalAppointments: appointmentsData[0]?.count || 0
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard statistics',
          variant: 'destructive',
        });
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, salons, and settings for the BarberBook platform
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Salons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{stats.totalSalons}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Salons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Store className="h-5 w-5 text-yellow-500 mr-2" />
                <div className="text-2xl font-bold">{stats.pendingSalons}</div>
              </div>
            </CardContent>
          </Card>
          
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
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Users Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link to="/admin/users">
                  Manage Users
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/admin/users/new">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New User
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Salons Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link to="/admin/salons">
                  Manage Salons
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/admin/salons/pending">
                  Review Pending Salons
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Administration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link to="/admin/settings">
                  System Settings
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/admin/reports">
                  <BarChart className="mr-2 h-4 w-4" />
                  Reports & Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
