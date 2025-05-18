import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  // App init state
  initialized: boolean;
  lastFetched: number | null;
  setInitialized: (value: boolean) => void;
  markFetched: () => void;
  reset: () => void;
  // Token state
  token: string | null;
  decoded: Record<string, unknown> | null;
  expiresAt: number | null;
  isLoadingToken: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
  setLoadingToken: (isLoading: boolean) => void;
}

export const useAppState = create<AppState>()(
  persist(
    (set) => ({
      // Token state
      token: null,
      isLoadingToken: true,
      decoded: null,
      expiresAt: null,
      setToken: (token: string) => {
        const split = token.split('.');
        if (split.length === 3) {
          const decoded = JSON.parse(atob(split[1]));
          const expiresAt = decoded.exp * 1000;
          if (expiresAt > Date.now()) {
            set({ decoded, expiresAt });
            set({ token, isLoadingToken: false });
          } else {
            set({ decoded: null, expiresAt: null, token: null, isLoadingToken: false });
          }
        }
      },
      clearToken: () => set({ token: null, decoded: null, expiresAt: null, isLoadingToken: false }),
      setLoadingToken: (isLoading: boolean) => set({ isLoadingToken: isLoading }),
      // App init state
      initialized: false,
      lastFetched: null,
      setInitialized: (value) => set({ initialized: value }),
      markFetched: () => set({ initialized: true, lastFetched: Date.now() }),
      reset: () => set({ initialized: false }),
    }),
    {
      name: 'web-app-init',
      storage: typeof window !== 'undefined'
        ? createJSONStorage(() => sessionStorage)
        : undefined,
    },
  ),
);