'use client';

import { Suspense } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AppLoader } from '../components/app-states/AppLoader';
import { useAppInit } from '../hooks/appInit';
interface AppInitializerProps {
  children: React.ReactNode;
}

export default function AppInitializer({ children }: AppInitializerProps) {
  const { isLoaded, isSignedIn } = useAuth();

  const {
    appInitQuery
  } = useAppInit({
    enabled: isLoaded && isSignedIn,
    refetchOnWindowFocus: false
  });

  // Handle errors
  if (appInitQuery.isError) {
    console.error('❌ AppInitializer', 'Error loading user profile:', appInitQuery);
  }

  return (
    <Suspense fallback={<AppLoader />}>
      <>{children}</>
    </Suspense>
  );
}