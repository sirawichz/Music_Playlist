/**
 * Supabase Client Setup
 * Mock version - ใช้ระหว่างพัฒนาเมื่อยังไม่ได้ setup Supabase จริง
 */

// Environment variables (จะใช้จริงเมื่อ setup Supabase)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const _SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock_anon_key';

// Check if we're using mock or real Supabase
export const isMockMode = !import.meta.env.VITE_SUPABASE_URL;

/**
 * Mock Supabase Client
 * เมื่อ setup Supabase จริง ให้ uncomment และใช้ @supabase/supabase-js
 */

/*
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
*/

// Placeholder export สำหรับ mock mode
export const supabase = {
    // Mock auth
    auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
        signOut: async () => ({ error: null }),
    },

    // Mock functions (Edge Functions)
    functions: {
        invoke: async (functionName: string) => {
            console.log(`[Mock] Would call Edge Function: ${functionName}`);
            if (functionName === 'get-spotify-token') {
                return {
                    data: {
                        accessToken: 'mock_token_' + Date.now(),
                        tokenType: 'Bearer',
                        expiresIn: 3600,
                    },
                    error: null,
                };
            }
            return { data: null, error: null };
        },
    },

    // Mock database operations
    from: (table: string) => ({
        select: (_columns?: string) => ({
            eq: () => ({
                single: async () => ({ data: null, error: null }),
                data: [],
                error: null,
            }),
            order: () => ({
                limit: () => ({
                    data: [],
                    error: null,
                }),
            }),
            data: [],
            error: null,
        }),
        insert: (data: unknown) => ({
            select: () => ({
                single: async () => {
                    console.log(`[Mock] Insert into ${table}:`, data);
                    return { data, error: null };
                },
            }),
        }),
        update: (data: unknown) => ({
            eq: () => ({
                select: () => ({
                    single: async () => {
                        console.log(`[Mock] Update ${table}:`, data);
                        return { data, error: null };
                    },
                }),
            }),
        }),
        delete: () => ({
            eq: async () => {
                console.log(`[Mock] Delete from ${table}`);
                return { error: null };
            },
        }),
    }),
};

// Export config for debugging
export const supabaseConfig = {
    url: SUPABASE_URL,
    isMockMode,
};
