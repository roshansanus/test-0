
// This is a placeholder for the actual SMS OTP implementation
// In a real implementation, you would integrate with SMS providers like Twilio

import { supabase } from '@/integrations/supabase/client';

// Mock function to simulate sending OTP
export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean, message: string }> => {
  try {
    // Format phone with country code if not already included
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    // Use Supabase auth to send OTP
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone
    });
    
    if (error) {
      console.error('Error sending OTP:', error);
      return { 
        success: false, 
        message: error.message || "Failed to send OTP" 
      };
    }
    
    return { 
      success: true, 
      message: "OTP sent successfully. Please check your phone." 
    };
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return { 
      success: false, 
      message: error.message || "Failed to send OTP" 
    };
  }
};

// Verify OTP and update profile if successful
export const verifyOTP = async (phoneNumber: string, code: string): Promise<{ success: boolean, message: string }> => {
  try {
    // Format phone with country code
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    // Verify with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: code,
      type: 'sms'
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Get the current user
      const userId = data.user.id;
      
      // If successful, update the user's profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          is_phone_verified: true,
          phone_number: phoneNumber
        })
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      return { 
        success: true, 
        message: "Phone number verified successfully" 
      };
    }
    
    return { 
      success: false, 
      message: "Verification failed" 
    };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return { 
      success: false, 
      message: error.message || "Failed to verify OTP" 
    };
  }
};
