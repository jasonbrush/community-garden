# Admin Quick Start Guide

## Setup (One-Time)

### 1. Create Admin User in Supabase

Go to your Supabase dashboard → **Authentication** → **Users** → **Add user**

- Email: `admin@yourdomain.com`
- Password: (choose a strong password)
- Click **Create user**

### 2. Configure RLS Policies

Run this SQL in Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE gardeners ENABLE ROW LEVEL SECURITY;

-- Public can insert (via Netlify function)
CREATE POLICY "Allow public insert" ON gardeners
  FOR INSERT WITH CHECK (true);

-- Authenticated users can do everything
CREATE POLICY "Allow authenticated all" ON gardeners
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

## Daily Use

### Access Admin Panel

1. Go to `/admin` on your site
2. Sign in with your admin credentials
3. You'll see the gardener waitlist table

### Common Tasks

**View All Gardeners**
- The table shows everyone automatically
- Click column headers to sort
- See position, name, email, phone, address, experience, notes, and date added

**Add a New Gardener**
1. Click **Add Gardener**
2. Fill in name and email (required)
3. Add optional fields: phone, address, experience, notes
4. Click **Add**
5. They're automatically added to the end of the list

**Edit a Gardener**
1. Click on a row to select it
2. Click **Edit**
3. Modify any fields
4. Click **Save**

**Delete a Gardener**
1. Click on a row to select it
2. Click **Delete**
3. Confirm the deletion

**Reorder the Waitlist**
1. Click on a row to select it
2. Click **Move Up** or **Move Down**
3. Position updates immediately
4. This is independent of when they signed up

**Refresh Data**
- Click **Refresh** to reload the latest data

## Tips

- Position numbers determine waitlist order (lower = higher priority)
- You can manually adjust positions to prioritize certain gardeners
- The date added is preserved even when you change positions
- All changes are saved immediately
- Use the success/error alerts to confirm actions

## Troubleshooting

**Can't sign in?**
- Verify your email/password
- Check that the user exists in Supabase → Authentication → Users

**Can't see any gardeners?**
- Check RLS policies are set up correctly
- Make sure you're signed in (check for "Sign Out" button)

**Changes not saving?**
- Check browser console for errors
- Verify RLS policies allow UPDATE/DELETE for authenticated users
- Check Supabase logs

## Security

- Never share admin credentials
- Sign out when done
- Use a strong, unique password
- Only create admin accounts for trusted users
