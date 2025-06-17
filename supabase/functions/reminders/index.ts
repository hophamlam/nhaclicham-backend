// Reminders Edge Function
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

    // Route handling based on method and path
    switch (method) {
      case "POST":
        return await handlePost(req, pathSegments);

      case "GET":
        return await handleGet(req, pathSegments, queryParams);

      case "PUT":
        return await handlePut(req, pathSegments);

      case "DELETE":
        return await handleDelete(req, pathSegments);

      default:
        return createErrorResponse("Method not allowed", 405);
    }
  } catch (error) {
    console.error("Error in reminders function:", error);
    return createErrorResponse(error.message || "Internal server error");
  }
});

/**
 * Handle POST requests - Create reminder
 */
async function handlePost(
  req: Request,
  pathSegments: string[]
): Promise<Response> {
  if (pathSegments.length > 1) {
    return createErrorResponse("Invalid endpoint", 404);
  }

  const reminderData = await parseJsonBody<CreateReminderRequest>(req);

  // Validate required fields
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

/**
 * Handle GET requests
 */
async function handleGet(
  req: Request,
  pathSegments: string[],
  queryParams: URLSearchParams
): Promise<Response> {
  // GET /reminders/today - Get today's reminders (all users)
  if (pathSegments.length === 2 && pathSegments[1] === "today") {
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

  // GET /reminders/today/:userId - Get today's reminders for specific user
  if (pathSegments.length === 3 && pathSegments[1] === "today") {
    const userId = pathSegments[2];
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

  // GET /reminders/user/:userId - Get all reminders for user
  if (pathSegments.length === 3 && pathSegments[1] === "user") {
    const userId = pathSegments[2];
    const reminders = await ReminderService.getRemindersByUserId(userId);
    return createSuccessResponse(reminders);
  }

  // GET /reminders/:id - Get reminder by ID
  if (pathSegments.length === 2) {
    const id = pathSegments[1];
    const reminder = await ReminderService.getReminderById(id);

    if (!reminder) {
      return createErrorResponse("Reminder not found", 404);
    }

    return createSuccessResponse(reminder);
  }

  // GET /reminders - List reminders (requires user_id param)
  if (pathSegments.length === 1) {
    const userId = queryParams.get("user_id");
    if (!userId) {
      return createErrorResponse("user_id parameter is required", 400);
    }

    const reminders = await ReminderService.getRemindersByUserId(userId);
    return createSuccessResponse(reminders);
  }

  return createErrorResponse("Invalid endpoint", 404);
}

/**
 * Handle PUT requests - Update reminder
 */
async function handlePut(
  req: Request,
  pathSegments: string[]
): Promise<Response> {
  if (pathSegments.length !== 2) {
    return createErrorResponse("Invalid endpoint", 404);
  }

  const id = pathSegments[1];
  const updateData = await parseJsonBody<UpdateReminderRequest>(req);

  const reminder = await ReminderService.updateReminder(id, updateData);
  return createSuccessResponse(reminder, "Reminder updated successfully");
}

/**
 * Handle DELETE requests - Delete reminder
 */
async function handleDelete(
  req: Request,
  pathSegments: string[]
): Promise<Response> {
  if (pathSegments.length !== 2) {
    return createErrorResponse("Invalid endpoint", 404);
  }

  const id = pathSegments[1];
  await ReminderService.deleteReminder(id);
  return createSuccessResponse(null, "Reminder deleted successfully");
}
