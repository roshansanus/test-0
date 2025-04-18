
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Service } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Scissors, Plus, Edit, Trash2, Search, Clock, IndianRupee } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToggle } from '@/hooks/useState';

const SalonServices = () => {
  const { user } = useAuth();
  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
    is_active: true,
  });
  const [deleteDialogState, deleteDialogActions] = useToggle();
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

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
    const fetchServices = async () => {
      if (!salon) return;

      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('salon_id', salon.id)
          .order('name');

        if (error) throw error;
        setServices(data);
        setFilteredServices(data);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load services',
          variant: 'destructive',
        });
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [salon]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = services.filter(service => 
        service.name.toLowerCase().includes(query) ||
        (service.description && service.description.toLowerCase().includes(query))
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [services, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormValues({
      ...formValues,
      is_active: checked,
    });
  };

  const resetForm = () => {
    setFormValues({
      name: '',
      description: '',
      price: '',
      duration_minutes: '',
      is_active: true,
    });
    setEditingService(null);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormValues({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
      is_active: service.is_active || false,
    });
    setIsAddDialogOpen(true);
  };

  const confirmDeleteService = (service: Service) => {
    setServiceToDelete(service);
    deleteDialogActions.open();
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceToDelete.id);

      if (error) throw error;

      setServices(services.filter(s => s.id !== serviceToDelete.id));
      toast({
        title: 'Service Deleted',
        description: `${serviceToDelete.name} has been deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive',
      });
      console.error('Error deleting service:', error);
    } finally {
      deleteDialogActions.close();
      setServiceToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formValues.name) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a service name',
        variant: 'destructive',
      });
      return;
    }

    if (!formValues.price || isNaN(Number(formValues.price)) || Number(formValues.price) <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    if (!formValues.duration_minutes || isNaN(Number(formValues.duration_minutes)) || Number(formValues.duration_minutes) <= 0) {
      toast({
        title: 'Invalid Duration',
        description: 'Please enter a valid duration in minutes',
        variant: 'destructive',
      });
      return;
    }

    const serviceData = {
      name: formValues.name,
      description: formValues.description || null,
      price: Number(formValues.price),
      duration_minutes: Number(formValues.duration_minutes),
      is_active: formValues.is_active,
      salon_id: salon.id,
    };

    try {
      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;

        setServices(services.map(s => 
          s.id === editingService.id ? { ...s, ...serviceData } : s
        ));

        toast({
          title: 'Service Updated',
          description: `${serviceData.name} has been updated successfully`,
        });
      } else {
        // Add new service
        const { data, error } = await supabase
          .from('services')
          .insert(serviceData)
          .select()
          .single();

        if (error) throw error;

        setServices([...services, data]);

        toast({
          title: 'Service Added',
          description: `${serviceData.name} has been added successfully`,
        });
      }

      // Reset form and close dialog
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: editingService ? 'Failed to update service' : 'Failed to add service',
        variant: 'destructive',
      });
      console.error('Error saving service:', error);
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

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Services</h1>
            <p className="text-muted-foreground">Manage the services offered at your salon</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No services found matching your search' : 'No services found. Add your first service!'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map(service => (
              <Card key={service.id} className={service.is_active ? '' : 'opacity-70'}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <Scissors className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="text-lg font-semibold">{service.name}</h3>
                    </div>
                    {!service.is_active && (
                      <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-500">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  
                  {service.description && (
                    <p className="text-muted-foreground mb-4 text-sm">{service.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="font-medium">₹{service.price}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{service.duration_minutes} mins</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => confirmDeleteService(service)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Service Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsAddDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                {editingService
                  ? 'Update the details of your service.'
                  : 'Enter the details of the service you offer at your salon.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Haircut, Beard Trim, etc."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formValues.description}
                    onChange={handleInputChange}
                    placeholder="Enter a brief description of the service"
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formValues.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 250"
                      min="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      name="duration_minutes"
                      type="number"
                      value={formValues.duration_minutes}
                      onChange={handleInputChange}
                      placeholder="e.g., 30"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active Status</Label>
                  <Switch
                    id="is_active"
                    name="is_active"
                    checked={formValues.is_active}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">
                  {editingService ? 'Save Changes' : 'Add Service'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogState.isOpen} onOpenChange={deleteDialogState.setIsOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the service{' '}
                <strong>{serviceToDelete?.name}</strong> from your salon.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteService} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default SalonServices;
