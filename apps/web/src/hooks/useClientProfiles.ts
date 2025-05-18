'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getIndividualClientProfilesServer,
  getBusinessClientProfilesServer,
} from '../server/clientProfileActions';
import { useUserClientProfileState } from '../states/useUserClientProfilesState';
import { useEffect } from 'react';
import { ClientProfileOwnerType } from '@template/core-types';
import { useBusinessProfileState } from '../states/useBusinessProfileState';
import {
  createBusinessClientProfile,
  createIndividualClientProfile,
  deleteBusinessClientProfile,
  deleteIndividualClientProfile,
  updateBusinessClientProfile,
  updateIndividualClientProfile
} from '../server/apiClientActions';

// Query keys
export const clientProfileKeys = {
  all: ['client-profiles'] as const,
  individual: () => [...clientProfileKeys.all, 'individual'] as const,
  individualByOwner: (ownerId: string, ownerType: ClientProfileOwnerType) =>
    [...clientProfileKeys.individual(), ownerId, ownerType] as const,
  individualById: (profileId: string) => [...clientProfileKeys.individual(), 'id', profileId] as const,
  business: () => [...clientProfileKeys.all, 'business'] as const,
  businessByOwner: (ownerId: string, ownerType: ClientProfileOwnerType) =>
    [...clientProfileKeys.business(), ownerId, ownerType] as const,
  businessById: (profileId: string) => [...clientProfileKeys.business(), 'id', profileId] as const,
};

// For users
export const useUserIndividualClientProfiles = (userId: string, options = {}) => {
  const profileState = useUserClientProfileState();

  const query = useQuery({
    queryKey: clientProfileKeys.individualByOwner(userId, 'user'),
    queryFn: () => getIndividualClientProfilesServer(userId, 'user'),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
    ...options,
  });

  useEffect(() => {
    if (query.data) {
      profileState.setIndividualProfiles(query.data);
    }
  }, [query.data, profileState]);

  return {
    ...query,
    individualProfiles: profileState.individualProfiles || query.data || [],
    isLoadingIndividualProfiles: query.isLoading || profileState.isLoadingIndividualProfiles,
    error: query.error?.message || profileState.error,
  };
};

// For businesses
export const useBusinessIndividualClientProfiles = (businessId: string, options = {}) => {
  const businessState = useBusinessProfileState();

  const query = useQuery({
    queryKey: clientProfileKeys.individualByOwner(businessId, 'business'),
    queryFn: () => getIndividualClientProfilesServer(businessId, 'business'),
    staleTime: 1000 * 60 * 5,
    enabled: !!businessId,
    ...options,
  });

  useEffect(() => {
    if (query.data) {
      businessState.addIndividualClientProfile(query.data);
    }
  }, [query.data, businessState]);

  return {
    ...query,
    individualProfiles: businessState.individualClientProfiles || query.data || [],
    isLoadingIndividualProfiles: query.isLoading || businessState.isLoadingIndividualProfiles,
    error: query.error?.message || businessState.error,
  };
};

export const useCreateIndividualClientProfile = () => {
  const queryClient = useQueryClient();
  const profileState = useUserClientProfileState();

  return useMutation({
    mutationFn: createIndividualClientProfile,
    onMutate: () => {
      profileState.clearError();
    },
    onSuccess: (createdProfile, variables) => {
      // Update the Zustand store
      profileState.addIndividualProfile(createdProfile);
      const ownerId = variables.clerkUserId || variables.clerkOrganizationId || '';
      const ownerType: ClientProfileOwnerType = variables.clerkUserId ? 'user' : 'business';
      if (ownerId) {
        // Invalidate and refetch individual profiles
        queryClient.invalidateQueries({
          queryKey: clientProfileKeys.individualByOwner(ownerId, ownerType),
        });
      }
    },
  });
};

export const useUpdateIndividualClientProfile = () => {
  const queryClient = useQueryClient();
  const profileState = useUserClientProfileState();

  return useMutation({
    mutationFn: updateIndividualClientProfile,
    onMutate: () => {
      profileState.clearError();
    },
    onSuccess: (updatedProfile, variables) => {
      // Update the Zustand store
      profileState.updateIndividualProfile(updatedProfile);

      // Invalidate and refetch individual profiles
      queryClient.invalidateQueries({
        queryKey: clientProfileKeys.individualByOwner(variables.clerkUserId || '', 'user'),
      });
    },
  });
};

