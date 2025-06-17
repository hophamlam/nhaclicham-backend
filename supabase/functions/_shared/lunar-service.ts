// Lunar calendar service for Edge Functions
import { LunarDate } from "./types.ts";

export class LunarService {
  /**
   * Chuyển đổi từ dương lịch sang âm lịch
   * Sử dụng algorithm đơn giản cho demo
   */
  static convertSolarToLunar(date: Date): LunarDate {
    try {
      // Simplified lunar conversion for demo
      // This is a basic approximation - in production, use proper lunar calendar library
      const solarDay = date.getDate();
      const solarMonth = date.getMonth() + 1;
      const solarYear = date.getFullYear();

      // Basic lunar approximation (for demo purposes)
      // Real lunar calendar calculation is much more complex
      let lunarDay = solarDay;
      let lunarMonth = solarMonth;
      let lunarYear = solarYear;

      // Simple offset approximation
      if (solarDay >= 15) {
        lunarDay = solarDay - 15;
        lunarMonth = solarMonth + 1;
        if (lunarMonth > 12) {
          lunarMonth = 1;
          lunarYear++;
        }
      } else {
        lunarDay = solarDay + 15;
        lunarMonth = solarMonth - 1;
        if (lunarMonth < 1) {
          lunarMonth = 12;
          lunarYear--;
        }
      }

      // Ensure valid lunar day range
      if (lunarDay > 30) lunarDay = 30;
      if (lunarDay < 1) lunarDay = 1;

      return {
        lunarDay,
        lunarMonth,
        lunarYear,
      };
    } catch (error) {
      console.error("Error converting solar to lunar date:", error);
      // Fallback to current date if conversion fails
      const today = new Date();
      return {
        lunarDay: today.getDate(),
        lunarMonth: today.getMonth() + 1,
        lunarYear: today.getFullYear(),
      };
    }
  }

  /**
   * Lấy ngày âm lịch hôm nay
   */
  static getTodayLunarDate(): LunarDate {
    const today = new Date();
    return this.convertSolarToLunar(today);
  }

  /**
   * Kiểm tra xem ngày âm lịch có hợp lệ không
   */
  static isValidLunarDate(lunarDay: number, lunarMonth: number): boolean {
    return (
      lunarDay >= 1 && lunarDay <= 30 && lunarMonth >= 1 && lunarMonth <= 12
    );
  }
}
