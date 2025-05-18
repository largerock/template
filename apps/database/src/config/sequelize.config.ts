import dotenv from 'dotenv';
dotenv.config();

const ENVIRONMENT = process.env.ENVIRONMENT || 'local';

// This is the proper format expected by Sequelize CLI
export const databaseConfigs = {
  development: {
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'xxxxx',
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    dialect: 'postgres',
    define: {timestamps: true},
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  local: {
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'xxxxx',
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    dialect: 'postgres',
    define: {timestamps: true},
    dialectOptions: {}
  },
  production: {
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'xxxxx',
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    dialect: 'postgres',
    define: {timestamps: true},
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  prerelease: {
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'xxxxx',
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    dialect: 'postgres',
    define: {timestamps: true},
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

export default databaseConfigs[ENVIRONMENT as keyof typeof databaseConfigs] || databaseConfigs.local;
