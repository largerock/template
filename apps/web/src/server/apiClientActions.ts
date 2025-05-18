'use client';
import {
  PostCommentExtended,
  PublicUserProfileExtended,
  DeleteResponse,
} from '@template/core-types';
import CONFIG, { Environment } from "@template/global-config";
import { useAppState } from "../states/useAppInitState";

// Use NEXT_PUBLIC_ prefixed env var and provide fallback to 'development'
const currentEnv = (typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_ENVIRONMENT
  : process.env.ENVIRONMENT) as Environment || 'development';

// Base API request implementation for server actions
export async function clientRequest<T>(
  endpoint: string,
  method = 'GET',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
  userId?: string,
): Promise<T> {
  let fullUrl = '';
  try {
    const appState = useAppState.getState();
    const sessionToken = appState.token || undefined;

    if (!sessionToken) {
      console.error('❌ clientRequest', 'Unauthorized: No session token available');
      throw new Error('Unauthorized: No session token available');
    }

    // Create full URL
    const baseUrl = CONFIG[currentEnv].API_URL.endsWith('/') ?
      CONFIG[currentEnv].API_URL
      : `${CONFIG[currentEnv].API_URL}/`;
    fullUrl = `${baseUrl}${endpoint}`;

    // Configure fetch options
    const fetchConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
        // If userId is provided, add it to the headers for user identification
        ...(userId ? { 'userId': userId } : {})
      },
      // Disable Next.js cache for these requests
      cache: 'no-store',
    };

    // Add body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && data) {
      fetchConfig.body = JSON.stringify(data);
    }

    // Make the request
    const response = await fetch(fullUrl, fetchConfig);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized access');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Return undefined for 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse the response
    const text = await response.text();

    // Return empty object for empty responses
    if (!text || text.trim() === '') {
      return {} as T;
    }
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('❌ clientRequest', 'Server API request failed:', error, fullUrl);
    throw error;
  }
}


// --- Post Actions ---
export const likePost = async (postId: string, type: string) => {
  return clientRequest(`api/posts/${postId}/reactions`, 'POST', { type });
}

export const unlikePost = async (postId: string) => {
  return clientRequest(`api/posts/${postId}/reactions`, 'DELETE');
}

export const deletePost = async (postId: string) => {
  return clientRequest<DeleteResponse>(`api/posts/${postId}`, 'DELETE');
}

// --- Comment Actions ---
export const addComment = async (postId: string, content: string, parentCommentId?: string) => {
  return clientRequest<PostCommentExtended>(`api/posts/${postId}/comments`, 'POST', { content, parentCommentId });
}

export const deleteComment = async (commentId: string, postId: string) => {
  return clientRequest<DeleteResponse>(`api/posts/comments/${commentId}`, 'DELETE', { postId });
}

export const updateComment = async (commentId: string, content: string, postId: string) => {
  return clientRequest<PostCommentExtended>(`api/posts/comments/${commentId}`, 'PUT', { content, postId });
}

// --- User Profile Actions ---
// change to GET, what was I thinking
export const getPublicUserProfiles = async (userIds: string[]): Promise<PublicUserProfileExtended[]> => {
  return clientRequest<PublicUserProfileExtended[]>('api/users/public-profiles', 'POST', { userIds });
};
