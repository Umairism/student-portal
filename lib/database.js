import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client for general use
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Create Supabase client with service role for admin operations
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Query function for direct database operations (for schema initialization)
export async function query(text, params = []) {
  try {
    if (!supabaseAdmin) {
      throw new Error('Service role key required for direct database queries');
    }
    
    // For schema initialization, we'll use the REST API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        query: text,
        parameters: params
      })
    });
    
    if (!response.ok) {
      // For schema operations, execute directly via SQL
      const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: text });
      if (error) throw error;
      return { rows: data || [] };
    }
    
    const data = await response.json();
    return { rows: data };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Transaction function for Supabase
export async function transaction(callback) {
  try {
    if (!supabaseAdmin) {
      throw new Error('Service role key required for transactions');
    }
    
    // Note: Supabase doesn't support traditional transactions in the same way
    // We'll simulate it by calling the callback with the admin client
    const result = await callback(supabaseAdmin);
    return result;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

// Helper functions for common operations
export const db = {
  // Select data
  select: (table) => supabase.from(table).select(),
  
  // Insert data
  insert: (table, data) => supabase.from(table).insert(data),
  
  // Update data
  update: (table, data) => supabase.from(table).update(data),
  
  // Delete data
  delete: (table) => supabase.from(table).delete(),
  
  // Get user
  getUser: () => supabase.auth.getUser(),
  
  // Sign in
  signIn: (credentials) => supabase.auth.signInWithPassword(credentials),
  
  // Sign up
  signUp: (credentials) => supabase.auth.signUp(credentials),
  
  // Sign out
  signOut: () => supabase.auth.signOut(),
};

// Legacy pool export for compatibility (will use Supabase instead)
export const pool = {
  query: query,
  connect: () => ({ 
    query: query, 
    release: () => {} 
  }),
  end: () => Promise.resolve()
};
