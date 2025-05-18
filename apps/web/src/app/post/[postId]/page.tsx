'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { usePost } from '../../../hooks/usePosts';
import PostCard from '../../../components/posts/PostCard';
import CommentSection from '../../../components/posts/CommentsSection';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PostPage() {
  const { postId } = useParams();
  const id = Array.isArray(postId) ? postId[0] : postId;

  // Get the post data
  const { post, isLoading, error } = usePost(id as string);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-500">
          {error instanceof Error ? error.message : 'Post not found'}
        </div>
        <div className="mt-4 text-center">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="flex items-center text-gray-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feed
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading post...</div>}>
        <PostCard post={post} />
      </Suspense>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        <CommentSection postId={id as string} comments={post.comments ?? []} onClose={() => {}} />
      </div>
    </div>
  );
}