export const useDeleteIndividualClientProfile = () => {
  const queryClient = useQueryClient();
  const profileState = useUserClientProfileState();

  return useMutation({
    mutationFn: deleteIndividualClientProfile,
    onMutate: () => {
      profileState.clearError();
    },
    onSuccess: (_, profileId) => {
      // Update the Zustand store
      profileState.removeIndividualProfile(profileId);

      // Get user ID from one of the remaining profiles or from the current user
      const userId = profileState.individualProfiles[0]?.clerkUserId || '';
      if (userId) {
        // Invalidate and refetch individual profiles
        queryClient.invalidateQueries({
          queryKey: clientProfileKeys.individualByOwner(userId, 'user'),
        });
      }
    },
  });
};

// Business client profiles hooks
// For users
export const useUserBusinessClientProfiles = (userId: string, options = {}) => {
  const profileState = useUserClientProfileState();

  const query = useQuery({
    queryKey: clientProfileKeys.businessByOwner(userId, 'user'),
    queryFn: () => getBusinessClientProfilesServer(userId, 'user'),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
    ...options,
  });

  useEffect(() => {
    if (query.data) {
      profileState.setBusinessProfiles(query.data);
    }
  }, [query.data, profileState]);

  return {
    ...query,
    businessProfiles: profileState.businessProfiles || query.data || [],
    isLoadingBusinessProfiles: query.isLoading || profileState.isLoadingBusinessProfiles,
    error: query.error?.message || profileState.error,
  };
};

// For businesses
export const useBusinessBusinessClientProfiles = (businessId: string, options = {}) => {
  const businessState = useBusinessProfileState();

  const query = useQuery({
    queryKey: clientProfileKeys.businessByOwner(businessId, 'business'),
    queryFn: () => getBusinessClientProfilesServer(businessId, 'business'),
    staleTime: 1000 * 60 * 5,
    enabled: !!businessId,
    ...options,
  });

  useEffect(() => {
    if (query.data) {
      businessState.addBusinessClientProfile(query.data);
    }
  }, [query.data, businessState]);

  return {
    ...query,
    businessProfiles: businessState.businessClientProfiles || query.data || [],
    isLoadingBusinessProfiles: query.isLoading || businessState.isLoadingBusinessProfiles,
    error: query.error?.message || businessState.error,
  };
};

export const useCreateBusinessClientProfile = () => {
  const queryClient = useQueryClient();
  const profileState = useUserClientProfileState();

  return useMutation({
    mutationFn: createBusinessClientProfile,
    onMutate: () => {
      profileState.clearError();
    },
    onSuccess: (createdProfile, variables) => {
      // Update the Zustand store
      profileState.addBusinessProfile(createdProfile);

      const ownerId = variables.clerkUserId || variables.clerkOrganizationId || '';
      const ownerType: ClientProfileOwnerType = variables.clerkUserId ? 'user' : 'business';
      // Invalidate and refetch business profiles
      queryClient.invalidateQueries({
        queryKey: clientProfileKeys.businessByOwner(ownerId, ownerType),
      });
    },
  });
};

export const useUpdateBusinessClientProfile = () => {
  const queryClient = useQueryClient();
  const profileState = useUserClientProfileState();

  return useMutation({
    mutationFn: updateBusinessClientProfile,
    onMutate: () => {
      profileState.clearError();
    },
    onSuccess: (updatedProfile, variables) => {
      // Update the Zustand store
      profileState.updateBusinessProfile(updatedProfile);

      // Invalidate and refetch business profiles
      const ownerId = variables.clerkUserId || variables.clerkOrganizationId || '';
      const ownerType: ClientProfileOwnerType = variables.clerkUserId ? 'user' : 'business';
      queryClient.invalidateQueries({
        queryKey: clientProfileKeys.businessByOwner(ownerId, ownerType),
      });
    },
  });
};

export const useDeleteBusinessClientProfile = () => {
  const queryClient = useQueryClient();
  const profileState = useUserClientProfileState();

  return useMutation({
    mutationFn: deleteBusinessClientProfile,
    onMutate: () => {
      profileState.clearError();
    },
    onSuccess: (_, profileId) => {
      // Update the Zustand store
      profileState.removeBusinessProfile(profileId);

      // get the owner id, its either the clerkUserId or the clerkOrganizationId
      const ownerId = profileState.businessProfiles[0]?.clerkUserId || profileState.businessProfiles[0]?.clerkOrganizationId || '';
      if (ownerId) {
        const ownerType: ClientProfileOwnerType = profileState.businessProfiles[0]?.clerkUserId ? 'user' : 'business';
        // Invalidate and refetch business profiles
        queryClient.invalidateQueries({
          queryKey: clientProfileKeys.businessByOwner(ownerId, ownerType),
        });
      }
    },
  });
};