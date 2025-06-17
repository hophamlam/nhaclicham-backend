// Health Check Edge Function
import { handleCORS, createSuccessResponse } from "../_shared/utils.ts";

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  // Simple health check
  return createSuccessResponse({
    status: "OK",
    message: "Nhắc Lịch Âm Edge Functions are running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});
