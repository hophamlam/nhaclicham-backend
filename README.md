# NhacLichAm Supabase Backend

This is the backend for a Lunar Calendar Reminder application, built entirely on Supabase Edge Functions. It provides a serverless API for managing events (both lunar and solar), users, and notification settings.

[![Deploy to Supabase](https://supabase.com/docs/img/deploy/button.svg)](https://supabase.com/new/project?template_url=https://github.com/hophamlam/nhaclicham-backend)

## Features

- **Serverless API**: Built with Deno and deployed as a Supabase Edge Function.
- **Database**: Leverages Supabase Postgres for data storage.
- **Authentication**: Integrated with Supabase Auth for user management and security.
- **Lunar/Solar Events**: Supports creating and managing both traditional lunar calendar events and standard solar calendar events.
- **CI/CD**: GitHub Actions workflow for automatic deployment to Supabase on push to `main`.

## Database Schema

The database consists of four main tables:

- `users`: Stores user information, linked to Supabase Auth.
- `events`: Stores event details, including notes, dates (lunar or solar), and user links.
- `notification_settings`: Configures how and when users are notified about events.
- `notification_logs`: Records all notifications sent to users.

For detailed schema and policies, see the migration file at `supabase/migrations/20250618000000_initial_schema.sql`.

## API Endpoints

All endpoints are served from the main Edge Function located at `/supabase/functions/api`. A valid Supabase JWT is required in the `Authorization: Bearer <TOKEN>` header for all requests.

### Events

- **`GET /api/events`**: Get all events for the authenticated user.
- **`POST /api/events`**: Create a new event.
  - **Body**: `CreateEventRequest`
- **`GET /api/events/{id}`**: Get a single event by its ID.
- **`PUT /api/events/{id}`**: Update an event by its ID.
  - **Body**: `UpdateEventRequest`
- **`DELETE /api/events/{id}`**: Delete an event by its ID.

### Specialized Endpoints

- **`GET /api/today-events`**: Get all events (for all users) that are due today. This is intended for use by a scheduled trigger (e.g., Supabase Cron Job) to send notifications.
- **`GET /api/lunar-convert?date=YYYY-MM-DD`**: Convert a solar date to its corresponding lunar date.

### TypeScript Types

The shared types for API requests and database objects can be found in `supabase/functions/_shared/types.ts`.

## Local Development

1.  **Install Supabase CLI**:
    Follow the [official instructions](https://supabase.com/docs/guides/cli) to install the CLI.

2.  **Link Project**:
    Link your local repository to your Supabase project. You will need your project's reference ID.

    ```bash
    supabase link --project-ref <YOUR_PROJECT_ID>
    ```

3.  **Set Up Environment Variables**:
    Create a `.env.local` file in the `supabase` directory and add your project's keys.

    ```
    SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
    SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
    SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>
    ```

4.  **Run Functions Locally**:
    Start the local Supabase environment. This will also serve the Edge Functions.
    ```bash
    supabase functions serve --env-file ./supabase/.env.local
    ```

## Deployment

The project is configured for automatic deployment using GitHub Actions. Any push to the `main` branch will trigger the workflow defined in `.github/workflows/deploy.yml`, which deploys the Edge Functions to your linked Supabase project.

For this to work, you must set the following secrets in your GitHub repository settings:

- `SUPABASE_ACCESS_TOKEN`: Your Supabase personal access token.
- `SUPABASE_PROJECT_ID`: Your Supabase project ID.

## Contributing

Contributions are welcome! Please feel free to submit a pull request. For more details, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
