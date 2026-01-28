export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  date_of_birth: string | null;
  gender: string | null;
  license_number: string | null;
  license_validity: string | null;
  role_id: number;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_type: string;
  created_at: string;
  booking_id: string | null;
  notes?: string | null;
  transaction_id?: string | null;
  name?: string | null; // Added this property
}

export interface AnalyticsData {
  id: string;
  name: string;
  value: number;
  date?: string;
  category?: string;
  location?: string;
}

export interface Scooter {
  id: string;
  model: string;
  status: string;
  battery_level: number;
  battery_capacity?: string;
  max_speed?: string;
  range?: string;
  charging_time?: string;
  features?: string[] | Record<string, unknown>;
  image_url?: string | null;
  hourly_rate?: number;
  created_at?: string;
  updated_at?: string;
  last_maintenance?: string;
  location?: unknown;
}
