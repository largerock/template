import { QueryInterface } from 'sequelize';

// Function to drop all enum types
export const dropAllEnumTypes = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_theme;');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_notifications_type;');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_notifications_status;');
};

// Function to create all enum types
export const createAllEnumTypes = async (queryInterface: QueryInterface): Promise<void> => {

  await queryInterface.sequelize.query(`
    CREATE TYPE enum_notifications_type AS ENUM (
      'CONNECTION_REQUEST',
      'CONNECTION_ACCEPTED',
      'PROFILE_UPDATE',
      'NEW_POST',
      'MENTION'
    );
  `);

  await queryInterface.sequelize.query(`
    CREATE TYPE enum_notifications_status AS ENUM ('UNREAD', 'READ', 'ARCHIVED');
  `);

  await queryInterface.sequelize.query(`
    CREATE TYPE enum_users_theme AS ENUM ('LIGHT', 'DARK', 'SYSTEM');
  `);
};

// Function to drop all tables in reverse dependency order
export const dropAllTables = async (queryInterface: QueryInterface): Promise<void> => {
  try {
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('interests');
  } catch (error) {
    // Tables might not exist, that's okay
    console.error('Error dropping tables:', error);
  }
};

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Start with a clean slate - drop everything
  await dropAllTables(queryInterface);
  await dropAllEnumTypes(queryInterface);

  // Create enum types first
  await createAllEnumTypes(queryInterface);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await dropAllTables(queryInterface);
  await dropAllEnumTypes(queryInterface);
};