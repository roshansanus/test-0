
import { supabase } from '@/integrations/supabase/client';
import { Appointment, AppointmentWithServices, Service } from '@/types';
import { smsService } from './smsService';
import { format } from 'date-fns';

// Function to generate a human-readable appointment ID
const generateReadableAppointmentId = (salonId: string, appointmentNumber: number): string => {
  // Create a prefix from the first 3 chars of the salon ID (UUID)
  const prefix = salonId.substring(0, 3).toUpperCase();
  // Use current date as part of the ID (YYMMDD format)
  const dateStr = format(new Date(), 'yyMMdd');
  // Combine with the appointment number, padded to ensure at least 3 digits
  const paddedNumber = appointmentNumber.toString().padStart(3, '0');
  
  return `${prefix}-${dateStr}-${paddedNumber}`;
};

// Create a new appointment
export const createAppointment = async (
  salonId: string,
  appointmentDate: string,
  appointmentTime: string,
  serviceIds: string[],
  notes?: string
): Promise<Appointment> => {
  // Get the current user ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  // Start a transaction
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      salon_id: salonId,
      user_id: user.id,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      appointment_number: 1, // Placeholder value, will be overwritten by DB trigger
      notes: notes || null,
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
  
  if (!data) throw new Error('Failed to create appointment');
  
  // Add services to the appointment
  const appointmentServices = serviceIds.map(serviceId => ({
    appointment_id: data.id,
    service_id: serviceId,
  }));
  
  const { error: serviceError } = await supabase
    .from('appointment_services')
    .insert(appointmentServices);
    
  if (serviceError) {
    console.error('Error adding services to appointment:', serviceError);
    throw serviceError;
  }

  // Generate a human-readable appointment ID
  const readableId = generateReadableAppointmentId(salonId, data.appointment_number);
  
  // Get salon name and user phone for SMS confirmation
  const [salonResult, profileResult] = await Promise.all([
    supabase.from('salons').select('name').eq('id', salonId).single(),
    supabase.from('profiles').select('phone_number').eq('id', user.id).single()
  ]);
  
  if (salonResult.data && profileResult.data?.phone_number) {
    const salonName = salonResult.data.name;
    const phoneNumber = profileResult.data.phone_number;
    const appointmentDateTime = `${format(new Date(appointmentDate), 'dd MMM yyyy')} at ${appointmentTime}`;
    
    // Send SMS confirmation
    await smsService.sendAppointmentConfirmation(
      phoneNumber,
      readableId,
      salonName,
      appointmentDateTime
    );
  }
  
  return {
    ...data,
    readable_id: readableId // Add the readable ID to the returned appointment
  } as Appointment;
};

// Get appointments for the current user
export const getUserAppointments = async (): Promise<AppointmentWithServices[]> => {
  // Get the current user ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  // Get all appointments for the user
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      salon:salons(*)
    `)
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });
    
  if (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
  
  if (!data) return [];
  
  // Get services for each appointment and generate readable IDs
  const appointmentsWithServices = await Promise.all(data.map(async (appointment) => {
    const { data: serviceData, error: serviceError } = await supabase
      .from('appointment_services')
      .select(`
        services(*)
      `)
      .eq('appointment_id', appointment.id);
      
    if (serviceError) {
      console.error('Error fetching services for appointment:', serviceError);
      throw serviceError;
    }
    
    const services = serviceData?.map(item => item.services as Service) || [];
    const readableId = generateReadableAppointmentId(appointment.salon_id, appointment.appointment_number);
    
    return {
      ...appointment,
      services,
      readable_id: readableId
    } as AppointmentWithServices;
  }));
  
  return appointmentsWithServices;
};

// Get appointments for a salon
export const getSalonAppointments = async (salonId: string): Promise<AppointmentWithServices[]> => {
  // Get all appointments for the salon
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      salon:salons(*),
      user:profiles(*)
    `)
    .eq('salon_id', salonId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });
    
  if (error) {
    console.error('Error fetching salon appointments:', error);
    throw error;
  }
  
  if (!data) return [];
  
  // Get services for each appointment and generate readable IDs
  const appointmentsWithServices = await Promise.all(data.map(async (appointment) => {
    const { data: serviceData, error: serviceError } = await supabase
      .from('appointment_services')
      .select(`
        services(*)
      `)
      .eq('appointment_id', appointment.id);
      
    if (serviceError) {
      console.error('Error fetching services for appointment:', serviceError);
      throw serviceError;
    }
    
    const services = serviceData?.map(item => item.services as Service) || [];
    const readableId = generateReadableAppointmentId(appointment.salon_id, appointment.appointment_number);
    
    return {
      ...appointment,
      services,
      readable_id: readableId
    } as AppointmentWithServices;
  }));
  
  return appointmentsWithServices;
};

// Update appointment status
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
): Promise<void> => {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId);
    
  if (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};
