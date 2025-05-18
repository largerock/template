import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Create type for post reactions
  await queryInterface.sequelize.query(`
    CREATE TYPE "enum_post_reactions_type" AS ENUM (
      'like', 'celebrate', 'support', 'insightful', 'curious'
    );
  `);

  // Posts table
  await queryInterface.createTable('posts', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
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
        model: 'users',
        key: 'clerkUserId',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
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
  });

  // Post Reactions table
  await queryInterface.createTable('post_reactions', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    clerkUserId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'clerkUserId',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    type: {
      type: 'enum_post_reactions_type',
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Post Comments table
  await queryInterface.createTable('post_comments', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    clerkUserId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'clerkUserId',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
        model: 'post_comments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
  });

  // Add indexes for better query performance
  // Posts indexes
  await queryInterface.addIndex('posts', ['clerkUserId'], {
    name: 'idx_posts_clerk_user_id',
  });
  await queryInterface.addIndex('posts', ['createdAt'], {
    name: 'idx_posts_created_at',
  });
  await queryInterface.addIndex('posts', ['isPublic'], {
    name: 'idx_posts_is_public',
  });

  // Post Reactions indexes
  await queryInterface.addIndex('post_reactions', ['postId'], {
    name: 'idx_post_reactions_post_id',
  });
  await queryInterface.addIndex('post_reactions', ['clerkUserId'], {
    name: 'idx_post_reactions_clerk_user_id',
  });
  await queryInterface.addIndex('post_reactions', ['postId', 'clerkUserId'], {
    name: 'idx_post_reactions_post_user',
    unique: true,
  });

  // Post Comments indexes
  await queryInterface.addIndex('post_comments', ['postId'], {
    name: 'idx_post_comments_post_id',
  });
  await queryInterface.addIndex('post_comments', ['clerkUserId'], {
    name: 'idx_post_comments_clerk_user_id',
  });
  await queryInterface.addIndex('post_comments', ['parentCommentId'], {
    name: 'idx_post_comments_parent_id',
  });
  await queryInterface.addIndex('post_comments', ['createdAt'], {
    name: 'idx_post_comments_created_at',
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  // Drop tables in reverse order
  await queryInterface.dropTable('post_comments');
  await queryInterface.dropTable('post_reactions');
  await queryInterface.dropTable('posts');

  // Drop the enum type
  await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_post_reactions_type";`);
};


