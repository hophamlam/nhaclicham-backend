// Main API Edge Function - Routes all requests
import {
  handleCORS,
  createSuccessResponse,
  createErrorResponse,
  parseJsonBody,
  getPathSegments,
  getQueryParams,
} from "../_shared/utils.ts";
import { ReminderService } from "../_shared/reminder-service.ts";
import { LunarService } from "../_shared/lunar-service.ts";
import {
  CreateReminderRequest,
  UpdateReminderRequest,
} from "../_shared/types.ts";

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  try {
    const method = req.method;
    const pathSegments = getPathSegments(req);
    const queryParams = getQueryParams(req);

    // Root endpoint - API documentation
    if (pathSegments.length === 1 && pathSegments[0] === "api") {
      return createSuccessResponse({
        message: "Welcome to Nhắc Lịch Âm API",
        version: "1.0.0",
        endpoints: {
          health: "GET /api/health",
          reminders: {
            create: "POST /api/reminders",
            get_by_user: "GET /api/reminders/user/:userId",
            get_by_id: "GET /api/reminders/:id",
            update: "PUT /api/reminders/:id",
            delete: "DELETE /api/reminders/:id",
            today_by_user: "GET /api/reminders/today/:userId",
            today_all: "GET /api/reminders/today",
          },
          lunar: {
            today: "GET /api/lunar/today",
            convert: "POST /api/lunar/convert",
          },
        },
      });
    }

    // Health check
    if (
      pathSegments.length === 2 &&
      pathSegments[0] === "api" &&
      pathSegments[1] === "health"
    ) {
      return createSuccessResponse({
        status: "OK",
        message: "Nhắc Lịch Âm API is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      });
    }

    // Lunar endpoints
    if (
      pathSegments.length >= 2 &&
      pathSegments[0] === "api" &&
      pathSegments[1] === "lunar"
    ) {
      return await handleLunarRoutes(req, pathSegments.slice(2), method);
    }

    // Reminder endpoints
    if (
      pathSegments.length >= 2 &&
      pathSegments[0] === "api" &&
      pathSegments[1] === "reminders"
    ) {
      return await handleReminderRoutes(
        req,
        pathSegments.slice(2),
        method,
        queryParams
      );
    }

    return createErrorResponse("Endpoint not found", 404);
  } catch (error) {
    console.error("Error in API function:", error);
    return createErrorResponse(error.message || "Internal server error");
  }
});

/**
 * Handle lunar routes
 */
async function handleLunarRoutes(
  req: Request,
  pathSegments: string[],
  method: string
): Promise<Response> {
  if (
    method === "GET" &&
    pathSegments.length === 1 &&
    pathSegments[0] === "today"
  ) {
    // GET /api/lunar/today
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

  if (
    method === "POST" &&
    pathSegments.length === 1 &&
    pathSegments[0] === "convert"
  ) {
    // POST /api/lunar/convert
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

  return createErrorResponse("Invalid lunar endpoint", 404);
}

/**
 * Handle reminder routes
 */
async function handleReminderRoutes(
  req: Request,
  pathSegments: string[],
  method: string,
  queryParams: URLSearchParams
): Promise<Response> {
  switch (method) {
    case "POST":
      if (pathSegments.length === 0) {
        // POST /api/reminders
        const reminderData = await parseJsonBody<CreateReminderRequest>(req);

        if (
          !reminderData.user_id ||
          !reminderData.note ||
          reminderData.lunar_day === undefined ||
          reminderData.lunar_month === undefined
        ) {
          return createErrorResponse(
            "Missing required fields: user_id, note, lunar_day, lunar_month",
            400
          );
        }

        const reminder = await ReminderService.createReminder(reminderData);
        return createSuccessResponse(reminder, "Reminder created successfully");
      }
      break;

    case "GET":
      // GET /api/reminders/today
      if (pathSegments.length === 1 && pathSegments[0] === "today") {
        const reminders = await ReminderService.checkTodayReminders();
        const todayLunar = LunarService.getTodayLunarDate();

        return createSuccessResponse({
          reminders,
          today_lunar: {
            day: todayLunar.lunarDay,
            month: todayLunar.lunarMonth,
            year: todayLunar.lunarYear,
          },
          message: `Found ${reminders.length} reminders for today`,
        });
      }

      // GET /api/reminders/today/:userId
      if (pathSegments.length === 2 && pathSegments[0] === "today") {
        const userId = pathSegments[1];
        const reminders = await ReminderService.getTodayReminders(userId);
        const todayLunar = LunarService.getTodayLunarDate();

        return createSuccessResponse({
          reminders,
          today_lunar: {
            day: todayLunar.lunarDay,
            month: todayLunar.lunarMonth,
            year: todayLunar.lunarYear,
          },
        });
      }

      // GET /api/reminders/user/:userId
      if (pathSegments.length === 2 && pathSegments[0] === "user") {
        const userId = pathSegments[1];
        const reminders = await ReminderService.getRemindersByUserId(userId);
        return createSuccessResponse(reminders);
      }

      // GET /api/reminders/:id
      if (pathSegments.length === 1) {
        const id = pathSegments[0];
        const reminder = await ReminderService.getReminderById(id);

        if (!reminder) {
          return createErrorResponse("Reminder not found", 404);
        }

        return createSuccessResponse(reminder);
      }

      // GET /api/reminders?user_id=...
      if (pathSegments.length === 0) {
        const userId = queryParams.get("user_id");
        if (!userId) {
          return createErrorResponse("user_id parameter is required", 400);
        }

        const reminders = await ReminderService.getRemindersByUserId(userId);
        return createSuccessResponse(reminders);
      }
      break;

    case "PUT":
      // PUT /api/reminders/:id
      if (pathSegments.length === 1) {
        const id = pathSegments[0];
        const updateData = await parseJsonBody<UpdateReminderRequest>(req);

        const reminder = await ReminderService.updateReminder(id, updateData);
        return createSuccessResponse(reminder, "Reminder updated successfully");
      }
      break;

    case "DELETE":
      // DELETE /api/reminders/:id
      if (pathSegments.length === 1) {
        const id = pathSegments[0];
        await ReminderService.deleteReminder(id);
        return createSuccessResponse(null, "Reminder deleted successfully");
      }
      break;
  }

  return createErrorResponse("Invalid reminder endpoint", 404);
}
