// Lunar Calendar Edge Function
import {
  handleCORS,
  createSuccessResponse,
  createErrorResponse,
  parseJsonBody,
} from "../_shared/utils.ts";
import { LunarService } from "../_shared/lunar-service.ts";

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  try {
    const method = req.method;
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);

    // Route handling
    if (method === "GET" && pathSegments.length === 1) {
      // GET /lunar - Get today's lunar date
      return await getTodayLunarDate();
    } else if (method === "POST" && pathSegments.length === 1) {
      // POST /lunar - Convert solar to lunar date
      return await convertSolarToLunar(req);
    } else {
      return createErrorResponse("Invalid endpoint", 404);
    }
  } catch (error) {
    console.error("Error in lunar function:", error);
    return createErrorResponse(error.message || "Internal server error");
  }
});

/**
 * Get today's lunar date
 */
async function getTodayLunarDate(): Promise<Response> {
  const todayLunar = LunarService.getTodayLunarDate();
  const today = new Date();

  return createSuccessResponse({
    solar_date: {
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    },
    lunar_date: {
      day: todayLunar.lunarDay,
      month: todayLunar.lunarMonth,
      year: todayLunar.lunarYear,
    },
  });
}

/**
 * Convert solar date to lunar date
 */
async function convertSolarToLunar(req: Request): Promise<Response> {
  const { day, month, year } = await parseJsonBody<{
    day: number;
    month: number;
    year: number;
  }>(req);

  if (!day || !month || !year) {
    return createErrorResponse(
      "Missing required fields: day, month, year",
      400
    );
  }

  // Validate date
  if (
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 1900 ||
    year > 2100
  ) {
    return createErrorResponse("Invalid date values", 400);
  }

  const solarDate = new Date(year, month - 1, day);
  const lunarDate = LunarService.convertSolarToLunar(solarDate);

  return createSuccessResponse({
    solar_date: { day, month, year },
    lunar_date: {
      day: lunarDate.lunarDay,
      month: lunarDate.lunarMonth,
      year: lunarDate.lunarYear,
    },
  });
}
