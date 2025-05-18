import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '../../server/utils';
import { toast } from 'sonner';
import { useProfileState } from '../../states/useUserProfileState';
import { useCreatePost } from '../../hooks/usePosts';
import { PostCreate } from '@template/core-types';

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState('');
  const { profile } = useProfileState();
  const createPostMutation = useCreatePost();

  const handleSubmit = () => {
    if (!content.trim() || !profile) return;

    const postData: PostCreate = {
      content: content.trim(),
      isPublic: true,
      tags: [],
      clerkUserId: profile.clerkUserId,
    };

    createPostMutation.mutate(postData, {
      onSuccess: () => {
        toast.success('Post created', {
          description: 'Your post has been published successfully.',
        });
        setContent('');
        if (onPostCreated) onPostCreated();
      },
      onError: (error) => {
        toast.error('Failed to create post', {
          description: error instanceof Error ? error.message : 'Please try again later.',
        });
      }
    });
  };

  return (
    <Card className='mb-6 border-border/20 shadow-sm'>
      <CardContent className='pt-6'>
        <div className='flex gap-4'>
          <Avatar className='h-10 w-10 border-2 border-primary/20'>
            <AvatarImage src={profile?.imageUrl} alt={profile?.firstName} />
            <AvatarFallback className="bg-primary/10 text-primary">{getInitials(profile?.firstName ?? '', profile?.lastName ?? '')}</AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <Textarea
              placeholder='What are you thinking about?'
              className='resize-none border-border/60 focus-visible:ring-primary'
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className='flex justify-end border-t border-border/20 pt-4'>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || createPostMutation.isPending}
          className='bg-primary hover:bg-primary/80 text-primary-foreground transition-colors'
        >
          {createPostMutation.isPending ? 'Posting...' : 'Post'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreatePost;