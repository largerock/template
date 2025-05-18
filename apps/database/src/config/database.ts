import { Sequelize } from 'sequelize';
import databaseConfig from './sequelize.config';

// Create Sequelize instance using the same configuration from sequelize.config.ts
const sequelize = new Sequelize(
  databaseConfig.database,
  databaseConfig.username,
  databaseConfig.password,
  {
    host: databaseConfig.host,
    port: databaseConfig.port,
    dialect: 'postgres', // Explicitly set dialect
    define: databaseConfig.define,
    dialectOptions: databaseConfig.dialectOptions,
    logging: process.env.ENVIRONMENT === 'development' ? console.log : false,
    // Add pool configuration for better connection management
    pool: {
      max: 20,
      min: 0,
      acquire: 60000,
      idle: 10000
    }
  }
);

// Test the connection
export const testConnection = async (): Promise<void> => {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Host:', databaseConfig.host);
    console.log('Port:', databaseConfig.port);
    console.log('Database:', databaseConfig.database);
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;
