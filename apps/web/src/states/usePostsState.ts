import { create } from "zustand";
import {
  PostExtended,
  PostReaction,
  PostCommentExtended,
  ReactionType
} from "@template/core-types";

interface PostsState {
  // All posts cache by ID
  posts: Record<string, PostExtended>;
  // Feed posts (ordered array of IDs)
  feedPostIds: string[];
  // Posts by user
  userPosts: Record<string, string[]>;
  // Comments by post ID
  commentsByPost: Record<string, PostCommentExtended[]>;
  // Reactions by post ID
  reactionsByPost: Record<string, PostReaction[]>;
  // User reactions for quick reference (postId -> reaction type)
  userReactions: Record<string, ReactionType>;

  // Actions
  setPosts: (posts: PostExtended[]) => void;
  setPost: (post: PostExtended) => void;
  removePost: (postId: string) => void;

  setFeedPosts: (posts: PostExtended[]) => void;
  addFeedPost: (post: PostExtended) => void;
  removeFeedPost: (postId: string) => void;

  setUserPosts: (userId: string, posts: PostExtended[]) => void;
  addUserPost: (userId: string, post: PostExtended) => void;
  removeUserPost: (userId: string, postId: string) => void;

  setPostComments: (postId: string, comments: PostCommentExtended[]) => void;
  addPostComment: (postId: string, comment: PostCommentExtended) => void;
  updatePostComment: (postId: string, comment: PostCommentExtended) => void;
  removePostComment: (postId: string, commentId: string) => void;

  setPostReactions: (postId: string, reactions: PostReaction[]) => void;
  setUserReaction: (postId: string, reaction: ReactionType | undefined) => void;
}

