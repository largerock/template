'use server';

import {
  UserProfileExtended,
  UserProfileUpdate,
  PublicUserProfileExtended,
} from '@template/core-types';
import { cache } from 'react';
import { serverRequest } from './serverRequest';


// User profile endpoints
export const getCurrentUserServer = cache(
  async (): Promise<UserProfileExtended> => {
    return serverRequest<UserProfileExtended>('api/users/me');
  }
);

export const getUserByIdServer = cache(
  async (userId: string): Promise<UserProfileExtended> => {
    return serverRequest<UserProfileExtended>(`api/users/${userId}`);
  }
);

export const updateUserProfileServer = async (
  userData: UserProfileUpdate
): Promise<UserProfileExtended> => {
  return serverRequest<UserProfileExtended>('api/users/me', 'PUT', userData);
};

// Public profile endpoints
export const getPublicUserProfilesServer = async (
  userIds: string[]
): Promise<PublicUserProfileExtended[]> => {
  return serverRequest<PublicUserProfileExtended[]>('api/users/public-profiles', 'POST', { userIds });
};

// Admin endpoints
export const getAllUsersServer = async (
  limit = 50,
  offset = 0
): Promise<{ users: PublicUserProfileExtended[], total: number }> => {
  return serverRequest<{ users: PublicUserProfileExtended[], total: number }>(
    `api/users/all?limit=${limit}&offset=${offset}`
  );
};