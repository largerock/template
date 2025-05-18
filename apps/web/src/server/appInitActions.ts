'use server';
import {
  UserProfileExtended,
  PublicUserProfileExtended,
  Interest
} from '@template/core-types';
import {
  getCurrentUserServer,
  getPublicUserProfilesServer
} from './userActions';
import {  getAllInterestsServer } from './taxonomyActions';

export type InitializeAppDataResponse = {
  userProfile: UserProfileExtended;
  interests: Interest[];
  connectionProfiles: PublicUserProfileExtended[];
};

export const initializeAppData = async (): Promise<InitializeAppDataResponse> => {
  try {
    // First load the essential user data
    const [userProfile, interests] = await Promise.all([
      getCurrentUserServer(),
      getAllInterestsServer()
    ]);

    if (!userProfile) throw new Error('User profile not found');

    // Extract all unique user IDs from connections
    const connectionUserIds = new Set<string>();
    // Remove current user from the set (we already have their full profile)
    connectionUserIds.delete(userProfile.clerkUserId);

    // Fetch public profiles for all connection users
    const connectionProfiles = connectionUserIds.size > 0
      ? await getPublicUserProfilesServer(Array.from(connectionUserIds))
      : [];

    return {
      userProfile,
      interests,
      connectionProfiles
    };
  } catch (error) {
    console.error('Error initializing app data:', error);
    throw error;
  }
};