import { z } from 'zod';
import { locationSchema } from './common';
import {
  convertToShortProfile,
  userProfileSimpleSchema,
  UserProfile
} from './user';

  // --- Base Post Schema ---
export const basePostSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  clerkUserId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isPublic: z.boolean().default(true),
  images: z.array(z.string().url()).max(4).optional(),
  location: locationSchema.optional(),
  tags: z.array(z.string()).default([]),
});

// --- Post Creation Schema ---
export const postCreateSchema = basePostSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    scheduledFor: z.date().optional(),
  });

// --- Post Update Schema ---
export const postUpdateSchema = basePostSchema
  .partial()
  .pick({ content: true, isPublic: true, images: true, tags: true, location: true })
  .extend({ id: z.string().uuid() });

// --- Post Reactions Schema ---
export const reactionTypeSchema = z.enum(['like', 'celebrate', 'support', 'insightful', 'curious']);

export const postReactionSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  clerkUserId: z.string(),
  type: reactionTypeSchema,
  createdAt: z.date(),
});

// --- Post Comment Schema ---
export const postCommentSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  clerkUserId: z.string(),
  content: z.string().min(1).max(1000),
  createdAt: z.date(),
  updatedAt: z.date(),
  parentCommentId: z.string().uuid().optional(),
});

export const postCommentCreateSchema = postCommentSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    parentCommentId: z.string().uuid().optional(),
  });

export const postCommentExtendedSchema = postCommentSchema.extend({
  author: userProfileSimpleSchema,
});

// --- Extended Schemas ---
export const postExtendedSchema = basePostSchema.extend({
  author: userProfileSimpleSchema,
  commentCount: z.number().int().nonnegative(),
  reactions: z.array(postReactionSchema).optional(),
  reactionsCount: z.record(z.number().int().nonnegative()),
  userReaction: reactionTypeSchema.optional(),
  comments: z.array(postCommentExtendedSchema).optional(),
});

// --- Type Exports ---
export type Post = z.infer<typeof basePostSchema>;
export type PostCreate = z.infer<typeof postCreateSchema>;
export type PostUpdate = z.infer<typeof postUpdateSchema>;
export type PostExtended = z.infer<typeof postExtendedSchema>;
export type PostReaction = z.infer<typeof postReactionSchema>;
export type PostComment = z.infer<typeof postCommentSchema>;
export type PostCommentExtended = z.infer<typeof postCommentExtendedSchema>;
export type PostCommentCreate = z.infer<typeof postCommentCreateSchema>;
export type ReactionType = z.infer<typeof reactionTypeSchema>;

// Feed options type
export type FeedOptions = {
  limit?: number;
  offset?: number;
  clerkUserId?: string;
  onlyPublic?: boolean;
};

// --- Utility Functions ---
/**
 * Converts a Post to a public-facing PostExtended with author information
 */
export const convertToPublicPost = (
  post: Post,
  author: UserProfile,
  commentCount: number,
  reactionCounts: Record<string, number>,
  userReaction?: ReactionType
): PostExtended => {
  return {
    ...post,
    author: convertToShortProfile(author),
    commentCount,
    reactionsCount: reactionCounts,
    userReaction,
  };
};