import {
  PostCreate,
  PostUpdate,
  PostReaction,
  PostComment,
  ReactionType,
  PostExtended,
  FeedOptions,
  PostCommentExtended,
  userProfileSimpleAttributes
} from '@template/core-types';
import {
  PostModel,
  PostReactionModel,
  PostCommentModel,
  UserModel
} from '../models';
import { v4 as uuidv4 } from 'uuid';
import { Model } from 'sequelize';

// Define service interface for Posts
type PostService = {
  // Post methods
  getById(id: string): Promise<PostExtended | undefined>;
  getByUser(userId: string): Promise<PostExtended[]>;
  getFeed(options?: FeedOptions): Promise<PostExtended[]>;
  create(post: PostCreate): Promise<PostExtended>;
  update(post: PostUpdate): Promise<PostExtended>;
  delete(id: string): Promise<string>;

  // Reaction methods
  addReaction(userId: string, postId: string, type: ReactionType): Promise<PostReaction>;
  removeReaction(userId: string, postId: string): Promise<void>;
  getReactions(postId: string): Promise<PostReaction[]>;

  // Comment methods
  addComment(userId: string, postId: string, content: string, parentCommentId?: string): Promise<PostComment>;
  updateComment(commentId: string, content: string): Promise<PostComment>;
  deleteComment(commentId: string): Promise<string>;
  getComments(postId: string): Promise<PostComment[]>;
};


