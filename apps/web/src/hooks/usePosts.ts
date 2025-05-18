'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PostExtended,
  PostCommentExtended,
  FeedOptions,
  ReactionType
} from '@template/core-types';
import {
  getPostByIdServer,
  getPostFeedServer,
  getUserPostsServer,
  createPostServer,
  updatePostServer,
  deletePostServer,
  getPostReactionsServer,
  addReactionServer,
  removeReactionServer,
  getPostCommentsServer,
  addCommentServer,
  updateCommentServer,
  deleteCommentServer
} from '../server/postsActions';
import {
  likePost,
  unlikePost,
  deletePost,
  addComment,
  deleteComment,
  updateComment
} from '../server/apiClientActions';
import { usePostsState } from '../states/usePostsState';
import { useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

// Query keys for React Query
export const postKeys = {
  all: ['posts'] as const,
  feeds: () => [...postKeys.all, 'feed'] as const,
  feed: (options: Partial<FeedOptions>) => [...postKeys.feeds(), JSON.stringify(options)] as const,
  byId: (id: string) => [...postKeys.all, 'by-id', id] as const,
  byUser: (userId: string) => [...postKeys.all, 'by-user', userId] as const,
  comments: (postId: string) => [...postKeys.byId(postId), 'comments'] as const,
  reactions: (postId: string) => [...postKeys.byId(postId), 'reactions'] as const,
};

// Hook for getting a post by ID
export const usePost = (postId: string, options = {}) => {
  const postsState = usePostsState();
  const cachedPost = postsState.posts[postId];

  const query = useQuery({
    queryKey: postKeys.byId(postId),
    queryFn: () => getPostByIdServer(postId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: Boolean(postId),
    ...options,
  });

  useEffect(() => {
    if (query.data) {
      postsState.setPost(query.data);
    }
  }, [query.data, postsState]);

  return {
    ...query,
    post: cachedPost || query.data,
  };
};

// Hook for getting the posts feed
export const usePostFeed = (options: Partial<FeedOptions> = {}, queryOptions = {}) => {
  const postsState = usePostsState();

  const query = useQuery({
    queryKey: postKeys.feed(options),
    queryFn: () => getPostFeedServer(options),
    staleTime: 1000 * 60 * 1, // 1 minute
    ...queryOptions,
  });

  useEffect(() => {
    // Only update state if we have successful data and it's not empty
    if (query.data && query.isSuccess && query.data.length > 0) {
      // Get existing feed posts for comparison
      const feedPosts = postsState.feedPostIds.map(id => postsState.posts[id]).filter(Boolean);

      // Check if the data has significantly changed
      if (feedPosts.length !== query.data.length) {
        // Lengths are different, so update state
        postsState.setFeedPosts(query.data);
      } else {
        // Check if any posts have changed by comparing IDs
        const existingIds = new Set(feedPosts.map(post => post.id));
        const newDataIds = query.data.map(post => post.id);

        // Check if any new post ID is not in the existing set
        const needsUpdate = newDataIds.some(id => !existingIds.has(id));

        if (needsUpdate) {
          postsState.setFeedPosts(query.data);
        }
      }
    }
  }, [query.data, query.isSuccess, postsState]);

  // Get the cached feed posts
  const feedPosts = postsState.feedPostIds.map(id => postsState.posts[id]).filter(Boolean) as PostExtended[];

  return {
    ...query,
    posts: (feedPosts.length > 0 ? feedPosts : query.data || []) as PostExtended[],
  };
};

// Hook for getting posts by user
export const useUserPosts = (userId: string, options = {}) => {
  const postsState = usePostsState();
  const userPostIds = postsState.userPosts[userId] || [];
  const cachedPosts = userPostIds.map(id => postsState.posts[id]).filter(Boolean);

  const query = useQuery({
    queryKey: postKeys.byUser(userId),
    queryFn: () => getUserPostsServer(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: Boolean(userId),
    ...options,
  });

  useEffect(() => {
    // Only update if data exists, query was successful, and there's potentially new data
    if (query.data && query.isSuccess) {
      // Get current user posts data
      const currentPosts = userPostIds.map(id => postsState.posts[id]).filter(Boolean);

      // Only update if the number of posts has changed
      if (currentPosts.length !== query.data.length) {
        postsState.setUserPosts(userId, query.data);
      } else {
        // Check if any post is not in the current set
        const currentIds = new Set(currentPosts.map(post => post.id));

        // Check if any new post ID is not in the current set
        const needsUpdate = query.data.some(post => !currentIds.has(post.id));

        if (needsUpdate) {
          postsState.setUserPosts(userId, query.data);
        }
      }
    }
  }, [query.data, query.isSuccess, userId, postsState, userPostIds]);

  return {
    ...query,
    posts: cachedPosts.length > 0 ? cachedPosts : query.data || [],
  };
};

// Hook for creating a post
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const postsState = usePostsState();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: createPostServer,
    onSuccess: (newPost) => {
      // Update state with the new post
      postsState.setPost(newPost as PostExtended);

      // Add to feed if available
      postsState.addFeedPost(newPost as PostExtended);

      // Add to user posts if it's the current user
      if (userId && newPost.clerkUserId === userId) {
        postsState.addUserPost(userId, newPost as PostExtended);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: postKeys.byUser(userId) });
      }
    },
  });
};

