# Contributing to Nhắc Lịch Âm API

## Development Setup

1. **Install Supabase CLI**

   ```bash
   # macOS
   brew install supabase/tap/supabase

   # Linux/Windows
   # Download from https://github.com/supabase/cli/releases
   ```

2. **Clone & Setup**

   ```bash
   git clone <repo-url>
   cd nhaclicham-api
   supabase login
   supabase link --project-ref aekfivlrnrdzolsiipdf
   ```

3. **Local Development**

   ```bash
   # Serve functions locally
   supabase functions serve

   # Deploy functions
   supabase functions deploy
   ```

## Project Structure

- `supabase/functions/_shared/` - Shared utilities and business logic
- `supabase/functions/api/` - Main API endpoint
- `supabase/functions/health/` - Health check endpoint
- `supabase/migrations/` - Database migrations

## Guidelines

- All code must be TypeScript
- Use Deno runtime (no Node.js dependencies)
- Follow REST API conventions
- Add proper error handling
- Test locally before submitting PR

## Testing

```bash
# Test API endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:54321/functions/v1/api/health
```

## Deployment

Functions are automatically deployed to Supabase Edge Functions on push to main branch.
