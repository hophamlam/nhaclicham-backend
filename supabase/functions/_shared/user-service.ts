import { supabase, USERS_TABLE } from "./supabase.ts";
import { User } from "./types.ts";

export class UserService {
  /**
   * Tạo hoặc cập nhật user profile
   */
  static async upsertUser(userId: string, displayName?: string): Promise<User> {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .upsert(
        {
          id: userId,
          display_name: displayName || null,
        },
        {
          onConflict: "id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Lấy thông tin user theo ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Cập nhật user profile
   */
  static async updateUser(
    userId: string,
    updates: Partial<Omit<User, "id" | "created_at">>
  ): Promise<User> {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Xóa user (soft delete bằng cách set display_name = null)
   */
  static async deactivateUser(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .update({ display_name: null })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
