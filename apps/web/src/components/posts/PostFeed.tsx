import { useState } from 'react';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import { usePostFeed } from '../../hooks/usePosts';
import { FeedOptions } from '@template/core-types';
import { Button } from '../ui/button';
import { RefreshCcw } from 'lucide-react';

interface PostFeedProps {
  initialOptions?: Partial<FeedOptions>;
}

const PostFeed = ({ initialOptions }: PostFeedProps) => {
  const [options] = useState<Partial<FeedOptions>>(initialOptions || { limit: 10 });
  const {
    posts,
    isLoading,
    error,
    refetch,
    isFetching
  } = usePostFeed(options, {
    refetchInterval: 0,
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  const handleCreatePost = () => {
    // Refetch after creating a post to show it in the feed
    refetch();
  };

  // Simple rendering function for post list
  const renderPosts = () => {
    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No posts yet. Be the first to post something!
        </div>
      );
    }

    return posts.map((post) => (
      <PostCard key={post.id} post={post} />
    ));
  };

  return (
    <div className="space-y-6">
      <CreatePost onPostCreated={handleCreatePost} />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">Latest Posts</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1 border-primary text-primary hover:bg-secondary hover:border-primary/80 transition-colors"
        >
          <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Error loading posts. Please try again.
          </div>
        ) : (
          renderPosts()
        )}
      </div>
    </div>
  );
};

export default PostFeed;