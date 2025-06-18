// Main API Edge Function - Routes all requests
import {
  createSuccessResponse,
  createErrorResponse,
} from "../_shared/utils.ts";
import { LunarService } from "../_shared/lunar-service.ts";
import { supabase } from "../_shared/supabase.ts";
import { EventService } from "../_shared/event-service.ts";
import { NotificationService } from "../_shared/notification-service.ts";
import { UserService } from "../_shared/user-service.ts";
import type {
  CreateEventRequest,
  UpdateEventRequest,
  ApiResponse,
  NotificationSetting,
} from "../_shared/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const BARE_URL_REGEX = /^https?:\/\/[^\/]+\/api\/?$/;
const URL_WITH_ID_REGEX = /^https?:\/\/[^\/]+\/api\/events\/([a-fA-F0-9\-]+)$/;
const EVENTS_BASE_URL_REGEX = /^https?:\/\/[^\/]+\/api\/events\/?$/;
const TODAY_EVENTS_URL_REGEX = /^https?:\/\/[^\/]+\/api\/today-events\/?$/;
const LUNAR_CONVERT_URL_REGEX = /^https?:\/\/[^\/]+\/api\/lunar-convert\/?$/;
const USER_PROFILE_URL_REGEX = /^https?:\/\/[^\/]+\/api\/profile\/?$/;
const NOTIFICATIONS_URL_REGEX = /^https?:\/\/[^\/]+\/api\/notifications\/?$/;

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { url, method } = req;
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing authorization header" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure user exists in our database
    await UserService.upsertUser(user.id);

    // Root endpoint
    if (BARE_URL_REGEX.test(url)) {
      return new Response(
        JSON.stringify({ message: "Welcome to Nhac Lich Am API!" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // --- User Profile ---
    if (USER_PROFILE_URL_REGEX.test(url)) {
      switch (method) {
        case "GET":
          return handleGetProfile(user.id);
        case "PUT":
        case "PATCH":
          return handleUpdateProfile(req, user.id);
        default:
          return createErrorResponse(
            `Method ${method} not allowed for this route.`,
            405
          );
      }
    }

    // --- Notifications ---
    if (NOTIFICATIONS_URL_REGEX.test(url)) {
      switch (method) {
        case "GET":
          return handleGetNotificationSettings(user.id);
        case "POST":
          return handleCreateNotificationSetting(req, user.id);
        default:
          return createErrorResponse(
            `Method ${method} not allowed for this route.`,
            405
          );
      }
    }

    // --- Event CRUD ---
    const eventWithIdMatch = url.match(URL_WITH_ID_REGEX);
    if (eventWithIdMatch) {
      const eventId = eventWithIdMatch[1];
      switch (method) {
        case "GET":
          return handleGetEventById(eventId, user.id);
        case "PUT":
        case "PATCH":
          return handleUpdateEvent(req, eventId, user.id);
        case "DELETE":
          return handleDeleteEvent(eventId, user.id);
        default:
          return createErrorResponse(
            `Method ${method} not allowed for this route.`,
            405
          );
      }
    }

    if (EVENTS_BASE_URL_REGEX.test(url)) {
      switch (method) {
        case "GET":
          return handleGetEvents(user.id);
        case "POST":
          return handleCreateEvent(req, user.id);
        default:
          return createErrorResponse(
            `Method ${method} not allowed for this route.`,
            405
          );
      }
    }

    // --- Specialized Endpoints ---
    if (TODAY_EVENTS_URL_REGEX.test(url) && method === "GET") {
      return handleGetTodayEvents();
    }

    if (LUNAR_CONVERT_URL_REGEX.test(url) && method === "GET") {
      const urlParams = new URL(url).searchParams;
      const solarDateStr = urlParams.get("date");
      return handleLunarConvert(solarDateStr);
    }

    return createErrorResponse("Not Found", 404);
  } catch (error) {
    return createErrorResponse(error.message, 500);
  }
}

// --- User Profile Handlers ---

async function handleGetProfile(userId: string) {
  const data = await UserService.getUserById(userId);
  return createApiResponse({ data });
}

async function handleUpdateProfile(req: Request, userId: string) {
  const body = await req.json();
  const data = await UserService.updateUser(userId, body);
  return createApiResponse({ data, message: "Profile updated successfully" });
}

// --- Notification Handlers ---

async function handleGetNotificationSettings(userId: string) {
  const data = await NotificationService.getNotificationSettingsByUserId(
    userId
  );
  return createApiResponse({ data });
}

async function handleCreateNotificationSetting(req: Request, userId: string) {
  const body: Omit<NotificationSetting, "id" | "created_at" | "user_id"> =
    await req.json();
  const data = await NotificationService.createNotificationSetting(
    body,
    userId
  );
  return createApiResponse(
    { data, message: "Notification setting created successfully" },
    201
  );
}

// --- Event Handler Functions ---

async function handleGetEvents(userId: string) {
  const data = await EventService.getEventsByUserId(userId);
  return createApiResponse({ data });
}

async function handleGetEventById(eventId: string, userId: string) {
  const data = await EventService.getEventById(eventId, userId);
  if (!data) return createErrorResponse("Event not found.", 404);
  return createApiResponse({ data });
}

async function handleCreateEvent(req: Request, userId: string) {
  const body: CreateEventRequest = await req.json();
  const data = await EventService.createEvent(body, userId);
  return createApiResponse(
    { data, message: "Event created successfully" },
    201
  );
}

async function handleUpdateEvent(
  req: Request,
  eventId: string,
  userId: string
) {
  const body: UpdateEventRequest = await req.json();
  const data = await EventService.updateEvent(eventId, body, userId);
  return createApiResponse({ data, message: "Event updated successfully" });
}

async function handleDeleteEvent(eventId: string, userId: string) {
  const data = await EventService.deleteEvent(eventId, userId);
  return createApiResponse({ data, message: "Event deleted successfully" });
}

async function handleGetTodayEvents() {
  const data = await EventService.getTodayEvents();
  return createApiResponse({ data });
}

function handleLunarConvert(solarDateStr: string | null) {
  if (!solarDateStr) {
    return createErrorResponse(
      'Missing "date" query parameter. Please provide a date in YYYY-MM-DD format.',
      400
    );
  }
  const date = new Date(solarDateStr);
  if (isNaN(date.getTime())) {
    return createErrorResponse(
      "Invalid date format. Please use YYYY-MM-DD.",
      400
    );
  }
  const data = LunarService.convertSolarToLunar(date);
  return createApiResponse({ data });
}

// --- Utility Functions ---

function createApiResponse<T>(body: ApiResponse<T>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Export the handler function for Edge Function runtime
export default handler;
