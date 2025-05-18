'use server';

import {
  Post,
  PostCreate,
  PostUpdate,
  PostExtended,
  PostReaction,
  PostCommentExtended,
  FeedOptions,
  DeleteResponse
} from '@template/core-types';
import { cache } from 'react';
import { serverRequest } from './serverRequest';

// Post endpoints
export const getPostByIdServer = cache(
  async (postId: string): Promise<PostExtended> => {
    return serverRequest<PostExtended>(`api/posts/${postId}`);
  }
);

export const getPostFeedServer = cache(
  async (options?: Partial<FeedOptions>): Promise<PostExtended[]> => {
    const queryParams = new URLSearchParams();

    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());
    if (options?.onlyPublic !== undefined) queryParams.append('onlyPublic', options.onlyPublic.toString());

    const queryString = queryParams.toString();
    const endpoint = `api/posts/feed${queryString ? `?${queryString}` : ''}`;

    return serverRequest<PostExtended[]>(endpoint);
  }
);

export const getUserPostsServer = cache(
  async (userId: string): Promise<PostExtended[]> => {
    return serverRequest<PostExtended[]>(`api/posts/user/${userId}`);
  }
);

export const createPostServer = async (
  postData: PostCreate
): Promise<Post> => {
  return serverRequest<Post>('api/posts', 'POST', postData);
};

export const updatePostServer = async (
  postData: PostUpdate
): Promise<Post> => {
  return serverRequest<Post>(`api/posts/${postData.id}`, 'PUT', postData);
};

export const deletePostServer = async (
  postId: string
): Promise<DeleteResponse> => {
  return serverRequest<DeleteResponse>(`api/posts/${postId}`, 'DELETE');
};

// Reaction endpoints
export const getPostReactionsServer = cache(
  async (postId: string): Promise<PostReaction[]> => {
    return serverRequest<PostReaction[]>(`api/posts/${postId}/reactions`);
  }
);

export const addReactionServer = async (
  postId: string,
  type: string
): Promise<PostReaction> => {
  return serverRequest<PostReaction>(`api/posts/${postId}/reactions`, 'POST', { type });
};

export const removeReactionServer = async (
  postId: string
): Promise<DeleteResponse> => {
  return serverRequest<DeleteResponse>(`api/posts/${postId}/reactions`, 'DELETE');
};

// Comment endpoints
export const getPostCommentsServer = cache(
  async (postId: string): Promise<PostCommentExtended[]> => {
    return serverRequest<PostCommentExtended[]>(`api/posts/${postId}/comments`);
  }
);

export const addCommentServer = async (
  postId: string,
  content: string,
  parentCommentId?: string
): Promise<PostCommentExtended> => {
  return serverRequest<PostCommentExtended>(
    `api/posts/${postId}/comments`,
    'POST',
    { content, parentCommentId }
  );
};

export const updateCommentServer = async (
  commentId: string,
  content: string,
  postId: string
): Promise<PostCommentExtended> => {
  return serverRequest<PostCommentExtended>(
    `api/posts/comments/${commentId}`,
    'PUT',
    { content, postId }
  );
};

export const deleteCommentServer = async (
  commentId: string,
  postId: string
): Promise<DeleteResponse> => {
  return serverRequest<DeleteResponse>(
    `api/posts/comments/${commentId}`,
    'DELETE',
    { postId }
  );
};