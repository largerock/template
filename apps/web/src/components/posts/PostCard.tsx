import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { PostExtended } from "@template/core-types";
import Link from "next/link";
import CommentSection from "./CommentsSection";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { toast } from "sonner";
import { getInitials } from "../../server/utils";
import { useReactToPostClient } from "../../hooks/usePosts";
import { useAuth } from "@clerk/nextjs";

interface PostCardProps {
  post: PostExtended;
}

const PostCard = ({ post }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const { userId } = useAuth();

  // Get reaction functionality
  const { toggleReaction } = useReactToPostClient();

  // Check if the current user has liked this post
  const userReaction = userId ? post.reactions?.find(r => r.clerkUserId === userId) : undefined;
  const isLiked = userReaction?.type === 'like';
  const likeCount = post.reactionsCount?.like || 0;

  const handleLike = () => {
    if (!userId) {
      toast.error("You need to be logged in to like posts");
      return;
    }
    toggleReaction(post.id, 'like');
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast.success("Link copied", {
      description: "Post link copied to clipboard",
    });
  };

  return (
    <Card className="mb-4 border border-border shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Link href={`/profile/${post.author.clerkUserId}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.imageUrl} alt={post.author.firstName} />
              <AvatarFallback className="bg-primary/10 text-primary">{getInitials(post.author.firstName, post.author.lastName)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="space-y-1">
            <Link href={`/profile/${post.author.clerkUserId}`} className="font-medium hover:underline text-foreground">
              {post.author.firstName} {post.author.lastName}
            </Link>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-foreground">{post.content}</p>
      </CardContent>
      <CardFooter className="pt-3">
        <div className="flex w-full justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 ${isLiked ? "text-primary" : "text-muted-foreground"} hover:bg-secondary transition-colors`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-primary" : "fill-none"}`} />
            <span>{likeCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.commentCount ?? 0}</span>
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Share className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 bg-card">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-foreground">Share this post</h4>
                <div className="flex flex-col space-y-2">
                  <p className="text-xs text-muted-foreground break-all">
                    {`${window.location.origin}/post/${post.id}`}
                  </p>
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="sm"
                    className="text-primary hover:bg-secondary transition-colors"
                  >
                    Copy link
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardFooter>

      {showComments && (
        <div className="px-6 pb-4">
          <CommentSection
            postId={post.id}
            comments={post.comments ?? []}
            onClose={() => setShowComments(false)}
          />
        </div>
      )}
    </Card>
  );
};

export default PostCard;