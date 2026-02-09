# Admin View Setup

## Overview

The administrative view allows authorized users to manage the gardener waitlist with full CRUD operations and manual reordering capabilities.

## Features

- **View all prospective gardeners** with complete information
- **Position management** - manually reorder gardeners in the waitlist
- **Add new gardeners** manually (bypasses public form and reCAPTCHA)
- **Edit existing gardeners** - update any field
- **Delete gardeners** from the waitlist
- **Sort and filter** using Cloudscape Table components
- **Authentication** - Supabase auth protects the admin view

## Accessing the Admin View

Navigate to `/admin` in your browser (e.g., `http://localhost:5173/admin`)

## Authentication Setup

### 1. Enable Supabase Authentication

In your Supabase project dashboard:

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Disable email confirmation if you want (Settings → Auth → Email Auth → Confirm email = OFF)

### 2. Create an Admin User

You can create an admin user in two ways:

**Option A: Via Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Click **Create user**

**Option B: Via SQL (if you want to use the public signup)**
```sql
-- First, sign up via your public form, then run this to confirm the user
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@example.com';
```

### 3. Row Level Security (RLS)

Make sure your `gardeners` table has appropriate RLS policies. Here's a recommended setup:

```sql
-- Enable RLS
ALTER TABLE gardeners ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (via Netlify function with service role key)
CREATE POLICY "Allow public insert via service role" ON gardeners
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to read all
CREATE POLICY "Allow authenticated read" ON gardeners
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update all
CREATE POLICY "Allow authenticated update" ON gardeners
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete all
CREATE POLICY "Allow authenticated delete" ON gardeners
  FOR DELETE
  TO authenticated
  USING (true);
```

## Table Schema

The admin view expects the following columns in the `gardeners` table:

```sql
CREATE TABLE gardeners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_position INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  experience TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX idx_gardeners_line_position ON gardeners(line_position);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gardeners_updated_at 
  BEFORE UPDATE ON gardeners 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

## Admin Features

### Position Management

- **Move Up** - Moves selected gardener up one position
- **Move Down** - Moves selected gardener down one position
- Position numbers are independent of creation date
- Positions are automatically assigned when adding new gardeners

### Add Gardener

- Bypasses reCAPTCHA verification
- Automatically assigns next available position
- All fields except name and email are optional

### Edit Gardener

- Select a gardener from the table
- Click **Edit** to modify any field
- Changes are saved immediately

### Delete Gardener

- Select a gardener from the table
- Click **Delete** and confirm
- Deletion is permanent

## Development

Run the development server:

```bash
npm run dev
```

Then navigate to `http://localhost:5173/admin`

## Production Deployment

The admin view is automatically deployed with your Netlify site. Access it at:

```
https://your-site.netlify.app/admin
```

## Security Notes

1. **Authentication is required** - Users must sign in with Supabase auth
2. **Use strong passwords** for admin accounts
3. **RLS policies** protect the database from unauthorized access
4. **Service role key** is only used in Netlify functions (server-side)
5. **Anon key** is used in the browser (client-side) with RLS protection

## Troubleshooting

### "Failed to load gardeners"

- Check that RLS policies allow authenticated users to SELECT
- Verify the user is signed in (check browser console)
- Check Supabase logs for errors

### "Failed to update/delete"

- Ensure RLS policies allow UPDATE/DELETE for authenticated users
- Verify the user session is valid

### Can't sign in

- Check that email auth is enabled in Supabase
- Verify the user exists in Authentication → Users
- Check browser console for error messages
