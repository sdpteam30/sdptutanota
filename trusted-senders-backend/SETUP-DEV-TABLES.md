# Development Tables Setup

## Problem
This branch needs custom database tables, but we don't want to affect other branches that use the same Supabase database.

## Solution: Table Prefixes
The backend now uses a `TABLE_PREFIX` environment variable to prefix all table names. This allows multiple branches to coexist in the same database without conflicts.

## Setup Instructions

### 1. Add TABLE_PREFIX to .env

Add this line to your `trusted-senders-backend/.env` file:

```bash
TABLE_PREFIX=dev_
```

Your full `.env` should look like:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3000
TABLE_PREFIX=dev_
```

### 2. Create the Prefixed Tables in Supabase

1. Go to your Supabase dashboard
2. Navigate to: **SQL Editor** (left sidebar)
3. Copy and paste the contents of `setup-dev-tables.sql`
4. Click **Run**

This will create three tables:
- `dev_trusted_senders`
- `dev_email_sender_status`
- `dev_phishing_reports`

### 3. Restart the Backend

```bash
# Stop the current backend (Ctrl+C)
# Then restart it
cd trusted-senders-backend
node index.js
```

The backend will now use the `dev_` prefixed tables!

## Benefits

✅ **No conflicts** with other branches using the same database  
✅ **Easy cleanup** - just drop the `dev_*` tables when done  
✅ **Configurable** - change `TABLE_PREFIX` for different environments  
✅ **Production ready** - set `TABLE_PREFIX=""` for production tables

## Alternative: Separate Supabase Project

If you prefer complete isolation, you can:
1. Create a new Supabase project at https://supabase.com
2. Update the `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`
3. Set `TABLE_PREFIX=""` (use original table names)
4. Run the SQL from `setup-dev-tables.sql` (but remove the `dev_` prefixes)

