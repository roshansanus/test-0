
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Check, UserCircle } from 'lucide-react';
import PhoneVerification from '@/components/PhoneVerification';

const UserProfile = () => {
  const { profile, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
      });
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhoneVerified = (phoneNumber: string) => {
    toast({
      title: 'Phone Verified',
      description: 'Your phone number has been successfully verified.',
    });
  };

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>
          
          <Tabs defaultValue="info">
            <TabsList className="mb-6">
              <TabsTrigger value="info">Basic Information</TabsTrigger>
              <TabsTrigger value="verify">Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCircle className="mr-2 h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile?.email || ''}
                        readOnly
                        disabled
                        className="bg-muted"
                      />
                      <div className="flex items-center mt-1">
                        <Check className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-xs text-green-600">Email verified</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={profile?.phone_number || 'Not set'}
                        readOnly
                        disabled
                        className="bg-muted"
                      />
                      {profile?.is_phone_verified ? (
                        <div className="flex items-center mt-1">
                          <Check className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600">Phone verified</span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          Go to the Verification tab to verify your phone number
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-salon-primary hover:bg-salon-secondary"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="verify">
              <PhoneVerification 
                initialPhoneNumber={profile?.phone_number || ''}
                onVerified={handlePhoneVerified}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
