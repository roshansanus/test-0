
import { supabase } from '@/integrations/supabase/client';
import { createOrder, initializePayment, loadRazorpayScript } from '@/lib/payments';
import { Payment } from '@/types';

// Process an online payment for an appointment
export const processOnlinePayment = async (
  appointmentId: string,
  amount: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string
): Promise<{ success: boolean; paymentId?: string; error?: string }> => {
  try {
    // Create order through your backend
    const orderId = await createOrder({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${appointmentId}`,
      notes: {
        appointmentId,
        customerName,
        customerEmail,
        customerPhone,
      },
    });

    // Initialize Razorpay payment
    const paymentResult = await initializePayment({
      key: 'rzp_test_1DP5mmOlF5G5ag', // Replace with your Razorpay test key in production use an env var
      amount: amount * 100, // in paise
      currency: 'INR',
      name: 'BarberBook',
      description: 'Payment for salon services',
      order_id: orderId,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      notes: {
        appointmentId,
      },
      theme: {
        color: '#7e22ce', // Purple color to match our theme
      },
    });

    // If payment successful, record in database
    if (paymentResult.success && paymentResult.payment_id) {
      await recordPayment(
        appointmentId,
        amount,
        'online',
        paymentResult.payment_id
      );
    }

    return paymentResult;
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return { success: false, error: error.message || 'Payment processing failed' };
  }
};

// Record an offline payment for an appointment
export const recordOfflinePayment = async (
  appointmentId: string,
  amount: number
): Promise<Payment> => {
  return await recordPayment(appointmentId, amount, 'offline');
};

// Internal function to record a payment
const recordPayment = async (
  appointmentId: string,
  amount: number,
  paymentMethod: 'online' | 'offline',
  transactionId?: string
): Promise<Payment> => {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      appointment_id: appointmentId,
      amount,
      payment_method: paymentMethod,
      status: paymentMethod === 'offline' ? 'completed' : 'pending',
      transaction_id: transactionId || null,
      payment_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording payment:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Failed to record payment');
  }

  // For offline payments, mark appointment as confirmed
  if (paymentMethod === 'offline') {
    await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', appointmentId);
  }

  return data;
};

// Verify payment status (for webhooks or manual verification)
export const verifyPaymentStatus = async (
  paymentId: string,
  status: 'completed' | 'failed' | 'refunded'
): Promise<void> => {
  const { error } = await supabase
    .from('payments')
    .update({ status })
    .eq('transaction_id', paymentId);

  if (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }

  // If payment is successful, update appointment status to confirmed
  if (status === 'completed') {
    // First get the appointment ID from the payment
    const { data, error: fetchError } = await supabase
      .from('payments')
      .select('appointment_id')
      .eq('transaction_id', paymentId)
      .single();

    if (fetchError || !data) {
      console.error('Error fetching appointment ID:', fetchError);
      return;
    }

    // Then update the appointment status
    await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', data.appointment_id);
  }
};
