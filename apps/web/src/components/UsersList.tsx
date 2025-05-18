'use client';

import { PublicUserProfileExtended } from '@template/core-types';
import { UserProfileCard } from './cards/UserProfileCard';
import { Alert, AlertTitle } from './ui/alert';
interface UsersListProps {
  users: PublicUserProfileExtended[];
  isLoading: boolean;
  hasSearched: boolean;
}

export function UsersList({ users, isLoading, hasSearched }: UsersListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="spinner w-8 h-8 mx-auto border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading results...</p>
      </div>
    );
  }

  if (users.length === 0 && hasSearched) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Alert>
          <AlertTitle>No users found matching your search.</AlertTitle>
        </Alert>
      </div>
    );
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Search Results
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div key={user.clerkUserId} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <UserProfileCard profile={user} />
          </div>
        ))}
      </div>
    </div>
  );
}