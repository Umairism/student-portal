-- Supabase Setup Functions
-- Run this first in Supabase SQL Editor to enable schema execution via scripts

-- Create a function to execute SQL statements from the Node.js script
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

-- Optional: Create a function to check if schema is already initialized
CREATE OR REPLACE FUNCTION public.is_schema_initialized()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_schema_initialized() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_schema_initialized() TO anon;
GRANT EXECUTE ON FUNCTION public.is_schema_initialized() TO authenticated;
