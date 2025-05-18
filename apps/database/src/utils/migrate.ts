import { Sequelize } from 'sequelize';
import path from 'path';
import { Umzug, SequelizeStorage } from 'umzug';
import config from '../config/sequelize.config';

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: 'postgres',
    dialectOptions: config.dialectOptions,
    logging: console.log
  }
);

// Create migrator
const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, '../migrations/*.js'),
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// Run migrations function
export async function runMigrations(): Promise<void> {
  try {
    console.log('Starting database migrations...');
    await umzug.up();
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// If this script is run directly
if (require.main === module) {
  runMigrations();
}