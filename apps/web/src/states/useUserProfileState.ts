'use client';
import {
  Theme,
  UserProfileExtended,
  convertToPublicProfile,
  PublicUserProfileExtended,
} from '@template/core-types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ProfileState = {
  profile: UserProfileExtended | undefined;
  publicProfile: PublicUserProfileExtended | undefined;

  // Profile actions - now just state updates without API calls
  setProfile: (profile: UserProfileExtended) => void;
  clearProfile: () => void;
  setTheme: (theme: Theme) => void;
};

export const useProfileState = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: undefined,
      publicProfile: undefined,

      // State-only update functions
      setProfile: (profile: UserProfileExtended) => {
        set({
          profile,
          publicProfile: convertToPublicProfile(profile)
        });
      },

      clearProfile: () => set({
        profile: undefined,
        publicProfile: undefined,
      }),

      setTheme: (theme: Theme) => {
        const currentProfile = get().profile;
        if (!currentProfile) {
          return;
        }

        set({
          profile: {
            ...currentProfile,
            theme
          }
        });

        // Apply theme to document
        if (theme === 'SYSTEM') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', prefersDark);
        } else {
          document.documentElement.classList.toggle('dark', theme === 'DARK');
        }
      },
    }),
    {
      name: 'template-user-profile-storage',
      storage: typeof window !== 'undefined'
        ? createJSONStorage(() => localStorage)
        : undefined,
      partialize: state => ({
        profile: state.profile,
      }),
    },
  ),
);