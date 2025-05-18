'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getBusinessProfile,
  createBusinessProfile,
  updateBusinessProfile,
  deleteBusinessProfile
} from '../server/businessProfileActions';
import {
  getIndividualClientProfilesServer,
  getBusinessClientProfilesServer,
} from '../server/clientProfileActions';
import {
  createIndividualClientProfile,
  createBusinessClientProfile,
  updateIndividualClientProfile,
  updateBusinessClientProfile,
  deleteIndividualClientProfile,
  deleteBusinessClientProfile,
} from '../server/apiClientActions';
import {
  BusinessProfileCreate,
  BusinessProfileUpdate,
  IndividualClientProfileCreate,
  BusinessClientProfileCreate,
  IndividualClientProfileUpdate,
  BusinessClientProfileUpdate,
} from '@template/core-types';
  import { useEffect } from 'react';
import { useBusinessProfileState } from '../states/useBusinessProfileState';

// Query keys for React Query
export const businessProfileKeys = {
  all: ['business-profiles'] as const,
  profile: (clerkOrganizationId: string) =>
      [...businessProfileKeys.all, 'profile', clerkOrganizationId] as const,
  individualClientProfiles: (clerkOrganizationId: string) =>
      [...businessProfileKeys.all, 'individual-client-profiles', clerkOrganizationId] as const,
  businessClientProfiles: (clerkOrganizationId: string) =>
    [...businessProfileKeys.all, 'business-client-profiles', clerkOrganizationId] as const,
};

// CRUD hooks for business profiles
export const useBusinessProfile = (clerkOrganizationId: string) => {
  const store = useBusinessProfileState();
  const { data, isLoading, error } = useQuery({
    queryKey: businessProfileKeys.profile(clerkOrganizationId),
    queryFn: () => getBusinessProfile(clerkOrganizationId),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!clerkOrganizationId,
  });

  useEffect(() => {
    if (data) {
      store.setProfile(data);
    }
  }, [data]);

  return { data, isLoading, error };
};

export const useCreateBusinessProfile = () => {
  const store = useBusinessProfileState();
  return useMutation({
    mutationFn: (businessProfile: BusinessProfileCreate) => createBusinessProfile(businessProfile),
    onSuccess: (createdProfile)=>{
      store.setProfile(createdProfile);
    }
  });
};

export const useUpdateBusinessProfile = () => {
  const store = useBusinessProfileState();
  return useMutation({
    mutationFn: (businessProfile: BusinessProfileUpdate) => updateBusinessProfile(businessProfile),
    onSuccess: (updatedProfile)=>{
      store.setProfile(updatedProfile);
    }
  });
};

export const useDeleteBusinessProfile = () => {
  const store = useBusinessProfileState();
  return useMutation({
    mutationFn: (clerkOrganizationId: string) => deleteBusinessProfile(clerkOrganizationId),
    onSuccess: ()=>{
      store.deleteProfile();
    }
  });
};

// Client profile hooks for business profiles
export const useIndividualClientProfiles = (clerkOrganizationId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: businessProfileKeys.individualClientProfiles(clerkOrganizationId),
    queryFn: () => getIndividualClientProfilesServer(clerkOrganizationId, 'business'),
  });

  useEffect(() => {
    if (data) {
      console.log(data);
    }
  }, [data]);

  return { data, isLoading, error };
};

export const useBusinessClientProfiles = (clerkOrganizationId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: businessProfileKeys.businessClientProfiles(clerkOrganizationId),
    queryFn: () => getBusinessClientProfilesServer(clerkOrganizationId, 'business'),
  });

  useEffect(() => {
    if (data) {
      console.log(data);
    }
  }, [data]);

  return { data, isLoading, error };
};

// Create client profile hooks
export const useCreateBusinessIndividualClientProfile = () => {
  const store = useBusinessProfileState();
  return useMutation({
    mutationFn: (clientProfile: IndividualClientProfileCreate) => createIndividualClientProfile(clientProfile),
    onSuccess: (createdProfile)=>{
      store.addIndividualClientProfile([createdProfile]);
    }
  });
};

export const useCreateBusinessBusinessClientProfile = () => {
  const store = useBusinessProfileState();
  return useMutation({
    mutationFn: (clientProfile: BusinessClientProfileCreate) => createBusinessClientProfile(clientProfile),
    onSuccess: (createdProfile)=>{
      store.addBusinessClientProfile([createdProfile]);
    }
  });
};


// Update client profile hooks
export const useUpdateBusinessIndividualClientProfile = () => {
  const store = useBusinessProfileState();
  return useMutation({
    mutationFn: (clientProfile: IndividualClientProfileUpdate) => updateIndividualClientProfile(clientProfile),
    onSuccess: (updatedProfile)=>{
      store.updateIndividualClientProfile(updatedProfile);
    }
  });
};

export const useUpdateBusinessBusinessClientProfile = () => {
  const store = useBusinessProfileState();
  return useMutation({
    mutationFn: (clientProfile: BusinessClientProfileUpdate) => updateBusinessClientProfile(clientProfile),
    onSuccess: (updatedProfile)=>{
      store.updateBusinessClientProfile(updatedProfile);
    }
  });
};

// Delete client profile hooks
export const useDeleteBusinessIndividualClientProfile = () => {
  const store = useBusinessProfileState();
  return useMutation({
    mutationFn: (clientProfileId: string) => deleteIndividualClientProfile(clientProfileId),
    onSuccess: (deleteResponse)=>{
      store.deleteIndividualClientProfile(deleteResponse.id);
    }
  });
};

export const useDeleteBusinessBusinessClientProfile = () => {
  const store = useBusinessProfileState();
  return useMutation({
    mutationFn: (clientProfileId: string) => deleteBusinessClientProfile(clientProfileId),
    onSuccess: (deleteResponse)=>{
      store.deleteBusinessClientProfile(deleteResponse.id);
    }
  });
};
