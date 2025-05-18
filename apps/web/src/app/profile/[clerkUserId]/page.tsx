"use client";
import { useParams } from "next/navigation";
import { useProfileState } from "../../../states/useUserProfileState";
import ProfileHeader from "../../../components/profile/ProfileHeader";
import { useUser } from "@clerk/nextjs";
import {
  UserProfileExtended,
} from '@template/core-types';
import { Loader2 } from "lucide-react";
import { usePublicUserProfiles } from "../../../hooks/useUserProfile";
import { UserPosts } from '../../../components/posts/UserPosts';

export default function UserPage() {
  const params = useParams<{ clerkUserId: string }>();
  const viewedUserId = params?.clerkUserId;
  const { user } = useUser();

  const isCurrentUser = viewedUserId === user?.id;

  const currentUserProfileState = useProfileState();

  const {
    profiles: publicProfiles,
    isLoading: isLoadingPublicProfile
  } = usePublicUserProfiles(
    isCurrentUser ? [] : [viewedUserId],
    { enabled: !isCurrentUser && !!viewedUserId }
  );

  const displayedProfile = isCurrentUser
    ? currentUserProfileState.profile
    : publicProfiles[0];

  if (!isCurrentUser && isLoadingPublicProfile) {
    return (
      <div className="container mx-auto max-w-4xl py-6 px-4 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="size-8 animate-spin mb-2" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isCurrentUser && !displayedProfile) {
    return (
      <div className="container mx-auto max-w-4xl py-6 px-4">
        <div className="p-8 text-center bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">
            The user profile you're looking for could not be found or is not publicly accessible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-6 px-4">
      {/* Profile header */}
      {displayedProfile && (
        <div className="mb-8">
          <ProfileHeader
            profile={displayedProfile as UserProfileExtended}
          />
        </div>
      )}
      <UserPosts userId={viewedUserId} isCurrentUser={isCurrentUser} />
    </div>
  );
}