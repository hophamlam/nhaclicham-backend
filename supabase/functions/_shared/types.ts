// Shared types for Edge Functions
export interface Reminder {
  id: string;
  user_id: string;
  note: string;
  lunar_day: number;
  lunar_month: number;
  repeat_every_year: boolean;
  created_at: string;
}

export interface CreateReminderRequest {
  user_id: string;
  note: string;
  lunar_day: number;
  lunar_month: number;
  repeat_every_year: boolean;
}

export interface UpdateReminderRequest {
  note?: string;
  lunar_day?: number;
  lunar_month?: number;
  repeat_every_year?: boolean;
}

export interface LunarDate {
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface ErrorResponse {
  error: string;
  status?: number;
}
