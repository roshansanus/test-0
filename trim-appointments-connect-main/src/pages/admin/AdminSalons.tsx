import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Search, Building2, MapPin, Phone, Mail, Check, X, Clock } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { SalonWithOwner } from '@/types';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToggle } from '@/hooks/useState';

const ITEMS_PER_PAGE = 10;

const AdminSalons = () => {
  const { profile: adminProfile } = useAuth();
  const navigate = useNavigate();
  const [salons, setSalons] = useState<SalonWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalSalons, setTotalSalons] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const [verifyDialogState, verifyDialogActions] = useToggle();
  const [unverifyDialogState, unverifyDialogActions] = useToggle();
  const [selectedSalon, setSelectedSalon] = useState<SalonWithOwner | null>(null);

  useEffect(() => {
    if (!adminProfile || adminProfile.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchSalons();
  }, [adminProfile, page, verificationFilter]);

  const fetchSalons = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('salons')
        .select('*, owner:owner_id(first_name, last_name, email)', { count: 'exact' });

      if (verificationFilter !== 'all') {
        const isVerified = verificationFilter === 'verified';
        query = query.eq('is_verified', isVerified);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setSalons(data || []);
      if (count !== null) {
        setTotalSalons(count);
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load salons',
        variant: 'destructive',
      });
      console.error('Error fetching salons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSalons();
  };

  const handleFilterChange = (value: string) => {
    setVerificationFilter(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleVerify = async () => {
    if (!selectedSalon) return;

    try {
      const { error } = await supabase
        .from('salons')
        .update({ is_verified: true })
        .eq('id', selectedSalon.id);

      if (error) throw error;

      setSalons(salons.map(salon => 
        salon.id === selectedSalon.id ? { ...salon, is_verified: true } : salon
      ));

      toast({
        title: 'Salon Verified',
        description: `${selectedSalon.name} has been verified successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to verify salon',
        variant: 'destructive',
      });
      console.error('Error verifying salon:', error);
    } finally {
      verifyDialogActions.close();
      setSelectedSalon(null);
    }
  };

  const handleUnverify = async () => {
    if (!selectedSalon) return;

    try {
      const { error } = await supabase
        .from('salons')
        .update({ is_verified: false })
        .eq('id', selectedSalon.id);

      if (error) throw error;

      setSalons(salons.map(salon => 
        salon.id === selectedSalon.id ? { ...salon, is_verified: false } : salon
      ));

      toast({
        title: 'Salon Unverified',
        description: `${selectedSalon.name} has been unverified successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to unverify salon',
        variant: 'destructive',
      });
      console.error('Error unverifying salon:', error);
    } finally {
      unverifyDialogActions.close();
      setSelectedSalon(null);
    }
  };

  const confirmVerify = (salon: SalonWithOwner) => {
    setSelectedSalon(salon);
    verifyDialogActions.open();
  };

  const confirmUnverify = (salon: SalonWithOwner) => {
    setSelectedSalon(salon);
    unverifyDialogActions.open();
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Salons Management</h1>
          <p className="text-muted-foreground">
            Manage all registered salons on the BarberBook platform
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <form onSubmit={handleSearch} className="sm:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search salons by name, address or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-16"
              />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-2 top-1.5"
              >
                Search
              </Button>
            </div>
          </form>

          <div>
            <Label htmlFor="verificationFilter" className="sr-only">Filter by Verification</Label>
            <Select
              value={verificationFilter}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salons</SelectItem>
                <SelectItem value="verified">Verified Salons</SelectItem>
                <SelectItem value="unverified">Pending Verification</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : salons.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No salons found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {salons.map((salon) => (
                  <Card key={salon.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <Building2 className="h-5 w-5 mr-3 mt-1 text-primary" />
                              <div>
                                <h3 className="text-lg font-semibold">{salon.name}</h3>
                                <div className="flex items-center mt-1">
                                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    {salon.address}, {salon.city}, {salon.state}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Badge className={`ml-2 ${salon.is_verified ? 'bg-green-500' : 'bg-yellow-500'}`}>
                              {salon.is_verified ? 'Verified' : 'Unverified'}
                            </Badge>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            {salon.phone_number && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">{salon.phone_number}</span>
                              </div>
                            )}
                            {salon.email && (
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">{salon.email}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">{salon.opening_time?.slice(0, 5)} - {salon.closing_time?.slice(0, 5)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Owner Information</h4>
                            <p className="text-sm">
                              {salon.owner ? `${salon.owner.first_name} ${salon.owner.last_name}` : 'No owner data'}
                            </p>
                            {salon.owner?.email && (
                              <p className="text-sm text-muted-foreground mt-1">{salon.owner.email}</p>
                            )}
                          </div>
                          
                          <div className="mt-4 flex flex-col gap-2">
                            <Button asChild size="sm">
                              <a href={`/admin/salons/${salon.id}`}>View Details</a>
                            </Button>
                            {salon.is_verified ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => confirmUnverify(salon)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove Verification
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => confirmVerify(salon)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Verify Salon
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalSalons)} of {totalSalons} salons
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(page - 1)} 
                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <Button 
                      variant={page === i + 1 ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(page + 1)} 
                    className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <AlertDialog open={verifyDialogState.isOpen} onOpenChange={verifyDialogState.setIsOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Verify Salon</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to verify <strong>{selectedSalon?.name}</strong>? 
                This will make the salon visible to all users and allow them to book appointments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleVerify}>
                Verify Salon
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={unverifyDialogState.isOpen} onOpenChange={unverifyDialogState.setIsOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Verification</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove verification from <strong>{selectedSalon?.name}</strong>? 
                This will hide the salon from search results and prevent new bookings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnverify} className="bg-destructive text-destructive-foreground">
                Remove Verification
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default AdminSalons;
