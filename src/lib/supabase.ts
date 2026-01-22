/**
 * Supabase Client Setup
 * เชื่อมต่อกับ Supabase จริง - รองรับ Auth, Database, Edge Functions
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder_key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Check if we're properly connected (has real credentials)
export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Export config for debugging
export const supabaseConfig = {
  url: SUPABASE_URL,
  isConfigured,
};

/**
 * ทดสอบการเชื่อมต่อ Database และแสดง log
 */
export async function testDatabaseConnection(): Promise<boolean> {
  if (!isConfigured) {

    return false;
  }

  try {
    // ทดสอบการเชื่อมต่อโดยดึงข้อมูลจาก auth
    const { error } = await supabase.auth.getSession();

    if (error) {

      return false;
    }


    return true;
  } catch (err) {

    return false;
  }
}

// ทดสอบการเชื่อมต่อเมื่อโหลดแอพ
testDatabaseConnection();
