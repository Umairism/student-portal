# 🚀 Quick Supabase Setup Guide

## ⭐ **Recommended Approach**

### Step 1: Run the setup script (for instructions)
```bash
npm run db:init
```
This will check your connection and provide setup instructions.

### Step 2: Manual Schema Setup in Supabase (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Create a **New Query**
3. Copy the **ENTIRE contents** of `db/schema.sql`
4. Paste and **Run** it in the SQL Editor

**Why manual setup?** 
- ✅ Better handling of complex SQL features
- ✅ Immediate error feedback in Supabase
- ✅ No issues with function definitions or policies
- ✅ Complete schema with all features

### Step 3: Verify Setup
- Check that tables appear in **Table Editor**
- Verify **RLS is enabled** on tables
- Confirm **policies are active**

## 🔄 Alternative: Automated Basic Setup

If you prefer automated setup (creates basic tables only):

### Step 1: Create exec_sql function
Run `db/setup-functions.sql` in Supabase SQL Editor first.

### Step 2: Run initialization
```bash
npm run db:init
```
**Note:** This creates basic tables but may miss advanced features.

## ✅ Verification

After setup, you should see these tables in your Supabase Dashboard:
- user_roles
- user_role_assignments  
- profiles
- departments
- courses
- course_enrollments
- semesters
- assignments
- notifications
- And many more...

## 🔧 Required Environment Variables

Make sure your `.env` file has:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🐛 Troubleshooting

### "Could not find the function exec_sql"
- Run `db/setup-functions.sql` first in Supabase SQL Editor

### "Service role key required" 
- Add your service role key to `.env`

### Tables not appearing
- Check RLS is enabled in Table Editor
- Verify policies are created

## 📞 Need Help?

If you encounter issues:
1. Check the Supabase logs in Dashboard → Logs
2. Verify your environment variables
3. Ensure your service role key has admin permissions
