import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { useEffect } from "react";
import { useProfileState } from "../states/useUserProfileState";
import {
  UserProfileExtended
} from "@template/core-types";
import { useInterestsState } from "../states/useInterestsState";
import {
  initializeAppData,
  InitializeAppDataResponse
} from "../server/appInitActions";
import { useAppState } from "../states/useAppInitState";
import { usePublicUserProfilesState } from "../states/usePublicUsersState";
import { useAuth } from "@clerk/nextjs";
import CONFIG from "@template/global-config";

export const useAppInit = (options = {}) => {
  const profileState = useProfileState();
  const publicProfilesState = usePublicUserProfilesState();
  const { initialized, lastFetched, markFetched, setToken } = useAppState();
  const { setInterests } = useInterestsState();
  const previousDataRef = useRef<UserProfileExtended | undefined>(undefined);
  const { getToken, isLoaded: isClerkLoaded } = useAuth();

  const enabledOption = (options as { enabled?: boolean })?.enabled ?? true;

  // Re-fetch if last fetch was more than TTL ago (5 min)
  const TTL = 5 * 60 * 1000;
  const shouldFetch: boolean = !initialized || !lastFetched || Date.now() - lastFetched > TTL;

  const appInitQuery = useQuery<InitializeAppDataResponse>({
    queryKey: ['app-init'],
    queryFn: initializeAppData,
    staleTime: TTL,
    enabled: shouldFetch && enabledOption,
    ...options,
  });

  // Effect to fetch and set the clerk token
  useEffect(() => {
    const fetchToken = async () => {
      if (isClerkLoaded) {
        try {
          const sessionToken = await getToken({ template: CONFIG.CLERK_TOKEN_TEMPLATE });
          if (sessionToken) {
            setToken(sessionToken);
          }
        } catch (error) {
          console.error("Error fetching Clerk token:", error);
        }
      }
    };

    fetchToken();
  }, [isClerkLoaded, getToken, setToken]);

  useEffect(() => {
    if (appInitQuery.data) {
      // Set industries
      setInterests(appInitQuery.data.interests);

      // Set user profile data
      if (previousDataRef.current !== appInitQuery.data.userProfile) {
        previousDataRef.current = appInitQuery.data.userProfile;
        profileState.setProfile(appInitQuery.data.userProfile);
      }
      // Store public profiles of connections
      if (appInitQuery.data.connectionProfiles && appInitQuery.data.connectionProfiles.length > 0) {
        publicProfilesState.setProfiles(appInitQuery.data.connectionProfiles);
      }

      markFetched();
    }
  }, [appInitQuery.data]);

  return {
    appInitQuery,
  };
};
