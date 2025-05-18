'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the error page with not_found code
    router.replace('/error?code=page_not_found');
  }, [router]);

  // Return a simple loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Redirecting...</h1>
        <p className="text-muted-foreground">Please wait</p>
      </div>
    </div>
  );
}