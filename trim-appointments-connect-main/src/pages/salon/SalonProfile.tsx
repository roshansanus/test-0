
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MapPin, Phone, Mail, Info, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const SalonProfile = () => {
  const { user, profile } = useAuth();
  const [salon, setSalon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    phone_number: '',
    email: '',
    opening_time: '09:00',
    closing_time: '18:00',
    is_accepting_appointments: true
  });

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
        setFormData({
          name: data.name || '',
          description: data.description || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          postal_code: data.postal_code || '',
          country: data.country || 'India',
          phone_number: data.phone_number || '',
          email: data.email || '',
          opening_time: data.opening_time ? data.opening_time.slice(0, 5) : '09:00',
          closing_time: data.closing_time ? data.closing_time.slice(0, 5) : '18:00',
          is_accepting_appointments: data.is_accepting_appointments !== false
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load salon information',
          variant: 'destructive',
        });
        console.error('Error fetching salon:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalon();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_accepting_appointments: checked }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'address', 'city', 'state', 'postal_code'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('salons')
        .update({
          name: formData.name,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          phone_number: formData.phone_number,
          email: formData.email,
          opening_time: formData.opening_time,
          closing_time: formData.closing_time,
          is_accepting_appointments: formData.is_accepting_appointments,
          updated_at: new Date().toISOString()
        })
        .eq('id', salon.id);

      if (error) throw error;

      setSalon({
        ...salon,
        ...formData
      });

      toast({
        title: 'Profile Updated',
        description: 'Your salon profile has been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update salon profile',
        variant: 'destructive',
      });
      console.error('Error updating salon profile:', error);
    } finally {
      setSaving(false);
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
                <a href="/salon/setup">Create Salon</a>
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
          <h1 className="text-3xl font-bold mb-2">Salon Profile</h1>
          <p className="text-muted-foreground">
            Manage your salon's information and settings
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Basic Information</TabsTrigger>
            <TabsTrigger value="hours">Business Hours</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form onSubmit={handleSave}>
              <Card>
                <CardHeader>
                  <CardTitle>Salon Information</CardTitle>
                  <CardDescription>
                    This information will be displayed on your salon's public profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Salon Name*</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your salon and the services you offer"
                        className="resize-none"
                        rows={4}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="address">Address*</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="city">City*</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="state">State*</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="postal_code">Postal Code*</Label>
                        <Input
                          id="postal_code"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          placeholder="Your salon's contact number"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Your salon's email address"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="hours">
            <form onSubmit={handleSave}>
              <Card>
                <CardHeader>
                  <CardTitle>Business Hours</CardTitle>
                  <CardDescription>
                    Set your salon's operating hours and appointment settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="opening_time">Opening Time</Label>
                        <Input
                          id="opening_time"
                          name="opening_time"
                          type="time"
                          value={formData.opening_time}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="closing_time">Closing Time</Label>
                        <Input
                          id="closing_time"
                          name="closing_time"
                          type="time"
                          value={formData.closing_time}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="is_accepting_appointments">Accept Appointments</Label>
                        <p className="text-sm text-muted-foreground">
                          Toggle to temporarily disable appointment bookings
                        </p>
                      </div>
                      <Switch
                        id="is_accepting_appointments"
                        checked={formData.is_accepting_appointments}
                        onCheckedChange={handleSwitchChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SalonProfile;
