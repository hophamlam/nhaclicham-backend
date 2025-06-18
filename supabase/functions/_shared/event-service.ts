import { supabase, EVENTS_TABLE } from "./supabase.ts";
import { Event, CreateEventRequest, UpdateEventRequest } from "./types.ts";
import { LunarService } from "./lunar-service.ts";

export class EventService {
  /**
   * Fetches events by user ID.
   * @param userId The ID of the user.
   * @returns A list of events for the user.
   */
  static async getEventsByUserId(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from(EVENTS_TABLE)
      .select("*")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Fetches a single event by its ID.
   * @param eventId The ID of the event.
   * @param userId The ID of the user (for security).
   * @returns The event object or null if not found.
   */
  static async getEventById(
    eventId: string,
    userId: string
  ): Promise<Event | null> {
    const { data, error } = await supabase
      .from(EVENTS_TABLE)
      .select("*")
      .eq("id", eventId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // PostgREST error for "Not found"
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Creates a new event.
   * @param createRequest The event data to create.
   * @param userId The ID of the user creating the event.
   * @returns The newly created event.
   */
  static async createEvent(
    createRequest: CreateEventRequest,
    userId: string
  ): Promise<Event> {
    if (createRequest.is_lunar) {
      if (
        !createRequest.lunar_day ||
        !createRequest.lunar_month ||
        !LunarService.isValidLunarDate(
          createRequest.lunar_day,
          createRequest.lunar_month
        )
      ) {
        throw new Error("Invalid lunar date provided.");
      }
    } else {
      if (!createRequest.solar_date) {
        throw new Error("Solar date is required for non-lunar events.");
      }
    }

    const { data, error } = await supabase
      .from(EVENTS_TABLE)
      .insert({ ...createRequest, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Updates an existing event.
   * @param eventId The ID of the event to update.
   * @param updateRequest The data to update.
   * @param userId The ID of the user owning the event.
   * @returns The updated event.
   */
  static async updateEvent(
    eventId: string,
    updateRequest: UpdateEventRequest,
    userId: string
  ): Promise<Event> {
    const { data, error } = await supabase
      .from(EVENTS_TABLE)
      .update(updateRequest)
      .eq("id", eventId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Deletes an event.
   * @param eventId The ID of the event to delete.
   * @param userId The ID of the user owning the event.
   * @returns The deleted event.
   */
  static async deleteEvent(
    eventId: string,
    userId: string
  ): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from(EVENTS_TABLE)
      .delete()
      .eq("id", eventId)
      .eq("user_id", userId)
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    if (!data)
      throw new Error("Event not found or user does not have permission.");
    return data;
  }

  /**
   * Fetches all events that are due today (lunar or solar).
   * @returns A list of events due today.
   */
  static async getTodayEvents(): Promise<Event[]> {
    const today = new Date();
    const { lunarDay, lunarMonth, isLeap } = LunarService.getTodayLunarDate();

    // YYYY-MM-DD format for solar date comparison
    const todaySolarStr = today.toISOString().split("T")[0];

    const { data, error } = await supabase.from(EVENTS_TABLE).select("*").or(
      `and(is_lunar.eq.true,lunar_day.eq.${lunarDay},lunar_month.eq.${lunarMonth},is_leap_month.eq.${isLeap})`, // Lunar match
      `and(is_lunar.eq.false,solar_date.gte.${todaySolarStr}T00:00:00Z,solar_date.lte.${todaySolarStr}T23:59:59Z)` // Solar match for today
    );

    if (error) throw new Error(error.message);
    return data || [];
  }
}
