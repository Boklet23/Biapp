import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import { User } from '@/types';

interface AuthState {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  profile: User | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: User | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  supabaseUser: null,
  profile: null,
  isLoading: true,

  setSession: (session) =>
    set({
      session,
      supabaseUser: session?.user ?? null,
      isLoading: false,
    }),

  setProfile: (profile) => set({ profile }),

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // continue — clear local state regardless of network error
    } finally {
      queryClient.clear();
      set({ session: null, supabaseUser: null, profile: null });
    }
  },
}));