// Create service object
const postService: PostService = {
  // Post methods
  async getById(id: string): Promise<PostExtended | undefined> {
    const post = await PostModel.findByPk(
      id,
      {
        include: [
          { model: UserModel, as: 'author', attributes: userProfileSimpleAttributes },
          { model: PostCommentModel, as: 'comments', include: [
            { model: UserModel, as: 'author', attributes: userProfileSimpleAttributes }
          ]},
          { model: PostReactionModel, as: 'reactions' },
        ],
      }
    );
    if (!post) return;

    const postExtended = post.get({ plain: true }) as PostExtended;
    postExtended.commentCount = postExtended.comments?.length || 0;
    postExtended.reactionsCount = postExtended.reactions?.reduce((counts: Record<string, number>, reaction) => {
      const type = reaction.type;
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>) || {};
    postExtended.userReaction = postExtended.reactions?.find((reaction: PostReaction) =>
      reaction.clerkUserId === postExtended.clerkUserId)?.type;

    return postExtended;
  },

  async getByUser(clerkUserId: string): Promise<PostExtended[]> {
    const posts = await PostModel.scope(['withAuthor']).findAll({
      where: { clerkUserId },
      order: [['createdAt', 'DESC']],
      include: [
        { model: UserModel, as: 'author', attributes: userProfileSimpleAttributes },
        { model: PostCommentModel, as: 'comments', include: [
          { model: UserModel, as: 'author', attributes: userProfileSimpleAttributes }
        ]},
        { model: PostReactionModel, as: 'reactions' },
      ]
    });

    const resolved = await Promise.all(posts.map((post: Model) => post.get({ plain: true }) as PostExtended));
    resolved.map((post: PostExtended) => {
      post.commentCount = post.comments?.length || 0;
      post.reactionsCount = post.reactions?.reduce((counts: Record<string, number>, reaction) => {
        const type = reaction.type;
        counts[type] = (counts[type] || 0) + 1;
        return counts;
      }, {} as Record<string, number>) || {};
      post.userReaction = post.reactions?.find((reaction: PostReaction) => reaction.clerkUserId === clerkUserId)?.type;
      return post;
    });
    return resolved;
  },

  async getFeed(options: FeedOptions = {}): Promise<PostExtended[]> {
    try {
      const { limit = 20, offset = 0, clerkUserId, onlyPublic = true } = options;

      const whereClause: Record<string, any> = {};
      if (onlyPublic) whereClause.isPublic = true;

      // For future: add logic for personalized feed based on connections, interests, etc.
      const posts = await PostModel.scope(['withAuthor']).findAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          { model: UserModel, as: 'author', attributes: userProfileSimpleAttributes },
          { model: PostCommentModel, as: 'comments', include: [
            { model: UserModel, as: 'author', attributes: userProfileSimpleAttributes }
          ]},
          { model: PostReactionModel, as: 'reactions' },
        ]
      });

      const resolved: PostExtended[] = await Promise.all(
        posts.map((post: Model) => post.get({ plain: true }) as PostExtended)
      );

      resolved.map((post: PostExtended) => {
        post.commentCount = post.comments?.length || 0;
        post.reactionsCount = post.reactions?.reduce((counts: Record<string, number>, reaction) => {
          const type = reaction.type;
          counts[type] = (counts[type] || 0) + 1;
          return counts;
        }, {} as Record<string, number>) || {};
        post.userReaction = post.reactions
          ?.find((reaction: PostReaction) => reaction.clerkUserId === clerkUserId)?.type;
        return post;
      });
      return resolved;

    } catch (error) {
      console.error('Failed to get feed:', error);
      throw new Error('Failed to get feed');
    }
  },

  async create(post: PostCreate): Promise<PostExtended> {
    const transaction = await PostModel.sequelize!.transaction();

    try {
      // Create the post
      const newPost = await PostModel.create({
        ...post,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { transaction });

      await transaction.commit();

      const postId = newPost.get('id') as string;
      if (!postId) throw new Error('Failed to create post');

      // Fetch the complete post with all relationships
      const createdPost = await PostModel.findByPk(postId, {
        include: [
          { model: UserModel, as: 'author', attributes: userProfileSimpleAttributes },
          { model: PostCommentModel, as: 'comments', include: [
            { model: UserModel, as: 'author', attributes: userProfileSimpleAttributes }
          ]},
          { model: PostReactionModel, as: 'reactions' },
        ],
      });

      if (!createdPost) throw new Error('Failed to retrieve post after creation');

      return createdPost.get({ plain: true }) as PostExtended;

    } catch (error) {
      await transaction.rollback();
      console.error('Failed to create post:', error);
      throw error instanceof Error ? error : new Error('Failed to create post');
    }
  },

  async update(post: PostUpdate): Promise<PostExtended> {
    const transaction = await PostModel.sequelize!.transaction();

    try {
      const existingPost = await PostModel.findByPk(post.id, { transaction });
      if (!existingPost) {
        await transaction.rollback();
        throw new Error('Post not found');
      }

      // Update the post
      await existingPost.update({
        ...post,
        updatedAt: new Date()
      }, { transaction });

      await transaction.commit();

      const updatedPost = await PostModel.findByPk(post.id, {
        include: [
          { model: UserModel, as: 'author', attributes: userProfileSimpleAttributes },
          { model: PostCommentModel, as: 'comments', include: [
            { model: UserModel, as: 'author', attributes: userProfileSimpleAttributes }
          ]},
          { model: PostReactionModel, as: 'reactions' },
        ],
      });

      if (!updatedPost) throw new Error('Failed to retrieve post after update');

      return updatedPost.get({ plain: true }) as PostExtended;

    } catch (error) {
      await transaction.rollback();
      console.error('Failed to update post:', error);
      throw error instanceof Error ? error : new Error('Failed to update post');
    }
  },

  async delete(id: string): Promise<string> {
    const transaction = await PostModel.sequelize!.transaction();

    try {
      const post = await PostModel.findByPk(id, { transaction });
      if (!post) throw new Error('Post not found');

      // Delete all reactions and comments first
      await PostReactionModel.destroy({
        where: { postId: id },
        transaction
      });

      await PostCommentModel.destroy({
        where: { postId: id },
        transaction
      });

      await post.destroy({ transaction });
      await transaction.commit();

      return id;
    } catch (error) {
      await transaction.rollback();
      console.error('Failed to delete post:', error);
      throw error instanceof Error ? error : new Error('Failed to delete post');
    }
  },

  // Reaction methods
  async addReaction(userId: string, postId: string, type: ReactionType): Promise<PostReaction> {
    const transaction = await PostReactionModel.sequelize!.transaction();

    try {
      // Check if post exists
      const post = await PostModel.findByPk(postId, { transaction });

      if (!post) {
        await transaction.rollback();
        throw new Error('Post not found');
      }

      // Remove any existing reaction first
      await PostReactionModel.destroy({
        where: {
          clerkUserId: userId,
          postId
        },
        transaction
      });

      // Add new reaction
      const reaction = await PostReactionModel.create({
        id: uuidv4(),
        clerkUserId: userId,
        postId,
        type,
        createdAt: new Date()
      }, { transaction });

      await transaction.commit();
      return reaction.get({ plain: true }) as PostReaction;

    } catch (error) {
      await transaction.rollback();
      console.error('Failed to add reaction:', error);
      throw error instanceof Error ? error : new Error('Failed to add reaction');
    }
  },

  async removeReaction(userId: string, postId: string): Promise<void> {
    const transaction = await PostReactionModel.sequelize!.transaction();

    try {
      await PostReactionModel.destroy({
        where: {
          clerkUserId: userId,
          postId
        },
        transaction
      });

      await transaction.commit();
      return;

    } catch (error) {
      await transaction.rollback();
      console.error('Failed to remove reaction:', error);
      throw error instanceof Error ? error : new Error('Failed to remove reaction');
    }
  },

  async getReactions(postId: string): Promise<PostReaction[]> {
    try {
      const reactions = await PostReactionModel.findAll({
        where: { postId },
        include: [{
          model: UserModel,
          as: 'user',
          attributes: userProfileSimpleAttributes
        }]
      });

      return reactions.map((reaction: Model) => reaction.get({ plain: true }) as PostReaction);
    } catch (error) {
      console.error('Failed to get reactions:', error);
      throw new Error('Failed to get reactions');
    }
  },

  // Comment methods
  async addComment(
    userId: string,
    postId: string,
    content: string,
    parentCommentId?: string
  ): Promise<PostCommentExtended> {
    const transaction = await PostCommentModel.sequelize!.transaction();

    try {
      // Check if post exists
      const post = await PostModel.findByPk(postId, { transaction });

      if (!post) {
        await transaction.rollback();
        throw new Error('Post not found');
      }

      // If parentCommentId is provided, verify it exists and belongs to this post
      if (parentCommentId) {
        const parentComment = await PostCommentModel.findByPk(parentCommentId, { transaction });
        if (!parentComment) {
          await transaction.rollback();
          throw new Error('Parent comment not found');
        }

        if (parentComment.get('postId') !== postId) {
          await transaction.rollback();
          throw new Error('Parent comment does not belong to this post');
        }
      }

      // Create the comment
      const comment = await PostCommentModel.create({
        id: uuidv4(),
        clerkUserId: userId,
        postId,
        content,
        parentCommentId,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { transaction });

      await transaction.commit();

      // Fetch the complete comment with author relationship
      const createdComment = await PostCommentModel.findByPk(comment.get('id'), {
        include: [{
          model: UserModel,
          as: 'author',
          attributes: userProfileSimpleAttributes
        }],
      });

      if (!createdComment) {
        throw new Error('Failed to retrieve comment after creation');
      }

      return createdComment.get({ plain: true }) as PostCommentExtended;

    } catch (error) {
      await transaction.rollback();
      console.error('Failed to add comment:', error);
      throw error instanceof Error ? error : new Error('Failed to add comment');
    }
  },

  async updateComment(commentId: string, content: string): Promise<PostCommentExtended> {
    const transaction = await PostCommentModel.sequelize!.transaction();

    try {
      // Find the comment to update
      const comment = await PostCommentModel.findByPk(commentId, { transaction });

      if (!comment) {
        await transaction.rollback();
        throw new Error('Comment not found');
      }

      // Update the comment
      await comment.update({
        content,
        updatedAt: new Date()
      }, { transaction });

      // Fetch the updated comment with author relationship
      const updatedComment = await PostCommentModel.findByPk(commentId, {
        include: [{
          model: UserModel,
          as: 'author',
          attributes: userProfileSimpleAttributes
        }],
        transaction
      });

      if (!updatedComment) {
        throw new Error('Failed to retrieve comment after update');
      }

      await transaction.commit();
      return updatedComment.get({ plain: true }) as PostCommentExtended;

    } catch (error) {
      await transaction.rollback();
      console.error('Failed to update comment:', error);
      throw error instanceof Error ? error : new Error('Failed to update comment');
    }
  },

  async deleteComment(commentId: string): Promise<string> {
    const transaction = await PostCommentModel.sequelize!.transaction();

    try {
      // Check if comment exists
      const comment = await PostCommentModel.findByPk(commentId, { transaction });

      if (!comment) {
        await transaction.rollback();
        throw new Error('Comment not found');
      }

      // First delete all replies to this comment
      await PostCommentModel.destroy({
        where: { parentCommentId: commentId },
        transaction
      });

      // Then delete the comment itself
      await comment.destroy({ transaction });
      await transaction.commit();

      return commentId;
    } catch (error) {
      await transaction.rollback();
      console.error('Failed to delete comment:', error);
      throw error instanceof Error ? error : new Error('Failed to delete comment');
    }
  },

  async getComments(postId: string): Promise<PostCommentExtended[]> {
    try {
      const comments = await PostCommentModel.findAll({
        where: { postId },
        include: [{
          model: UserModel,
          as: 'author',
          attributes: userProfileSimpleAttributes
        }],
        order: [['createdAt', 'ASC']]
      });

      return comments.map((comment: Model) => comment.get({ plain: true }) as PostCommentExtended);
    } catch (error) {
      console.error('Failed to get comments:', error);
      throw new Error('Failed to get comments');
    }
  }
};

export default postService;
