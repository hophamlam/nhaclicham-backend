import {
  supabase,
  NOTIFICATION_SETTINGS_TABLE,
  NOTIFICATION_LOGS_TABLE,
} from "./supabase.ts";
import { NotificationSetting, NotificationLog } from "./types.ts";

export class NotificationService {
  /**
   * Tạo notification setting mới
   */
  static async createNotificationSetting(
    setting: Omit<NotificationSetting, "id" | "created_at" | "user_id">,
    userId: string
  ): Promise<NotificationSetting> {
    const { data, error } = await supabase
      .from(NOTIFICATION_SETTINGS_TABLE)
      .insert({ ...setting, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Lấy notification settings của user
   */
  static async getNotificationSettingsByUserId(
    userId: string
  ): Promise<NotificationSetting[]> {
    const { data, error } = await supabase
      .from(NOTIFICATION_SETTINGS_TABLE)
      .select("*")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Lấy notification settings theo event
   */
  static async getNotificationSettingsByEventId(
    eventId: string,
    userId: string
  ): Promise<NotificationSetting[]> {
    const { data, error } = await supabase
      .from(NOTIFICATION_SETTINGS_TABLE)
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Cập nhật notification setting
   */
  static async updateNotificationSetting(
    settingId: string,
    updates: Partial<
      Omit<NotificationSetting, "id" | "user_id" | "created_at">
    >,
    userId: string
  ): Promise<NotificationSetting> {
    const { data, error } = await supabase
      .from(NOTIFICATION_SETTINGS_TABLE)
      .update(updates)
      .eq("id", settingId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Xóa notification setting
   */
  static async deleteNotificationSetting(
    settingId: string,
    userId: string
  ): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from(NOTIFICATION_SETTINGS_TABLE)
      .delete()
      .eq("id", settingId)
      .eq("user_id", userId)
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    if (!data)
      throw new Error(
        "Notification setting not found or user does not have permission."
      );
    return data;
  }

  /**
   * Ghi log notification
   */
  static async logNotification(
    log: Omit<NotificationLog, "id" | "sent_at">
  ): Promise<NotificationLog> {
    const { data, error } = await supabase
      .from(NOTIFICATION_LOGS_TABLE)
      .insert(log)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Lấy notification logs của user
   */
  static async getNotificationLogsByUserId(
    userId: string
  ): Promise<NotificationLog[]> {
    const { data, error } = await supabase
      .from(NOTIFICATION_LOGS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("sent_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Lấy notification logs theo event
   */
  static async getNotificationLogsByEventId(
    eventId: string,
    userId: string
  ): Promise<NotificationLog[]> {
    const { data, error } = await supabase
      .from(NOTIFICATION_LOGS_TABLE)
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .order("sent_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }
}
