'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserProfileExtended,
} from '@template/core-types';
import {
  getCurrentUserServer,
  getUserByIdServer,
  updateUserProfileServer,
  getPublicUserProfilesServer,
  getAllUsersServer,
} from '../server/userActions';
import { getPublicUserProfiles } from '../server/apiClientActions';
import { useProfileState } from '../states/useUserProfileState';
import { usePublicUserProfilesState } from '../states/usePublicUsersState';
import { useEffect, useRef } from 'react';

// Query keys
export const userKeys = {
  all: ['user'] as const,
  current: () => [...userKeys.all, 'current'] as const,
  byId: (id: string) => [...userKeys.all, 'by-id', id] as const,
  publicProfiles: (userIds: string[]) => [...userKeys.all, 'public-profiles', userIds.sort().join(',')] as const,
  adminUsers: (limit: number, offset: number) => [...userKeys.all, 'admin', 'all-users', `${limit}-${offset}`] as const,
};

// Current user profile hook
export const useCurrentUser = (options = {}) => {
  const profileState = useProfileState();
  const previousDataRef = useRef<UserProfileExtended | undefined>(undefined);

  const query = useQuery({
    queryKey: userKeys.current(),
    queryFn: getCurrentUserServer,
    staleTime: 1000 * 60 * 5,
    ...options,
  });

  // Only update store if data changed and different from current profile
  useEffect(() => {
    if (query.data &&
        query.status === 'success' &&
        previousDataRef.current !== query.data &&
        profileState.profile?.clerkUserId !== query.data.clerkUserId) {

      previousDataRef.current = query.data;
      profileState.setProfile(query.data);
    }
  }, [query.data, query.status, profileState]);

  return {
    ...query,
    profile: profileState.profile || query.data,
  };
};

// User by ID hook
export const useUserById = (userId: string, options = {}) => {
  return useQuery({
    queryKey: userKeys.byId(userId),
    queryFn: () => getUserByIdServer(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
    ...options,
  });
};

// Update user profile hook
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const profileState = useProfileState();

  return useMutation({
    mutationFn: updateUserProfileServer,
    onSuccess: (updatedProfile) => {
      // Update the Zustand store
      profileState.setProfile(updatedProfile);

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
    },
  });
};

// Public user profiles hook - Server-side fetching
export const usePublicUserProfiles = (userIds: string[], options = {}) => {
  const publicProfilesState = usePublicUserProfilesState();
  const queryClient = useQueryClient();

  // Filter out IDs we already have in the store to minimize API calls
  const missingUserIds = userIds.filter(id => !publicProfilesState.profiles[id]);

  const query = useQuery({
    queryKey: userKeys.publicProfiles(userIds),
    queryFn: () => missingUserIds.length > 0 ? getPublicUserProfilesServer(missingUserIds) : Promise.resolve([]),
    staleTime: 1000 * 60 * 10, // 10 minutes - profiles don't change frequently
    enabled: userIds.length > 0 && missingUserIds.length > 0,
    ...options,
  });

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      // Before updating state, check if any of these profiles are different from what we have
      const hasNewOrChangedProfiles = query.data.some(profile => {
        const existingProfile = publicProfilesState.profiles[profile.clerkUserId];
        return !existingProfile ||
               JSON.stringify({ ...existingProfile, _lastFetched: undefined }) !==
               JSON.stringify({ ...profile, _lastFetched: undefined });
      });

      // Only update if we have new or changed profiles
      if (hasNewOrChangedProfiles) {
        // Store fetched profiles
        publicProfilesState.setProfiles(query.data);
      }
    }
  }, [query.data, publicProfilesState]);

  // Get all requested profiles from the store
  const profiles = userIds.map(id => publicProfilesState.profiles[id]).filter(Boolean);

  // Prefetch any missing profiles that weren't in this query
  useEffect(() => {
    const stillMissing = userIds.filter(id => !publicProfilesState.profiles[id]);
    if (stillMissing.length > 0 && !query.isLoading && !query.isError) {
      queryClient.prefetchQuery({
        queryKey: userKeys.publicProfiles(stillMissing),
        queryFn: () => getPublicUserProfilesServer(stillMissing),
      });
    }
  }, [userIds, publicProfilesState.profiles, queryClient, query.isLoading, query.isError]);

  return {
    ...query,
    profiles,
    // Helper function to get a specific profile
    getProfile: (id: string) => publicProfilesState.profiles[id],
    // Refetch all profiles, even ones we already have
    refetchAll: () => {
      if (userIds.length > 0) {
        return queryClient.fetchQuery({
          queryKey: userKeys.publicProfiles(userIds),
          queryFn: () => getPublicUserProfilesServer(userIds),
        });
      }
      return Promise.resolve([]);
    },
  };
};

// Client-side fetching version for more dynamic scenarios
export const usePublicUserProfilesClient = (userIds: string[]) => {
  const publicProfilesState = usePublicUserProfilesState();

  const mutation = useMutation({
    mutationFn: getPublicUserProfiles,
    onSuccess: (data) => {
      publicProfilesState.setProfiles(data);
    },
  });

  // Fetch missing profiles on mount
  useEffect(() => {
    const missingUserIds = userIds.filter(id => !publicProfilesState.profiles[id]);
    if (missingUserIds.length > 0 && !mutation.isPending) {
      mutation.mutate(missingUserIds);
    }
  }, [userIds, publicProfilesState.profiles, mutation]);

  // Get all requested profiles from the store
  const profiles = userIds.map(id => publicProfilesState.profiles[id]).filter(Boolean);

  return {
    ...mutation,
    profiles,
    getProfile: (id: string) => publicProfilesState.profiles[id],
    refetch: (ids = userIds) => {
      if (ids.length > 0) {
        mutation.mutate(ids);
      }
    }
  };
};

// Admin hook to get all users
export const useAllUsers = (limit = 50, offset = 0, options = {}) => {
  const queryClient = useQueryClient();
  const publicProfilesState = usePublicUserProfilesState();

  const query = useQuery({
    queryKey: userKeys.adminUsers(limit, offset),
    queryFn: () => getAllUsersServer(limit, offset),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });

  useEffect(() => {
    if (query.data?.users) {
      // Add the users to the public profiles state for reuse elsewhere
      publicProfilesState.setProfiles(query.data.users);
    }
  }, [query.data, publicProfilesState]);

  return {
    ...query,
    users: query.data?.users || [],
    total: query.data?.total || 0,
    refetch: () => queryClient.invalidateQueries({ queryKey: userKeys.adminUsers(limit, offset) }),
  };
};
