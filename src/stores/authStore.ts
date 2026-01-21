/**
 * Auth Store - Zustand
 * จัดการ Authentication state ทั้งหมด
 */

import { create } from 'zustand';
import { supabase, isConfigured } from '../lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * แปล error message จาก Supabase เป็นภาษาไทย
 */
function translateAuthError(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'ไม่สามารถเข้าสู่ระบบได้ เนื่องจากอีเมลหรือรหัสผ่านไม่ถูกต้อง',
    'Email not confirmed': 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ',
    'User already registered': 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น',
    'Password should be at least 6 characters': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
    'Unable to validate email address: invalid format': 'รูปแบบอีเมลไม่ถูกต้อง',
    'Signup requires a valid password': 'กรุณากรอกรหัสผ่าน',
    'Anonymous sign-ins are disabled': 'ระบบไม่รองรับการเข้าสู่ระบบแบบไม่ระบุตัวตน',
    'Email rate limit exceeded': 'ส่งอีเมลมากเกินไป กรุณารอสักครู่แล้วลองใหม่',
    'For security purposes, you can only request this once every 60 seconds': 'เพื่อความปลอดภัย กรุณารอ 60 วินาทีก่อนลองใหม่',
  };

  return errorMap[message] || message;
}

// Profile type ที่ตรงกับ database
interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Pick<Profile, 'username' | 'display_name' | 'avatar_url'>>) => Promise<void>;
  
  // Modal controls
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  switchAuthMode: () => void;
  clearError: () => void;
  clearSuccess: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  error: null,
  successMessage: null,
  isAuthModalOpen: false,
  authModalMode: 'login',

  // Initialize auth state
  initialize: async () => {
    if (!isConfigured) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return;
    }

    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session?.user) {
        set({ user: session.user, session, isLoading: false });
        // Fetch profile in background
        get().fetchProfile();
      } else {
        set({ isLoading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        set({ user: session?.user ?? null, session });

        if (event === 'SIGNED_IN' && session?.user) {
          get().fetchProfile();
        } else if (event === 'SIGNED_OUT') {
          set({ profile: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false, error: 'Failed to initialize auth' });
    }
  },

  // Sign up
  signUp: async (email, password, displayName) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        set({ isLoading: false, error: translateAuthError(error.message) });
        return { error };
      }

      // If email confirmation is required
      if (data.user && !data.session) {
        set({ 
          isLoading: false, 
          successMessage: 'กรุณาตรวจสอบอีเมลเพื่อยืนยันการสมัคร' 
        });
        return { error: null };
      }

      // Create profile after signup
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: displayName || email.split('@')[0],
          username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      set({ isLoading: false, isAuthModalOpen: false });
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      set({ isLoading: false, error: translateAuthError(message) });
      return { error: error as AuthError };
    }
  },

  // Sign in
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ isLoading: false, error: translateAuthError(error.message) });
        return { error };
      }

      set({ isLoading: false, isAuthModalOpen: false });
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      set({ isLoading: false, error: translateAuthError(message) });
      return { error: error as AuthError };
    }
  },

  // Sign out
  signOut: async () => {
    set({ isLoading: true });

    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, profile: null, isLoading: false });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ isLoading: false });
    }
  },

  // Fetch user profile
  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // PGRST116 = not found - create profile if it doesn't exist
      if (error && error.code === 'PGRST116') {
        // Auto-create profile for existing users
        const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'ผู้ใช้';
        const username = user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || null;
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            display_name: displayName,
            username: username,
          })
          .select()
          .single();

        if (createError) {
          console.error('Profile creation error:', createError);
          return;
        }

        if (newProfile) {
          set({ profile: newProfile });
        }
        return;
      }

      if (error) {
        console.error('Profile fetch error:', error);
        return;
      }

      if (data) {
        set({ profile: data });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  },

  // Update profile
  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      // Refetch profile
      get().fetchProfile();
    } catch (error) {
      console.error('Profile update error:', error);
    }
  },

  // Modal controls
  openAuthModal: (mode = 'login') => {
    set({ isAuthModalOpen: true, authModalMode: mode, error: null, successMessage: null });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false, error: null, successMessage: null });
  },

  switchAuthMode: () => {
    set((state) => ({ 
      authModalMode: state.authModalMode === 'login' ? 'signup' : 'login',
      error: null,
      successMessage: null 
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  clearSuccess: () => {
    set({ successMessage: null });
  },
}));