// Hook for updating a post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  const postsState = usePostsState();

  return useMutation({
    mutationFn: updatePostServer,
    onSuccess: (updatedPost) => {
      // Update state with the updated post
      postsState.setPost(updatedPost as PostExtended);

      // Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: postKeys.byId(updatedPost.id) });
    },
  });
};

// Hook for deleting a post
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const postsState = usePostsState();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: deletePostServer,
    onSuccess: (_, postId) => {
      // Remove from feed
      postsState.removeFeedPost(postId);

      // Remove from user posts if current user
      if (userId) {
        postsState.removeUserPost(userId, postId);
      }

      // Remove the post itself
      postsState.removePost(postId);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: postKeys.byUser(userId) });
      }
    },
  });
};

// Client-side version for immediate UI feedback
export const useDeletePostClient = () => {
  const queryClient = useQueryClient();
  const postsState = usePostsState();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: deletePost,
    onMutate: async (postId) => {
      // Remove locally first for instant feedback
      postsState.removeFeedPost(postId);
      if (userId) {
        postsState.removeUserPost(userId, postId);
      }
      return { postId };
    },
    onSuccess: (_, postId) => {
      // Remove the post itself
      postsState.removePost(postId);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: postKeys.byUser(userId) });
      }
    },
  });
};

// Hook for getting post comments
export const usePostComments = (postId: string, options = {}) => {
  const postsState = usePostsState();
  const cachedComments = postsState.commentsByPost[postId] || [];

  const query = useQuery({
    queryKey: postKeys.comments(postId),
    queryFn: () => getPostCommentsServer(postId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: Boolean(postId),
    ...options,
  });

  useEffect(() => {
    // Only update if data exists and query was successful
    if (query.data && query.isSuccess) {
      // Get current comments data
      const currentComments = postsState.commentsByPost[postId] || [];

      // Only update if comments length has changed - the actual deep comparison
      // is handled inside the Zustand store's setPostComments function
      if (currentComments.length !== query.data.length) {
        postsState.setPostComments(postId, query.data);
      }
    }
  }, [query.data, query.isSuccess, postId, postsState]);

  return {
    ...query,
    comments: cachedComments.length > 0 ? cachedComments : query.data || [] as PostCommentExtended[],
  };
};

// Hook for adding a comment
export const useAddComment = () => {
  const queryClient = useQueryClient();
  const postsState = usePostsState();

  return useMutation({
    mutationFn: ({ postId, content, parentCommentId }: { postId: string; content: string; parentCommentId?: string }) =>
      addCommentServer(postId, content, parentCommentId),
    onSuccess: (newComment, { postId }) => {
      // Add to local state
      postsState.addPostComment(postId, newComment);

      // Invalidate comments query
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
  });
};

// Client-side version for immediate UI feedback
export const useAddCommentClient = () => {
  const queryClient = useQueryClient();
  const postsState = usePostsState();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: ({ postId, content, parentCommentId }: {
      postId: string;
      content: string;
      parentCommentId?: string;
    }) => addComment(postId, content, parentCommentId),
    onMutate: async ({ postId, content, parentCommentId }) => {
      // Create an optimistic comment
      if (!userId) return { postId };

      // Create a temporary ID
      const tempId = `temp-${Date.now()}`;

      const optimisticComment: PostCommentExtended = {
        id: tempId,
        postId,
        clerkUserId: userId,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        parentCommentId,
        author: {
          clerkUserId: userId,
          firstName: "You", // This will be updated when the real data comes in
          lastName: "",
          imageUrl: "",
        }
      };

      // Add to local state
      postsState.addPostComment(postId, optimisticComment);

      return { postId, tempId };
    },
    onSuccess: (newComment, { postId }) => {
      // Update with real data
      postsState.addPostComment(postId, newComment);

      // Invalidate comments query
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
    onError: (_, { postId }, context) => {
      // Remove optimistic comment on error
      if (context?.tempId) {
        postsState.removePostComment(postId, context.tempId);
      }
    },
  });
};

// Hook for updating a comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  const postsState = usePostsState();

  return useMutation({
    mutationFn: ({ commentId, content, postId }: { commentId: string; content: string; postId: string }) =>
      updateCommentServer(commentId, content, postId),
    onSuccess: (updatedComment, { postId }) => {
      // Update in local state
      postsState.updatePostComment(postId, updatedComment);

      // Invalidate comments query
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
  });
};

// Client-side version for immediate UI feedback
export const useUpdateCommentClient = () => {
  const queryClient = useQueryClient();
  const postsState = usePostsState();

  return useMutation({
    mutationFn: ({ commentId, content, postId }: { commentId: string; content: string; postId: string }) =>
      updateComment(commentId, content, postId),
    onMutate: async ({ commentId, content, postId }) => {
      // Get the existing comment
      const comments = postsState.commentsByPost[postId] || [];
      const existingComment = comments.find(c => c.id === commentId);

      if (!existingComment) return { postId };

      // Create an optimistic updated comment
      const optimisticComment = {
        ...existingComment,
        content,
        updatedAt: new Date()
      };

      // Update in local state
      postsState.updatePostComment(postId, optimisticComment);

      return { postId, commentId, previousComment: existingComment };
    },
    onSuccess: (updatedComment, { postId }) => {
      // Invalidate comments query
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
    onError: (_, { postId }, context) => {
      // Restore previous comment on error
      if (context?.previousComment) {
        postsState.updatePostComment(postId, context.previousComment);
      }
    },
  });
};

// Hook for deleting a comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const postsState = usePostsState();

  return useMutation({
    mutationFn: ({ commentId, postId }: { commentId: string; postId: string }) =>
      deleteCommentServer(commentId, postId),
    onSuccess: (_, { commentId, postId }) => {
      // Remove from local state
      postsState.removePostComment(postId, commentId);

      // Invalidate comments query
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
  });
};

// Client-side version for immediate UI feedback
export const useDeleteCommentClient = () => {
  const queryClient = useQueryClient();
  const postsState = usePostsState();

  return useMutation({
    mutationFn: ({ commentId, postId }: { commentId: string; postId: string }) =>
      deleteComment(commentId, postId),
    onMutate: async ({ commentId, postId }) => {
      // Get the existing comment
      const comments = postsState.commentsByPost[postId] || [];
      const existingComment = comments.find(c => c.id === commentId);

      // Remove from local state
      postsState.removePostComment(postId, commentId);

      return { postId, commentId, previousComment: existingComment };
    },
    onSuccess: (_, { postId }) => {
      // Invalidate comments query
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
    onError: (_, { postId }, context) => {
      // Restore comment on error
      if (context?.previousComment) {
        postsState.addPostComment(postId, context.previousComment);
      }
    },
  });
};

// Hook for getting post reactions
export const usePostReactions = (postId: string, options = {}) => {
  const postsState = usePostsState();
  const cachedReactions = postsState.reactionsByPost[postId] || [];

  const query = useQuery({
    queryKey: postKeys.reactions(postId),
    queryFn: () => getPostReactionsServer(postId),
    staleTime: 1000 * 60 * 10, // 10 minutes - reactions don't change that often
    enabled: Boolean(postId),
    ...options,
  });

  useEffect(() => {
    // Only update if data exists and query was successful
    if (query.data && query.isSuccess) {
      // Get current reactions data
      const currentReactions = postsState.reactionsByPost[postId] || [];

      // Only update if reactions length has changed - the actual deep comparison
      // is handled inside the Zustand store's setPostReactions function
      if (currentReactions.length !== query.data.length) {
        postsState.setPostReactions(postId, query.data);
      }
    }
  }, [query.data, query.isSuccess, postId, postsState]);

  // Return cached data if available, otherwise return query data
  return {
    ...query,
    reactions: cachedReactions.length > 0 ? cachedReactions : query.data || [],
  };
};

// Hook for adding a reaction
export const useAddReaction = () => {
  const queryClient = useQueryClient();
  const postsState = usePostsState();

  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) =>
      addReactionServer(postId, type),
    onSuccess: (newReaction, { postId, type }) => {
      // Update user reaction in state
      postsState.setUserReaction(postId, type as ReactionType);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: postKeys.reactions(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.byId(postId) });
    },
  });
};

