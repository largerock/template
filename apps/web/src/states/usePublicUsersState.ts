import { create } from 'zustand';
import { PublicUserProfileExtended } from '@template/core-types';
import { persist } from 'zustand/middleware';

type ProfileWithTimestamp = PublicUserProfileExtended & {
  _lastFetched?: number;
};

interface PublicUserProfilesState {
  profiles: Record<string, ProfileWithTimestamp>;

  // Pure state-update helpers (used by React-Query hooks)
  setProfile: (profile: PublicUserProfileExtended) => void;
  setProfiles: (profiles: PublicUserProfileExtended[]) => void;
  getProfile: (clerkUserId: string) => PublicUserProfileExtended | undefined;
  getManyProfiles: (clerkUserIds: string[]) => PublicUserProfileExtended[];
  removeProfile: (clerkUserId: string) => void;
  clear: () => void;

  // Helper to check if profiles are stale
  isProfileStale: (clerkUserId: string, maxAgeMs?: number) => boolean;
  getStaleProfileIds: (clerkUserIds: string[], maxAgeMs?: number) => string[];
}

// Default expiration time - 1 hour
const DEFAULT_PROFILE_MAX_AGE = 60 * 60 * 1000;

export const usePublicUserProfilesState = create<PublicUserProfilesState>()(
  persist(
    (set, get) => ({
      profiles: {},

      // ----- profile helpers -----
      setProfile: (profile) => {
        set(state => ({
          profiles: {
            ...state.profiles,
            [profile.clerkUserId]: {
              ...profile,
              _lastFetched: Date.now()
            }
          }
        }));
      },

      setProfiles: (profilesArr) => {
        set(state => {
          const newProfiles = { ...state.profiles };
          const timestamp = Date.now();
          let hasChanges = false;

          profilesArr.forEach(p => {
            const existingProfile = state.profiles[p.clerkUserId];

            // Only update if the profile doesn't exist or has differences
            // Ignore the _lastFetched field in the comparison
            if (!existingProfile ||
                JSON.stringify({ ...existingProfile, _lastFetched: undefined }) !==
                JSON.stringify({ ...p, _lastFetched: undefined })) {

              newProfiles[p.clerkUserId] = {
                ...p,
                _lastFetched: timestamp
              };
              hasChanges = true;
            }
          });

          // Only return a new state object if there were actual changes
          return hasChanges ? { profiles: newProfiles } : state;
        });
      },

      getProfile: (clerkUserId) => get().profiles[clerkUserId],

      getManyProfiles: (clerkUserIds) => {
        return clerkUserIds
          .map(id => get().profiles[id])
          .filter(Boolean);
      },

      removeProfile: (clerkUserId) => {
        set(state => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [clerkUserId]: _skipped, ...rest } = state.profiles;
          return { profiles: rest };
        });
      },

      // Check if a profile is stale based on its last fetch time
      isProfileStale: (clerkUserId, maxAgeMs = DEFAULT_PROFILE_MAX_AGE) => {
        const profile = get().profiles[clerkUserId];
        if (!profile) return true;

        const lastFetched = profile._lastFetched || 0;
        const now = Date.now();
        return (now - lastFetched) > maxAgeMs;
      },

      // Get all stale profile IDs from a list
      getStaleProfileIds: (clerkUserIds, maxAgeMs = DEFAULT_PROFILE_MAX_AGE) => {
        return clerkUserIds.filter(id => get().isProfileStale(id, maxAgeMs));
      },

      clear: () => set({ profiles: {} }),
    }),
    {
      name: 'template-public-profiles-storage',
      partialize: state => ({ profiles: state.profiles }),
    },
  ),
);