export const usePostsState = create<PostsState>((set) => ({
  posts: {},
  feedPostIds: [],
  userPosts: {},
  commentsByPost: {},
  reactionsByPost: {},
  userReactions: {},

  // Posts actions
  setPosts: (posts) => {
    set((state) => {
      const updatedPosts = { ...state.posts };

      posts.forEach((post) => {
        updatedPosts[post.id] = post;
      });

      return { posts: updatedPosts };
    });
  },

  setPost: (post) => {
    set((state) => ({
      posts: {
        ...state.posts,
        [post.id]: post
      }
    }));
  },

  removePost: (postId) => {
    set((state) => {
      const updatedPosts = { ...state.posts };
      delete updatedPosts[postId];

      return { posts: updatedPosts };
    });
  },

  // Feed actions
  setFeedPosts: (posts) => {
    set((state) => {
      // Skip update if the data hasn't changed
      if (posts.length === 0) return state;

      // Check if the feed posts are already the same
      if (state.feedPostIds.length === posts.length) {
        const allPostsMatch = posts.every(post =>
          state.posts[post.id] &&
          state.feedPostIds.includes(post.id)
        );
        if (allPostsMatch) return state;
      }

      const updatedPosts = { ...state.posts };
      const feedPostIds: string[] = [];

      posts.forEach((post) => {
        updatedPosts[post.id] = post;
        feedPostIds.push(post.id);
      });

      return {
        posts: updatedPosts,
        feedPostIds
      };
    });
  },

  addFeedPost: (post) => {
    set((state) => ({
      posts: {
        ...state.posts,
        [post.id]: post
      },
      feedPostIds: [post.id, ...state.feedPostIds]
    }));
  },

  removeFeedPost: (postId) => {
    set((state) => ({
      feedPostIds: state.feedPostIds.filter(id => id !== postId)
    }));
  },

  // User posts actions
  setUserPosts: (userId, posts) => {
    set((state) => {
      // Skip update if nothing changed or posts array is empty
      if (posts.length === 0) return state;

      // Check if existing user posts are the same as the new ones
      const existingPostIds = state.userPosts[userId] || [];

      // If lengths are different, definitely update
      if (existingPostIds.length !== posts.length) {
        const updatedPosts = { ...state.posts };
        const userPostIds: string[] = [];

        posts.forEach((post) => {
          updatedPosts[post.id] = post;
          userPostIds.push(post.id);
        });

        return {
          posts: updatedPosts,
          userPosts: {
            ...state.userPosts,
            [userId]: userPostIds
          }
        };
      }

      // If same length, check if the posts are the same
      // Sort both arrays to ensure consistent comparison
      const sortedExistingIds = [...existingPostIds].sort();
      const sortedNewIds = posts.map(post => post.id).sort();

      // Check if arrays are the same
      const allIdsMatch = sortedExistingIds.every(
        (id, index) => id === sortedNewIds[index]
      );

      if (allIdsMatch) {
        // No changes, return current state
        return state;
      }

      // If we reach here, the posts are different and need to be updated
      const updatedPosts = { ...state.posts };
      const userPostIds: string[] = [];

      posts.forEach((post) => {
        updatedPosts[post.id] = post;
        userPostIds.push(post.id);
      });

      return {
        posts: updatedPosts,
        userPosts: {
          ...state.userPosts,
          [userId]: userPostIds
        }
      };
    });
  },

  addUserPost: (userId, post) => {
    set((state) => {
      const userPostIds = [...(state.userPosts[userId] || [])];
      if (!userPostIds.includes(post.id)) {
        userPostIds.unshift(post.id);
      }

      return {
        posts: {
          ...state.posts,
          [post.id]: post
        },
        userPosts: {
          ...state.userPosts,
          [userId]: userPostIds
        }
      };
    });
  },

  removeUserPost: (userId, postId) => {
    set((state) => {
      if (!state.userPosts[userId]) {
        return state;
      }

      return {
        userPosts: {
          ...state.userPosts,
          [userId]: state.userPosts[userId].filter(id => id !== postId)
        }
      };
    });
  },

  // Comments actions
  setPostComments: (postId, comments) => {
    set((state) => {
      // Skip update if nothing changed
      const existingComments = state.commentsByPost[postId] || [];

      // If lengths are different, definitely update
      if (existingComments.length !== comments.length) {
        return {
          commentsByPost: {
            ...state.commentsByPost,
            [postId]: comments
          }
        };
      }

      // If same length, check for deep equality
      // Simple check: compare stringified objects for changes
      if (JSON.stringify(existingComments) === JSON.stringify(comments)) {
        // No changes, skip update
        return state;
      }

      // If we got here, there are changes
      return {
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: comments
        }
      };
    });
  },

  addPostComment: (postId, comment) => {
    set((state) => {
      const existingComments = state.commentsByPost[postId] || [];

      // Only add if not already present
      if (!existingComments.some(c => c.id === comment.id)) {
        return {
          commentsByPost: {
            ...state.commentsByPost,
            [postId]: [...existingComments, comment]
          }
        };
      }

      return state;
    });
  },

  updatePostComment: (postId, comment) => {
    set((state) => {
      const existingComments = state.commentsByPost[postId] || [];

      return {
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: existingComments.map(c =>
            c.id === comment.id ? comment : c
          )
        }
      };
    });
  },

  removePostComment: (postId, commentId) => {
    set((state) => {
      const existingComments = state.commentsByPost[postId] || [];

      return {
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: existingComments.filter(c => c.id !== commentId)
        }
      };
    });
  },

  // Reactions actions
  setPostReactions: (postId, reactions) => {
    set((state) => {
      // Skip update if nothing changed
      const existingReactions = state.reactionsByPost[postId] || [];

      // If lengths are different, definitely update
      if (existingReactions.length !== reactions.length) {
        return {
          reactionsByPost: {
            ...state.reactionsByPost,
            [postId]: reactions
          }
        };
      }

      // If same length, check for deep equality
      // Simple check: compare stringified objects for changes
      if (JSON.stringify(existingReactions) === JSON.stringify(reactions)) {
        // No changes, skip update
        return state;
      }

      // If we got here, there are changes
      return {
        reactionsByPost: {
          ...state.reactionsByPost,
          [postId]: reactions
        }
      };
    });
  },

  setUserReaction: (postId, reaction) => {
    set((state) => {
      if (reaction) {
        return {
          userReactions: {
            ...state.userReactions,
            [postId]: reaction
          }
        };
      } else {
        // Remove reaction if undefined
        const updatedReactions = { ...state.userReactions };
        delete updatedReactions[postId];
        return { userReactions: updatedReactions };
      }
    });
  }
}));