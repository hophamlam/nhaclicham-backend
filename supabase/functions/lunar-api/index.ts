// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { S2L, L2S } from "https://esm.sh/lunar-calendar-ts-vi@latest";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Regex patterns for endpoints
const LUNAR_CONVERT_REGEX = /\/lunar-convert\/?$/;
const SOLAR_CONVERT_REGEX = /\/solar-convert\/?$/;

async function handler(req: Request): Promise<Response> {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const url = req.url;

    // Solar to Lunar conversion
    if (LUNAR_CONVERT_REGEX.test(url) && req.method === "GET") {
      return handleSolarToLunar(req);
    }

    // Lunar to Solar conversion
    if (SOLAR_CONVERT_REGEX.test(url) && req.method === "GET") {
      return handleLunarToSolar(req);
    }

    // Root endpoint - API info
    return new Response(
      JSON.stringify({
        message: "Lunar Calendar API",
        version: "1.0.0",
        endpoints: {
          "GET /lunar-convert?date=YYYY-MM-DD": "Convert solar date to lunar",
          "GET /solar-convert?lunar_day=DD&lunar_month=MM&lunar_year=YYYY[&is_leap=true]":
            "Convert lunar date to solar",
        },
        example_requests: [
          "/lunar-convert?date=2024-12-25",
          "/solar-convert?lunar_day=15&lunar_month=8&lunar_year=2024",
        ],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return createErrorResponse(`Function error: ${error.message}`, 500);
  }
}

// === CONVERSION HANDLERS ===

async function handleSolarToLunar(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const dateStr = url.searchParams.get("date");

    if (!dateStr) {
      return createErrorResponse(
        "Missing 'date' parameter (format: YYYY-MM-DD)",
        400
      );
    }

    const solarDate = new Date(dateStr);
    if (isNaN(solarDate.getTime())) {
      return createErrorResponse("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const lunarResult = S2L(
      solarDate.getFullYear(),
      solarDate.getMonth() + 1, // JS months are 0-indexed
      solarDate.getDate()
    );

    return createSuccessResponse({
      solar_date: dateStr,
      lunar_day: lunarResult[0],
      lunar_month: lunarResult[1],
      lunar_year: lunarResult[2],
      is_leap_month: lunarResult[3] === 1,
      formatted: `${lunarResult[0]}/${lunarResult[1]}/${lunarResult[2]}${
        lunarResult[3] === 1 ? " (nhuận)" : ""
      }`,
      vietnamese_date: formatVietnameseDate(
        lunarResult[0],
        lunarResult[1],
        lunarResult[2],
        lunarResult[3] === 1
      ),
    });
  } catch (error) {
    return createErrorResponse(`Conversion error: ${error.message}`, 500);
  }
}

async function handleLunarToSolar(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const lunarDay = parseInt(url.searchParams.get("lunar_day") || "");
    const lunarMonth = parseInt(url.searchParams.get("lunar_month") || "");
    const lunarYear = parseInt(url.searchParams.get("lunar_year") || "");
    const isLeap = url.searchParams.get("is_leap") === "true";

    if (!lunarDay || !lunarMonth || !lunarYear) {
      return createErrorResponse(
        "Missing required parameters: lunar_day, lunar_month, lunar_year",
        400
      );
    }

    if (lunarDay < 1 || lunarDay > 30 || lunarMonth < 1 || lunarMonth > 12) {
      return createErrorResponse("Invalid lunar date values", 400);
    }

    const solarResult = L2S(lunarDay, lunarMonth, lunarYear, isLeap ? 1 : 0);
    const solarDate = new Date(
      solarResult[2],
      solarResult[1] - 1,
      solarResult[0]
    );

    return createSuccessResponse({
      lunar_day: lunarDay,
      lunar_month: lunarMonth,
      lunar_year: lunarYear,
      is_leap_month: isLeap,
      solar_date: solarDate.toISOString().split("T")[0],
      solar_day: solarResult[0],
      solar_month: solarResult[1],
      solar_year: solarResult[2],
      formatted: solarDate.toLocaleDateString("vi-VN"),
      day_of_week: solarDate.toLocaleDateString("vi-VN", { weekday: "long" }),
    });
  } catch (error) {
    return createErrorResponse(`Conversion error: ${error.message}`, 500);
  }
}

// === UTILITY FUNCTIONS ===

function formatVietnameseDate(
  day: number,
  month: number,
  year: number,
  isLeap: boolean
): string {
  const monthNames = [
    "",
    "Giêng",
    "Hai",
    "Ba",
    "Tư",
    "Năm",
    "Sáu",
    "Bảy",
    "Tám",
    "Chín",
    "Mười",
    "Mười một",
    "Chạp",
  ];

  return `Ngày ${day} tháng ${monthNames[month]} năm ${year}${
    isLeap ? " (nhuận)" : ""
  }`;
}

function createSuccessResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function createErrorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(handler);

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/lunar-api' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
