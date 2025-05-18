'use client';

import { useState } from 'react';
import { useAllUsers } from '../../../hooks/useUserProfile';
import { Card, CardContent, CardHeader, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Pagination } from '../../../components/ui/pagination';
import { Skeleton } from '../../../components/ui/skeleton';
import AdminUserCard from '../../../components/cards/AdminUserCard';

// Loading skeleton for user cards
const UserCardSkeleton = () => (
  <Card>
    <CardHeader className="p-4 flex flex-row items-center space-x-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </CardHeader>
    <CardContent className="p-4">
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i}>
            <Skeleton className="h-4 w-1/4 mb-1" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </CardContent>
    <CardFooter className="p-3 flex justify-between">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-8 w-28" />
    </CardFooter>
  </Card>
);

export default function AdminPage() {
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { users, total, isLoading, error, refetch } = useAllUsers(
    pageSize,
    (page - 1) * pageSize
  );

  const totalPages = Math.ceil((total || 0) / pageSize);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <Button onClick={() => refetch()}>Refresh Users</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <h3 className="text-xl font-semibold text-red-500 mb-2">Error loading users</h3>
          <p className="text-gray-600 mb-4">{(error as Error)?.message || 'An unknown error occurred'}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No users found</h3>
          <p className="text-gray-600">There are no users registered in the system.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map(user => (
              <AdminUserCard key={user.clerkUserId} user={user} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </main>
  );
}
