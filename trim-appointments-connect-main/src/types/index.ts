
import { Database } from "@/integrations/supabase/types";

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Salon = Database['public']['Tables']['salons']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  readable_id?: string; // Add the readable ID
};
export type Payment = Database['public']['Tables']['payments']['Row'];
export type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];

export type UserRole = Database['public']['Enums']['user_role'];
export type SubscriptionPlanType = Database['public']['Enums']['subscription_plan'];
export type AppointmentStatus = Database['public']['Enums']['appointment_status'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];

export interface AppointmentWithServices extends Appointment {
  services: Service[];
  salon: Salon;
  user?: Profile; // Include user data for salon owner view
}

// Extended salon type with owner information for admin view
export interface SalonWithOwner extends Salon {
  owner?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}
