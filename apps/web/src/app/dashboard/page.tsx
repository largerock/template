'use client';

import { Suspense } from 'react';
import PostFeed from '../../components/posts/PostFeed';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8 text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading posts...</div>}>
            <PostFeed />
          </Suspense>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border/10">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/profile/me" className="text-primary hover:underline">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}