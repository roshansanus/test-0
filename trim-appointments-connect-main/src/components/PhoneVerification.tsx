
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check, Loader2, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { smsService } from '@/services/smsService';
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from '@/components/ui/input-otp';

interface PhoneVerificationProps {
  onVerified?: (phoneNumber: string) => void;
  initialPhoneNumber?: string;
  className?: string;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  onVerified,
  initialPhoneNumber = '',
  className = '',
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const { toast } = useToast();

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
      const result = await smsService.verifyOTP(phoneNumber, otp);
      
      if (result.success) {
        setVerified(true);
        toast({
          title: 'Phone Verified',
          description: result.message,
        });
        
        if (onVerified) {
          onVerified(phoneNumber);
        }
      } else {
        toast({
          title: 'Verification Failed',
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="mr-2 h-5 w-5" />
          Phone Verification
        </CardTitle>
        <CardDescription>
          Verify your phone number to enhance account security
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!otpSent && (
          <div className="space-y-4">
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
          </div>
        )}
        
        {otpSent && !verified && (
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
        
        {verified && (
          <div className="flex items-center justify-center p-4">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium">Phone Verified</h3>
              <p className="text-sm text-muted-foreground">
                Your phone number +91 {phoneNumber} has been successfully verified.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!otpSent && !verified && (
          <Button 
            onClick={handleSendOTP} 
            disabled={loading || phoneNumber.length !== 10}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP
              </>
            ) : (
              'Send OTP'
            )}
          </Button>
        )}
        
        {otpSent && !verified && (
          <div className="flex flex-col w-full space-y-2">
            <Button 
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying
                </>
              ) : (
                'Verify'
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
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PhoneVerification;
