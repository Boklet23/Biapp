import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ session: null, supabaseUser: null, profile: null });
  },
}));
