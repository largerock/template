import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useProfileState } from '../../states/useUserProfileState';
import { toast } from 'sonner';
import { getInitials } from '../../server/utils';
import { useAddCommentClient } from '../../hooks/usePosts';
import { useAuth } from '@clerk/nextjs';
import { PostCommentExtended } from '@template/core-types';

interface CommentSectionProps {
  postId: string;
  comments: PostCommentExtended[];
  onClose: () => void;
}

// Component for rendering a single comment
const Comment = ({ comment }: { comment: PostCommentExtended }) => {
  return (
    <div className='flex space-x-3'>
      <Avatar className='h-8 w-8 border border-primary/20'>
        <AvatarImage src={comment.author.imageUrl} alt={comment.author.firstName} />
        <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground">{getInitials(comment.author.firstName, comment.author.lastName)}</AvatarFallback>
      </Avatar>
      <div className='flex-1'>
        <div className='bg-secondary/50 dark:bg-secondary/70 rounded-lg p-3'>
          <div className='flex justify-between'>
            <p className='font-medium text-sm text-foreground'>{comment.author.firstName} {comment.author.lastName}</p>
            <p className='text-xs text-muted-foreground'>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </p>
          </div>
          <p className='text-sm mt-1 text-foreground'>{comment.content}</p>
        </div>
      </div>
    </div>
  );
};

// Main comment section component
const CommentSection = ({ postId, comments = [], onClose }: CommentSectionProps) => {
  const { profile } = useProfileState();
  const { userId } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState<PostCommentExtended[]>(comments);

  // Add comment mutation
  const addCommentMutation = useAddCommentClient();

  const handleSubmitComment = () => {
    if (!newComment.trim() || !userId) return;

    // Create a temporary comment for immediate feedback
    const tempComment: PostCommentExtended = {
      id: `temp-${Date.now()}`,
      postId,
      clerkUserId: userId,
      content: newComment,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: {
        clerkUserId: userId,
        firstName: profile?.firstName || 'You',
        lastName: profile?.lastName || '',
        imageUrl: profile?.imageUrl || '',
      }
    };

    // Add to local state immediately
    setLocalComments(prev => [tempComment, ...prev]);

    // Reset input
    setNewComment('');

    // Save to the server
    addCommentMutation.mutate({
      postId,
      content: newComment,
    }, {
      onSuccess: (newComment) => {
        // Replace the temporary comment with the real one from the server
        setLocalComments(prev =>
          prev.map(comment =>
            comment.id === tempComment.id ? newComment : comment
          )
        );

        toast.success('Comment added', {
          description: 'Your comment has been posted successfully.',
        });
      },
      onError: (error) => {
        // Remove the temporary comment on error
        setLocalComments(prev => prev.filter(comment => comment.id !== tempComment.id));

        toast.error('Failed to add comment', {
          description: error instanceof Error ? error.message : 'Please try again later.',
        });
      }
    });
  };

  // Render the comment list
  const renderComments = () => {
    if (!localComments || localComments.length === 0) {
      return <div className="text-center py-4 text-muted-foreground">No comments yet</div>;
    }

    return localComments.map((comment) => (
      <Comment key={comment.id} comment={comment} />
    ));
  };

  return (
    <div className='bg-card rounded-lg shadow border border-border/20 p-4 w-full'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-medium text-foreground'>Comments ({localComments?.length || 0})</h3>
        <Button variant='ghost' size='sm' className='text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors' onClick={onClose}>
          Close
        </Button>
      </div>

      <div className='space-y-4 max-h-[400px] overflow-y-auto mb-4 pr-1'>
        {renderComments()}
      </div>

      <div className='flex items-center space-x-2'>
        <Avatar className='h-8 w-8 border border-primary/20'>
          <AvatarImage src={profile?.imageUrl} alt={profile?.firstName} />
          <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground">{getInitials(profile?.firstName ?? '', profile?.lastName ?? '')}</AvatarFallback>
        </Avatar>
        <div className='flex-1 flex space-x-2'>
          <Textarea
            placeholder='Write a comment...'
            className='min-h-[40px] flex-1 border-border/60 focus-visible:ring-primary resize-none bg-card text-foreground placeholder:text-muted-foreground'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
          />
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || addCommentMutation.isPending}
            size='sm'
            className='bg-primary hover:bg-primary/80 text-primary-foreground transition-colors'
          >
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;