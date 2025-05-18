'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-destructive" />
            <CardTitle className="text-xl">An error occurred</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            We encountered an error while processing your request.
          </p>
          <div className="text-sm bg-muted/50 p-3 rounded-md">
            <span className="font-mono">Error code: {code || 'unknown'}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="default" className="w-full">
            <Link href="/dashboard">
              Return to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function ErrorSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<ErrorSkeleton />}>
      <ErrorContent />
    </Suspense>
  );
}
