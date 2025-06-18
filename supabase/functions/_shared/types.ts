// ===================================
// Database Object Types
// ===================================

export interface User {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  note: string;
  is_lunar: boolean;
  lunar_day: number | null;
  lunar_month: number | null;
  lunar_year: number | null;
  is_leap_month: boolean | null;
  solar_date: string | null;
  created_at: string;
}

export interface NotificationSetting {
  id: string;
  user_id: string;
  event_id: string | null;
  channel: string;
  advance_days: number;
  time_of_day: string | null;
  is_enabled: boolean | null;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  event_id: string | null;
  sent_at: string;
  channel: string | null;
  message: string | null;
  status: string | null;
  response: string | null;
}

// ===================================
// API Request & Response Types
// ===================================

export type CreateEventRequest = Omit<
  Event,
  "id" | "created_at" | "user_id"
> & { user_id?: string };
export type UpdateEventRequest = Partial<
  Omit<Event, "id" | "created_at" | "user_id">
>;

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface ErrorResponse {
  error: string;
  status?: number;
}

// ===================================
// Service-specific Types
// ===================================

export interface LunarDate {
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  isLeap: boolean;
}
