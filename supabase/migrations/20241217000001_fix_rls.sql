-- Disable Row Level Security for reminders table to allow public access
-- In production, you should implement proper auth and RLS policies

-- Disable RLS for reminders table
ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;

-- Grant public access to reminders table
GRANT ALL ON TABLE reminders TO anon;
GRANT ALL ON TABLE reminders TO authenticated; 