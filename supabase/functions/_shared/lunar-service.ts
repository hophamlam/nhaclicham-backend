// Lunar conversion service - now simplified since logic moved to Edge Function
import { S2L, L2S } from "https://esm.sh/lunar-calendar-ts-vi@latest";

export class LunarService {
  // This service is deprecated - use Edge Function /api/lunar-convert and /api/solar-convert instead
  // Keeping this for backward compatibility if needed

  static convertSolarToLunar(solarDate: Date) {
    const result = S2L(
      solarDate.getFullYear(),
      solarDate.getMonth() + 1,
      solarDate.getDate()
    );

    return {
      lunar_day: result[0],
      lunar_month: result[1],
      lunar_year: result[2],
      is_leap_month: result[3] === 1,
    };
  }

  static convertLunarToSolar(
    lunarDay: number,
    lunarMonth: number,
    lunarYear: number,
    isLeapMonth = false
  ) {
    const result = L2S(lunarDay, lunarMonth, lunarYear, isLeapMonth ? 1 : 0);

    return new Date(result[2], result[1] - 1, result[0]);
  }
}
