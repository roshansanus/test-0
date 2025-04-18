
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
import { Search, User, Mail, Phone, UserPlus, Edit, Trash2 } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Profile, UserRole } from '@/types';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToggle } from '@/hooks/useState';

const ITEMS_PER_PAGE = 10;

const AdminUsers = () => {
  const { profile: adminProfile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const [deleteDialogState, deleteDialogActions] = useToggle();
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);

  useEffect(() => {
    if (!adminProfile || adminProfile.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchUsers();
  }, [adminProfile, page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%`);
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setUsers(data || []);
      if (count !== null) {
        setTotalUsers(count);
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value as 'all' | UserRole);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const confirmDeleteUser = (user: Profile) => {
    setUserToDelete(user);
    deleteDialogActions.open();
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== userToDelete.id));
      setTotalUsers(prev => prev - 1);

      toast({
        title: 'User Deleted',
        description: `User ${userToDelete.first_name} ${userToDelete.last_name} has been deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
      console.error('Error deleting user:', error);
    } finally {
      deleteDialogActions.close();
      setUserToDelete(null);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500';
      case 'salon_owner':
        return 'bg-blue-500';
      case 'user':
      default:
        return 'bg-green-500';
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Users Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts on the BarberBook platform
            </p>
          </div>
          <Button asChild>
            <a href="/admin/users/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New User
            </a>
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <form onSubmit={handleSearch} className="sm:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email or phone..."
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
            <Label htmlFor="roleFilter" className="sr-only">Filter by Role</Label>
            <Select
              value={roleFilter}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="salon_owner">Salon Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
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
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No users found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">User</th>
                      <th className="text-left p-4">Contact</th>
                      <th className="text-left p-4">Role</th>
                      <th className="text-left p-4">Joined</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {user.first_name} {user.last_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            {user.email && (
                              <div className="flex items-center mb-1">
                                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">{user.email}</span>
                              </div>
                            )}
                            {user.phone_number && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">{user.phone_number}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getRoleBadgeColor(user.role as UserRole)}`}>
                            {user.role && user.role.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.created_at || '').toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" asChild className="mr-1">
                            <a href={`/admin/users/${user.id}`}>
                              <Edit className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => confirmDeleteUser(user)}
                            disabled={user.id === adminProfile?.id}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalUsers)} of {totalUsers} users
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

        <AlertDialog open={deleteDialogState.isOpen} onOpenChange={deleteDialogState.setIsOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account for{' '}
                <strong>{userToDelete?.first_name} {userToDelete?.last_name}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default AdminUsers;
