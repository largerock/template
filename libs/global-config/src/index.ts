export enum Environment {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

// Base configuration type that applies to all environments
export type BaseConfig = {
  VERSION: string;
  MAX_CONNECTIONS_PER_PAGE: number;
  DEFAULT_AVATAR: string;
  COPYRIGHT_YEAR: number;
  COMPANY_NAME: string;
  CLERK_TOKEN_TEMPLATE: string;
};

// Environment-specific configuration type
export type EnvConfig = {
  API_URL: string;
  CORS_ORIGIN: string;
  GA_TRACKING_ID: string;
  CLERK_ORGANIZATION_ID: string;
};

// Combined configuration type
export type GlobalConfig = BaseConfig & {
  // Map of environment-specific configs
  [key in Environment]: EnvConfig;
};

// Base configuration values (common across all environments)
const baseConfig: BaseConfig = {
  VERSION: '1.0.0',
  MAX_CONNECTIONS_PER_PAGE: 20,
  DEFAULT_AVATAR: '/images/default-avatar.png',
  COPYRIGHT_YEAR: new Date().getFullYear(),
  COMPANY_NAME: 'template-company',
  CLERK_TOKEN_TEMPLATE: 'connequity-token',
};

// Create the global configuration object with environment-specific values
const GLOBAL_CONFIG: GlobalConfig = {
  ...baseConfig,

  // Local environment configuration
  [Environment.LOCAL]: {
    API_URL: 'http://localhost:3030/',
    CORS_ORIGIN: 'http://localhost:3000',
    GA_TRACKING_ID: 'G-xx',
    CLERK_ORGANIZATION_ID: 'xx',
  },

  // Development environment configuration
  [Environment.DEVELOPMENT]: {
    API_URL: 'https://dev.api.template.com/',
    CORS_ORIGIN: 'https://dev.app.template.com',
    GA_TRACKING_ID: 'G-xx',
    CLERK_ORGANIZATION_ID: 'xx',
  },

  // Production environment configuration
  [Environment.PRODUCTION]: {
    API_URL: 'https://api.template.com/',
    CORS_ORIGIN: 'https://app.template.com',
    GA_TRACKING_ID: 'G-xx',
    CLERK_ORGANIZATION_ID: 'xx',
  },

  // Test environment configuration
  [Environment.TEST]: {
    API_URL: 'https://test.api.template.com/',
    CORS_ORIGIN: 'https://test.app.template.com',
    GA_TRACKING_ID: 'G-xx',
    CLERK_ORGANIZATION_ID: 'xx',
  },
};

// Helper to get config for current environment
export function getConfig(env: Environment): BaseConfig & EnvConfig {
  return {
    ...baseConfig,
    ...GLOBAL_CONFIG[env],
  };
}

export default GLOBAL_CONFIG;
