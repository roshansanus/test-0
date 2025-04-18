
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Loader2, Mail, Phone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from '@/components/ui/input-otp';
import { smsService } from '@/services/smsService';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithPhone, isLoading } = useAuth();
  const { toast } = useToast();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  const formatPhoneNumber = (input: string) => {
    // Remove non-digit characters
    const digits = input.replace(/\D/g, '');
    // Enforce 10-digit limit for Indian phone numbers (excluding country code)
    return digits.slice(0, 10);
  };

  const handleSendOTP = async () => {
    if (phoneNumber.length < 10) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await smsService.sendOTP(phoneNumber);
      
      if (result.success) {
        setOtpSent(true);
        toast({
          title: 'OTP Sent',
          description: result.message,
        });
      } else {
        toast({
          title: 'Failed to Send OTP',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit OTP code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Use the signInWithPhone function from AuthContext
      const success = await signInWithPhone(phoneNumber, otp);
      
      if (!success) {
        toast({
          title: 'Verification Failed',
          description: 'Invalid OTP code or expired token',
          variant: 'destructive',
        });
      }
      // No need to show success toast here as it's handled in the AuthContext
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="phone" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="phone">
                <Phone className="mr-2 h-4 w-4" />
                Phone
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="phone">
              <CardContent className="space-y-4">
                {!otpSent ? (
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="flex">
                      <span className="flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
                        +91
                      </span>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                        className="rounded-l-none"
                        placeholder="Enter your 10-digit phone number"
                        disabled={loading}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-muted-foreground mb-3">
                          We sent a code to +91 {phoneNumber}
                        </p>
                        <InputOTP 
                          maxLength={6} 
                          value={otp} 
                          onChange={setOtp}
                          disabled={loading}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col space-y-2">
                {!otpSent ? (
                  <Button 
                    onClick={handleSendOTP}
                    className="w-full"
                    disabled={loading || phoneNumber.length !== 10}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleVerifyOTP}
                      className="w-full"
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying
                        </>
                      ) : (
                        'Sign In with OTP'
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full"
                    >
                      Resend OTP
                    </Button>
                  </>
                )}
              </CardFooter>
            </TabsContent>
            
            <TabsContent value="email">
              <form onSubmit={handleEmailSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                      </>
                    ) : (
                      'Sign In with Email'
                    )}
                  </Button>
                  <div className="text-center text-sm">
                    Don't have an account?{' '}
                    <Link to="/register/user" className="text-primary hover:underline">
                      Sign up as User
                    </Link>{' '}
                    or{' '}
                    <Link to="/register/salon" className="text-primary hover:underline">
                      Sign up as Salon Owner
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
