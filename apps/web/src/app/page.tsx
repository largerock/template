'use client';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Landing page immediately redirects to dashboard if signed in,
// otherwise it shows a welcome message and the Clerk sign-in dialog is auto-triggered
export default function Home() {
  const {
    isSignedIn, isLoaded
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
    } else {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  // Loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-pulse text-2xl">Loading...</div>
      </div>
    );
  }

  // Fallback content that will be briefly visible before redirect happens
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="text-2xl font-semibold">Redirecting...</div>
    </div>
  );
}
