// Reminder service for Edge Functions
import { supabase, REMINDERS_TABLE } from "./supabase.ts";
import {
  Reminder,
  CreateReminderRequest,
  UpdateReminderRequest,
} from "./types.ts";
import { LunarService } from "./lunar-service.ts";

export class ReminderService {
  /**
   * Tạo mới một reminder
   */
  static async createReminder(data: CreateReminderRequest): Promise<Reminder> {
    // Validate lunar date
    if (!LunarService.isValidLunarDate(data.lunar_day, data.lunar_month)) {
      throw new Error("Invalid lunar date");
    }

    const { data: reminder, error } = await supabase
      .from(REMINDERS_TABLE)
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create reminder: ${error.message}`);
    }

    return reminder;
  }

  /**
   * Lấy tất cả reminders của một user
   */
  static async getRemindersByUserId(userId: string): Promise<Reminder[]> {
    const { data: reminders, error } = await supabase
      .from(REMINDERS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch reminders: ${error.message}`);
    }

    return reminders || [];
  }

  /**
   * Lấy reminder theo ID
   */
  static async getReminderById(id: string): Promise<Reminder | null> {
    const { data: reminder, error } = await supabase
      .from(REMINDERS_TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch reminder: ${error.message}`);
    }

    return reminder;
  }

  /**
   * Cập nhật reminder
   */
  static async updateReminder(
    id: string,
    data: UpdateReminderRequest
  ): Promise<Reminder> {
    // Validate lunar date if provided
    if (data.lunar_day !== undefined && data.lunar_month !== undefined) {
      if (!LunarService.isValidLunarDate(data.lunar_day, data.lunar_month)) {
        throw new Error("Invalid lunar date");
      }
    }

    const { data: reminder, error } = await supabase
      .from(REMINDERS_TABLE)
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update reminder: ${error.message}`);
    }

    return reminder;
  }

  /**
   * Xóa reminder
   */
  static async deleteReminder(id: string): Promise<void> {
    const { error } = await supabase
      .from(REMINDERS_TABLE)
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete reminder: ${error.message}`);
    }
  }

  /**
   * Lấy các reminders trùng với ngày âm lịch hôm nay
   */
  static async getTodayReminders(userId?: string): Promise<Reminder[]> {
    const todayLunar = LunarService.getTodayLunarDate();

    let query = supabase
      .from(REMINDERS_TABLE)
      .select("*")
      .eq("lunar_day", todayLunar.lunarDay)
      .eq("lunar_month", todayLunar.lunarMonth);

    // Filter by user if provided
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: reminders, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw new Error(`Failed to fetch today's reminders: ${error.message}`);
    }

    return reminders || [];
  }

  /**
   * Kiểm tra và lấy tất cả reminders hôm nay (cho tất cả users)
   */
  static async checkTodayReminders(): Promise<Reminder[]> {
    return this.getTodayReminders();
  }
}
