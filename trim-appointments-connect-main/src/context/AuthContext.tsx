
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Profile, UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, firstName?: string, lastName?: string, phoneNumber?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signInWithPhone: (phone: string, otp: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Fetch user profile after sign in
          fetchUserProfile(currentSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession ? 'Session found' : 'No session');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      console.log('Profile data:', data);
      setProfile(data);
      
      // If coming from login page, redirect based on role
      if (data && window.location.pathname === '/login') {
        redirectBasedOnRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const redirectBasedOnRole = (role?: UserRole) => {
    if (!role) return;
    
    console.log('Redirecting based on role:', role);
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'salon_owner':
        navigate('/salon/dashboard');
        break;
      case 'user':
        navigate('/user/dashboard');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      
      // Route will be set by fetchUserProfile when it completes
    } catch (error: any) {
      console.error('Sign in error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithPhone = async (phone: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Format phone with country code if not already included
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      console.log('Verifying OTP for phone:', formattedPhone);
      
      // Verify the phone with Supabase auth
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });
      
      if (error) {
        toast({
          title: 'Phone verification failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      if (data.user) {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
        
        // Profile and redirect will be handled by the onAuthStateChange listener
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Phone sign in error:', error.message);
      toast({
        title: 'Sign in failed',
        description: error.message || 'An error occurred during phone sign-in',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    role: UserRole,
    firstName?: string, 
    lastName?: string, 
    phoneNumber?: string
  ) => {
    try {
      setIsLoading(true);
      console.log('Starting sign up process for email:', email);
      
      // First, create the auth user
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            role
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      console.log('Auth user created successfully:', data);

      // If signup was successful and we have a user, create the profile data
      if (data.user) {
        try {
          console.log('Creating profile for user:', data.user.id);
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email,
              role,
              first_name: firstName || null,
              last_name: lastName || null,
              phone_number: phoneNumber || null
            });

          if (profileError) {
            console.error('Error creating user profile:', profileError);
            toast({
              title: 'Profile setup failed',
              description: 'Account created but profile setup failed. Please complete your profile later.',
              variant: 'destructive',
            });
          } else {
            console.log('Profile created successfully');
          }
        } catch (profileCreateError) {
          console.error('Exception creating profile:', profileCreateError);
        }
      }

      toast({
        title: 'Account created',
        description: 'Please verify your email address to continue.',
      });
      
      // Redirect to login page after successful signup
      navigate('/login');
    } catch (error: any) {
      console.error('Sign up error:', error.message);
      toast({
        title: 'Sign up failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: 'Signed out',
        description: 'You have successfully signed out.',
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast({
          title: 'Update failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      // Update local profile state
      setProfile(profile => profile ? { ...profile, ...updates } : null);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error: any) {
      console.error('Profile update error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signInWithPhone,
    signUp,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