// Client-side version for immediate UI feedback
export const useReactToPostClient = () => {
  const queryClient = useQueryClient();
  const postsState = usePostsState();

  const addReactionMutation = useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) =>
      likePost(postId, type),
    onMutate: async ({ postId, type }) => {
      // Prevent unnecessary state updates
      const currentReaction = postsState.userReactions[postId];
      if (currentReaction !== type) {
        // Update user reaction in state immediately
        postsState.setUserReaction(postId, type as ReactionType);
      }
      return { postId, type, previousReaction: currentReaction };
    },
    onSuccess: (_, { postId }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: postKeys.reactions(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.byId(postId) });
    },
    onError: (_, { postId }, context) => {
      // Restore previous reaction on error
      if (context?.previousReaction) {
        postsState.setUserReaction(postId, context.previousReaction as ReactionType);
      } else {
        postsState.setUserReaction(postId, undefined);
      }
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: (postId: string) =>
      unlikePost(postId),
    onMutate: async (postId) => {
      // Prevent unnecessary state updates
      const currentReaction = postsState.userReactions[postId];
      if (currentReaction) {
        // Remove user reaction in state immediately
        postsState.setUserReaction(postId, undefined);
      }
      return { postId, previousReaction: currentReaction };
    },
    onSuccess: (_, postId) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: postKeys.reactions(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.byId(postId) });
    },
    onError: (_, postId, context) => {
      // Restore previous reaction on error
      if (context?.previousReaction) {
        postsState.setUserReaction(postId, context.previousReaction as ReactionType);
      }
    },
  });

  // Provide a convenient interface for toggling reactions
  const toggleReaction = useCallback((postId: string, type: ReactionType) => {
    const currentReaction = postsState.userReactions[postId];

    if (currentReaction === type) {
      // If same reaction, remove it
      removeReactionMutation.mutate(postId);
    } else {
      // If different or none, add new reaction
      addReactionMutation.mutate({ postId, type });
    }
  }, [postsState.userReactions, addReactionMutation, removeReactionMutation]);

  return {
    addReaction: addReactionMutation,
    removeReaction: removeReactionMutation,
    toggleReaction,
    currentReactions: postsState.userReactions,
  };
};

// Hook for removing a reaction
export const useRemoveReaction = () => {
  const queryClient = useQueryClient();
  const postsState = usePostsState();

  return useMutation({
    mutationFn: removeReactionServer,
    onSuccess: (_, postId) => {
      // Remove user reaction in state
      postsState.setUserReaction(postId, undefined);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: postKeys.reactions(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.byId(postId) });
    },
  });
};