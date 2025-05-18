import {
  postCreateSchema,
  postUpdateSchema,
  PostCreate,
  PostUpdate,
  reactionTypeSchema,
  FeedOptions
} from '@template/core-types';
import { Request, RequestHandler, Response } from 'express';
import postService from '../services/post.service';

type PostControllerType = {
  // Post endpoints
  getById: RequestHandler;
  getByUser: RequestHandler;
  getFeed: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;

  // Reaction endpoints
  addReaction: RequestHandler;
  removeReaction: RequestHandler;
  getReactions: RequestHandler;

  // Comment endpoints
  addComment: RequestHandler;
  updateComment: RequestHandler;
  deleteComment: RequestHandler;
  getComments: RequestHandler;
};

const postController: PostControllerType = {
  // Post endpoints
  getById: (async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: 'Invalid input',
          details: 'Post ID is required'
        });
        return;
      }

      const post = await postService.getById(id);
      if (!post) {
        res.status(404).json({
          error: 'Not found',
          details: 'Post not found'
        });
        return;
      }

      res.status(200).json(post);
    } catch (error) {
      console.error('Error getting post by ID:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }) as RequestHandler,

  getByUser: (async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(400).json({
          error: 'Invalid input',
          details: 'User ID is required'
        });
        return;
      }

      const posts = await postService.getByUser(userId);
      res.status(200).json(posts);
    } catch (error) {
      console.error('Error getting posts by user:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }) as RequestHandler,

  getFeed: (async (req: Request, res: Response) => {
    try {
      const { limit, offset, onlyPublic } = req.query;
      const userId = req.headers['userId'] as string;

      const options: FeedOptions = {
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
        clerkUserId: userId,
        onlyPublic: onlyPublic === 'true'
      };

      const posts = await postService.getFeed(options);
      res.status(200).json(posts);
    } catch (error) {
      console.error('Error getting feed:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }) as RequestHandler,

  create: (async (req: Request, res: Response) => {
    try {
      const userId = req.headers['userId'] as string;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          details: 'User not authenticated'
        });
        return;
      }

      const result = postCreateSchema.safeParse({
        ...req.body,
        clerkUserId: userId
      });

      if (!result.success) {
        res.status(400).json({
          error: 'Invalid input',
          details: result.error.errors
        });
        return;
      }

      const postData: PostCreate = result.data;

      // Ensure the authenticated user is the author
      if (postData.clerkUserId !== userId) {
        res.status(403).json({
          error: 'Forbidden',
          details: 'You can only create posts as yourself'
        });
        return;
      }

      const post = await postService.create(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }) as RequestHandler,

  update: (async (req: Request, res: Response) => {
    try {
      const userId = req.headers['userId'] as string;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          details: 'User not authenticated'
        });
        return;
      }

      const result = postUpdateSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({
          error: 'Invalid input',
          details: result.error.errors
        });
        return;
      }

      const postData: PostUpdate = result.data;

      // Check if the post exists and belongs to the user
      const existingPost = await postService.getById(postData.id);
      if (!existingPost) {
        res.status(404).json({
          error: 'Not found',
          details: 'Post not found'
        });
        return;
      }

      if (existingPost.clerkUserId !== userId) {
        res.status(403).json({
          error: 'Forbidden',
          details: 'You can only update your own posts'
        });
        return;
      }

      const updatedPost = await postService.update(postData);
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }) as RequestHandler,

  delete: (async (req: Request, res: Response) => {
    try {
      const userId = req.headers['userId'] as string;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          details: 'User not authenticated'
        });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: 'Invalid input',
          details: 'Post ID is required'
        });
        return;
      }

      // Check if the post exists and belongs to the user
      const existingPost = await postService.getById(id);
      if (!existingPost) {
        res.status(404).json({
          error: 'Not found',
          details: 'Post not found'
        });
        return;
      }

      if (existingPost.clerkUserId !== userId) {
        res.status(403).json({
          error: 'Forbidden',
          details: 'You can only delete your own posts'
        });
        return;
      }

      await postService.delete(id);
      res.status(200).json({ id, deleted: true });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }) as RequestHandler,

  // Reaction endpoints
  addReaction: (async (req: Request, res: Response) => {
    try {
      const userId = req.headers['userId'] as string;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          details: 'User not authenticated'
        });
        return;
      }

      const { postId } = req.params;
      if (!postId) {
        res.status(400).json({
          error: 'Invalid input',
          details: 'Post ID is required'
        });
        return;
      }

      const { type } = req.body;
      const reactionResult = reactionTypeSchema.safeParse(type);
      if (!reactionResult.success) {
        res.status(400).json({
          error: 'Invalid input',
          details: 'Invalid reaction type'
        });
        return;
      }

      // Check if the post exists
      const existingPost = await postService.getById(postId);
      if (!existingPost) {
        res.status(404).json({
          error: 'Not found',
          details: 'Post not found'
        });
        return;
      }

      const reaction = await postService.addReaction(userId, postId, reactionResult.data);
      res.status(201).json(reaction);
    } catch (error) {
      console.error('Error adding reaction:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }) as RequestHandler,

  removeReaction: (async (req: Request, res: Response) => {
    try {
      const userId = req.headers['userId'] as string;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          details: 'User not authenticated'
        });
        return;
      }

      const { postId } = req.params;
      if (!postId) {
        res.status(400).json({
          error: 'Invalid input',
          details: 'Post ID is required'
        });
        return;
      }

      // Check if the post exists
      const existingPost = await postService.getById(postId);
      if (!existingPost) {
        res.status(404).json({
          error: 'Not found',
          details: 'Post not found'
        });
        return;
      }

      await postService.removeReaction(userId, postId);
      res.status(200).json({ removed: true });
    } catch (error) {
      console.error('Error removing reaction:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }) as RequestHandler,

  getReactions: (async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      if (!postId) {
        res.status(400).json({
          error: 'Invalid input',
          details: 'Post ID is required'
        });
        return;
      }

      // Check if the post exists
      const existingPost = await postService.getById(postId);
      if (!existingPost) {
        res.status(404).json({
          error: 'Not found',
          details: 'Post not found'
        });
        return;
      }

      const reactions = await postService.getReactions(postId);
      res.status(200).json(reactions);
    } catch (error) {
      console.error('Error getting reactions:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }) as RequestHandler,

  // Comment endpoints
  addComment: (async (req: Request, res: Response) => {
    try {
      const userId = req.headers['userId'] as string;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          details: 'User not authenticated'
        });
        return;
      }

      const { postId } = req.params;
      if (!postId) {
        res.status(400).json({
          error: 'Invalid input',
          details: 'Post ID is required'
        });
        return;
      }

      const { content, parentCommentId } = req.body;
      if (!content || typeof content !== 'string') {
        res.status(400).json({
          error: 'Invalid input',
          details: 'Comment content is required'
        });
        return;
      }

      // Check if the post exists
      const existingPost = await postService.getById(postId);
      if (!existingPost) {
        res.status(404).json({
          error: 'Not found',
          details: 'Post not found'
        });
        return;
      }

      const comment = await postService.addComment(userId, postId, content, parentCommentId);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }) as RequestHandler,

  updateComment: (async (req: Request, res: Response) => {
    try {
      const userId = req.headers['userId'] as string;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          details: 'User not authenticated'
        });
        return;
      }

      const { commentId } = req.params;
      if (!commentId) {
        res.status(400).json({
          error: 'Invalid input',
          details: 'Comment ID is required'
        });
        return;
      }

      const { content } = req.body;
      if (!content || typeof content !== 'string') {
        res.status(400).json({
          error: 'Invalid input',
          details: 'Comment content is required'
        });
        return;
      }

      // Get the post ID from the comment to check ownership
      const comments = await postService.getComments(req.body.postId);
      const comment = comments.find(c => c.id === commentId);

      if (!comment) {
        res.status(404).json({
          error: 'Not found',
          details: 'Comment not found'
        });
        return;
      }

      // Check if the comment belongs to the user
      if (comment.clerkUserId !== userId) {
        res.status(403).json({
          error: 'Forbidden',
          details: 'You can only update your own comments'
        });
        return;
      }

      const updatedComment = await postService.updateComment(commentId, content);
      res.status(200).json(updatedComment);
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }) as RequestHandler,

  deleteComment: (async (req: Request, res: Response) => {
    try {
      const userId = req.headers['userId'] as string;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          details: 'User not authenticated'
        });
        return;
      }

      const { commentId } = req.params;
      if (!commentId) {
        res.status(400).json({
          error: 'Invalid input',
          details: 'Comment ID is required'
        });
        return;
      }

      // Get the post ID from the comment to check ownership
      const comments = await postService.getComments(req.body.postId);
      const comment = comments.find(c => c.id === commentId);

      if (!comment) {
        res.status(404).json({
          error: 'Not found',
          details: 'Comment not found'
        });
        return;
      }

      // Allow both the comment author and the post author to delete comments
      const post = await postService.getById(comment.postId);
      if (comment.clerkUserId !== userId && post?.clerkUserId !== userId) {
        res.status(403).json({
          error: 'Forbidden',
          details: 'You can only delete your own comments or comments on your posts'
        });
        return;
      }

      await postService.deleteComment(commentId);
      res.status(200).json({ id: commentId, deleted: true });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }) as RequestHandler,

  getComments: (async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      if (!postId) {
        res.status(400).json({
          error: 'Invalid input',
          details: 'Post ID is required'
        });
        return;
      }

      // Check if the post exists
      const existingPost = await postService.getById(postId);
      if (!existingPost) {
        res.status(404).json({
          error: 'Not found',
          details: 'Post not found'
        });
        return;
      }

      const comments = await postService.getComments(postId);
      res.status(200).json(comments);
    } catch (error) {
      console.error('Error getting comments:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }) as RequestHandler,
};

export default postController;
