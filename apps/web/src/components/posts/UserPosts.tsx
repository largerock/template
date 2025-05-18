import { useUserPosts } from "../../hooks/usePosts";
import { Button } from "../ui/button";
import { RefreshCcw } from "lucide-react";
import PostCard from './PostCard';

interface UserPostsProps {
  userId: string;
  isCurrentUser: boolean;
}

// UserPosts component
export const UserPosts = ({ userId, isCurrentUser }: UserPostsProps) => {
  const {
    posts,
    isLoading,
    error,
    refetch,
    isFetching
  } = useUserPosts(userId, {
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 0, // Disable automatic refetching
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: true, // Fetch once on mount
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading posts. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Posts</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1"
        >
          <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {(!posts || posts.length === 0) ? (
        <div className="text-center py-8 text-gray-500">
          {isCurrentUser ? "You haven't posted anything yet." : "This user hasn't posted anything yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};