import { DataTypes, QueryInterface } from 'sequelize';
const USER_THEME_OPTIONS = ['LIGHT', 'DARK', 'SYSTEM'];

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Create users table
  await queryInterface.createTable('users', {
    clerkUserId: {  // Primary key is clerkUserId, not id
      type: DataTypes.STRING,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {isEmail: true,},
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    availability: {
      type: DataTypes.ENUM(
        'full_time',
        'part_time',
        'freelance',
        'volunteer',
        'student',
        'internship',
        'contract',
        'self_employed',
        'other',
      ),
      allowNull: true,
    },
    rate: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    headline: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    theme: {
      type: DataTypes.ENUM(...USER_THEME_OPTIONS),
      allowNull: false,
      defaultValue: 'SYSTEM',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {isUrl: true,},
    },
    socialLinks: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
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

  await queryInterface.addIndex('users', ['email']);
  await queryInterface.addIndex('users', ['phone']);

  // Add indexes for the location of the user
  await queryInterface.addIndex('users', {
    fields: [queryInterface.sequelize.literal('(location->>\'country\')')],
    name: 'idx_users_location_country',
  });
  await queryInterface.addIndex('users', {
    fields: [queryInterface.sequelize.literal('(location->>\'city\')')],
    name: 'idx_users_location_city',
  });
  await queryInterface.addIndex('users', {
    fields: [queryInterface.sequelize.literal('(location->>\'state\')')],
    name: 'idx_users_location_state',
  });
  await queryInterface.addIndex('users', {
    fields: [
      queryInterface.sequelize.literal('(location->>\'city\')'),
      queryInterface.sequelize.literal('(location->>\'country\')'),
    ],
    name: 'idx_users_location_city_country',
  });

  // Add individual indexes for latitude and longitude
  await queryInterface.addIndex('users', {
    fields: [queryInterface.sequelize.literal('(location->>\'latitude\')')],
    name: 'idx_users_location_latitude',
  });

  await queryInterface.addIndex('users', {
    fields: [queryInterface.sequelize.literal('(location->>\'longitude\')')],
    name: 'idx_users_location_longitude',
  });

  // Add a combined index for latitude and longitude together
  await queryInterface.addIndex('users', {
    fields: [
      queryInterface.sequelize.literal('(location->>\'latitude\')'),
      queryInterface.sequelize.literal('(location->>\'longitude\')'),
    ],
    name: 'idx_users_location_lat_lng',
  });

  // GIN index on the whole location field for faster JSON queries
  await queryInterface.addIndex('users', {
    fields: [queryInterface.sequelize.literal('location')],
    name: 'idx_users_location_gin',
    using: 'GIN',
  });

  await queryInterface.addIndex('users', ['firstName'], {
    name: 'users_firstName_idx'
  });

  await queryInterface.addIndex('users', ['lastName'], {
    name: 'users_lastName_idx'
  });

  // Add combined index for first and last name
  await queryInterface.addIndex('users', ['firstName', 'lastName'], {
    name: 'users_fullName_idx'
  });

  // Add expression index for concatenated full name
  await queryInterface.sequelize.query(`
    CREATE INDEX users_fullname_concat_idx ON users (("firstName" || ' ' || "lastName"));
  `).catch(err => {
    console.error('Error creating expression index:', err);
    // Proceed even if this specific index fails - it's an optimization
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('users');

  await queryInterface.removeIndex('users', 'users_firstName_idx');
  await queryInterface.removeIndex('users', 'users_lastName_idx');
  await queryInterface.removeIndex('users', 'users_fullName_idx');

  // Drop expression index if it was created
  await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS users_fullname_concat_idx;
  `).catch(err => {
    console.error('Error dropping expression index:', err);
  });
};