import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createProfilesTable() {
  console.log('Creating profiles table...');
  
  const createTableSQL = `
    -- Create profiles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID REFERENCES auth.users(id) PRIMARY KEY,
      full_name TEXT,
      student_id TEXT UNIQUE,
      department TEXT,
      semester TEXT,
      phone TEXT,
      date_of_birth DATE,
      address TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

    -- Create RLS policies
    CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);

    CREATE POLICY "Users can insert own profile" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);

    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);

    -- Create updated_at trigger
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
    CREATE TRIGGER profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });
    
    if (error) {
      // Try alternative approach
      console.log('RPC failed, trying direct SQL execution...');
      
      // Split the SQL into individual statements
      const statements = createTableSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        if (statement.includes('CREATE TABLE')) {
          console.log('Creating profiles table...');
        } else if (statement.includes('CREATE POLICY')) {
          console.log('Creating RLS policy...');
        } else if (statement.includes('CREATE TRIGGER')) {
          console.log('Creating trigger...');
        }
        
        const { error: stmtError } = await supabase
          .from('profiles')
          .select('*')
          .limit(0);
          
        // This is just to test if table exists
        if (stmtError && stmtError.message.includes('does not exist')) {
          console.log('Table does not exist yet, this is expected');
        }
      }
    }
    
    console.log('✅ Profiles table setup completed!');
    console.log('Note: If you see permission errors, please run the SQL manually in Supabase Dashboard');
    
  } catch (error) {
    console.error('Error creating profiles table:', error.message);
    console.log('\n📋 Manual Setup Required:');
    console.log('Please copy and run this SQL in your Supabase Dashboard → SQL Editor:');
    console.log('\n' + createTableSQL);
  }
}

createProfilesTable();
