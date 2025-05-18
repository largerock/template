import sequelize from '../config/database';
import {
  DataTypes,
  Model
} from 'sequelize';
import {
  Post,
  PostReaction,
  PostComment,
  reactionTypeSchema
} from '@template/core-types';
import { locationValidator } from '../utils/validation';
import { UserModel } from './user-profile';

// Forward declarations for circular dependencies

let PostReactionModel: any;

let PostCommentModel: any;

export const PostModel = sequelize.define<Model<Post>>(
  'Post',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 5000],
      },
    },
    clerkUserId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: UserModel,
        key: 'clerkUserId',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: { locationValidator },
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    tableName: 'posts',
    timestamps: true,
    scopes: {
      withAuthor() {
        return {
          include: [
            {
              model: UserModel,
              as: 'author',
            },
          ]
        };
      },
      publicOnly() {
        return {
          where: { isPublic: true }
        };
      },
      byUser(clerkUserId: string) {
        return {
          where: { clerkUserId }
        };
      },
      withReactions(): { include: Array<{ model: any; as: string }> } {
        return {
          include: [
            {
              model: PostReactionModel,
              as: 'reactions',
            },
          ]
        };
      },
      withComments(): { include: Array<{ model: any; as: string }> } {
        return {
          include: [
            {
              model: PostCommentModel,
              as: 'comments',
            },
          ]
        };
      },
    },
  }
);

// Post Reaction Model
PostReactionModel = sequelize.define<Model<PostReaction>>(
  'PostReaction',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: PostModel,
        key: 'id',
      },
    },
    clerkUserId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: UserModel,
        key: 'clerkUserId',
      },
    },
    type: {
      type: DataTypes.ENUM(...(reactionTypeSchema.options as string[])),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'post_reactions',
    timestamps: true,
    updatedAt: false,
  }
);

// Post Comment Model
PostCommentModel = sequelize.define<Model<PostComment>>(
  'PostComment',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: PostModel,
        key: 'id',
      },
    },
    clerkUserId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: UserModel,
        key: 'clerkUserId',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000],
      },
    },
    parentCommentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: PostModel,
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'post_comments',
    timestamps: true,
  }
);

// Export the models for external use
export { PostReactionModel, PostCommentModel };

// Define relationships
PostModel.belongsTo(UserModel, {
  foreignKey: 'clerkUserId',
  targetKey: 'clerkUserId',
  as: 'author',
});

UserModel.hasMany(PostModel, {
  foreignKey: 'clerkUserId',
  sourceKey: 'clerkUserId',
  as: 'posts',
});

UserModel.hasMany(PostCommentModel, {
  foreignKey: 'clerkUserId',
  sourceKey: 'clerkUserId',
  as: 'comments',
});

UserModel.hasMany(PostReactionModel, {
  foreignKey: 'clerkUserId',
  sourceKey: 'clerkUserId',
  as: 'reactions',
});

PostModel.hasMany(PostReactionModel, {
  foreignKey: 'postId',
  sourceKey: 'id',
  as: 'reactions',
});

PostReactionModel.belongsTo(PostModel, {
  foreignKey: 'postId',
  as: 'post',
});

PostReactionModel.belongsTo(UserModel, {
  foreignKey: 'clerkUserId',
  as: 'user',
});

PostModel.hasMany(PostCommentModel, {
  foreignKey: 'postId',
  as: 'comments',
});

PostCommentModel.belongsTo(PostModel, {
  foreignKey: 'postId',
  as: 'post',
});

PostCommentModel.belongsTo(UserModel, {
  foreignKey: 'clerkUserId',
  as: 'author',
});

PostCommentModel.belongsTo(PostCommentModel, {
  foreignKey: 'parentCommentId',
  as: 'parentComment',
});

PostCommentModel.hasMany(PostCommentModel, {
  foreignKey: 'parentCommentId',
  as: 'replies',
});
