// Lunar calendar service for Edge Functions
import { LunarDate } from "./types.ts";
// Import lunar calendar library from import map
const lunarCalendarModule = await import("lunar-calendar");
const lunarCalendar = lunarCalendarModule.default || lunarCalendarModule;

export class LunarService {
  /**
   * Converts a solar date to a lunar date, including leap month information.
   * @param date The solar date to convert.
   * @returns The corresponding lunar date.
   */
  static convertSolarToLunar(date: Date): LunarDate {
    try {
      const [lunarDay, lunarMonth, lunarYear, isLeap] =
        lunarCalendar.convertSolar2Lunar(
          date.getDate(),
          date.getMonth() + 1, // getMonth() is 0-indexed
          date.getFullYear(),
          7 // Timezone offset for Vietnam
        );

      return { lunarDay, lunarMonth, lunarYear, isLeap: !!isLeap };
    } catch (error) {
      console.error("Error converting solar to lunar date:", error);
      // Provide a fallback to ensure the function always returns a valid object
      return {
        lunarDay: date.getDate(),
        lunarMonth: date.getMonth() + 1,
        lunarYear: date.getFullYear(),
        isLeap: false,
      };
    }
  }

  /**
   * Gets today's lunar date.
   * @returns Today's lunar date.
   */
  static getTodayLunarDate(): LunarDate {
    const today = new Date();
    return this.convertSolarToLunar(today);
  }

  /**
   * Checks if a given lunar date is valid.
   * @param lunarDay The lunar day (1-30).
   * @param lunarMonth The lunar month (1-12).
   * @returns True if the lunar date is valid.
   */
  static isValidLunarDate(lunarDay: number, lunarMonth: number): boolean {
    return (
      lunarDay >= 1 && lunarDay <= 30 && lunarMonth >= 1 && lunarMonth <= 12
    );
  }
}
