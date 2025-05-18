'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Interest } from '@template/core-types';

/**
 * Updated interest state that doesn't make direct API calls
 * Instead, it serves as a client-side cache that can be populated by
 * React Query hooks or server actions
 */
type InterestState = {
  // Data
  allInterests: Interest[];
  cachedInterests: Record<string, Interest[]>;

  // Actions - no API calls, just state updates
  setInterests: (interests: Interest[]) => void;
  setCachedInterestSearch: (query: string, results: Interest[]) => void;
  getInterest: (id: string) => Interest | undefined;
  getInterests: (ids: string[]) => Interest[];
  clearCache: () => void;
  lastUpdated: number;
};

export const useInterestsState = create<InterestState>()(
  persist(
    (set, get) => ({
      // Initial state
      allInterests: [],
      cachedInterests: {},
      lastUpdated: 0,

      // Set all interests
      setInterests: (interests: Interest[]) => {
        set(state => {
          const unchanged =
            state.allInterests.length === interests.length &&
            state.allInterests.every((ind, idx) => ind.id === interests[idx].id);

          if (unchanged) {
            return state; // avoid unnecessary state update to prevent loops
          }

          return {
            allInterests: interests,
            lastUpdated: Date.now(),
          };
        });
      },

      // Cache search results
      setCachedInterestSearch: (query: string, results: Interest[]) => {
        const trimmedQuery = query.trim().toLowerCase();
        if (!trimmedQuery) return;

        set(state => ({
          cachedInterests: {
            ...state.cachedInterests,
            [trimmedQuery]: results,
          },
        }));
      },

      // Get interest by ID from local state
      getInterest: (id: string) => {
        return get().allInterests.find(interest => interest.id === id);
      },

      // Get interests by IDs from local state
      getInterests: (ids: string[]) => {
        return get().allInterests.filter(interest => ids.includes(interest.id));
      },

      // Clear the cache
      clearCache: () => {
        set({ cachedInterests: {} });
      },
    }),
    {
      name: 'template-taxonomy-interest-storage',
      partialize: state => ({
        allInterests: state.allInterests,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
);