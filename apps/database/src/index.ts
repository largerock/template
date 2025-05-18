import express, { RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import {
  SwaggerTheme, SwaggerThemeNameEnum
} from 'swagger-themes';
import cron from 'node-cron';
import { testConnection } from './config/database';
import path from 'path';
import CONFIG, { Environment } from '@template/global-config';
import basicAuth from 'express-basic-auth';

// routes
import userRoutes from './routes/user.routes';
import interestRoutes from './routes/interest.routes';
import postRoutes from './routes/post.routes';

// Load environment variables
dotenv.config();
// Create Express server
const app = express();
const port = process.env.PORT || 3030;
const currentEnv = process.env.ENVIRONMENT as Environment;

// Basic auth middleware for Swagger docs
const swaggerCredentials = {
  users: {
    // You can define multiple users if needed
    [process.env.SWAGGER_USER || 'admin']: process.env.SWAGGER_PASSWORD || 'password123'
  },
  challenge: true, // This will show the authentication prompt
  realm: 'Template API Documentation'
};

// Helmet configuration with CSP for Swagger UI
app.use(
  helmet({
    contentSecurityPolicy: false, // Temporarily disable CSP to debug Safari issues
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration with proper handling of preflight requests
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://dev.app.template.com',
      'http://dev.template.com',
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.ENVIRONMENT === 'local') {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS for origin:', origin);
      callback(null, true);
      // callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Confirm-Delete'],
  credentials: true,
  maxAge: 86400, // Cache preflight requests for 24 hours
  optionsSuccessStatus: 204,
  preflightContinue: false
}));

app.use(express.json());
app.use(cookieParser());

const getSwaggerPaths = () => {
  const cwd = process.cwd();
  const isInDeploymentFolder = cwd.includes('deployment');

  if (isInDeploymentFolder) {
    const routesPath = path.resolve(__dirname, 'routes/*.js');
    return [routesPath];
  } else {
    const res = [
      path.join(__dirname, 'routes/*.ts'),
      path.join(__dirname, 'routes/*.js'),
    ];
    return res;
  }
}

const removeTrailingSlash = (url: string) => {
  return url.replace(/\/$/, '');
}

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Template API',
      version: '1.0.0',
      description: 'API for the Template platform',
    },
    servers: [
      {
        url: removeTrailingSlash(CONFIG[currentEnv].API_URL),
        description: 'API for the Template platform',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: getSwaggerPaths(),
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const theme = new SwaggerTheme();
const darkTheme = theme.getBuffer(SwaggerThemeNameEnum.DARK);

// Custom Swagger UI options
const swaggerUiOptions = {
  customCss: darkTheme,
  customSiteTitle: 'Template API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    deepLinking: true,
    theme: {display: 'dark',},
  },
};

app.use('/api-docs', basicAuth(swaggerCredentials));

// Serve Swagger docs at /api-docs with authentication
app.use('/api-docs', swaggerUi.serve as unknown as RequestHandler[]);
app.get('/api-docs', swaggerUi.setup(swaggerDocs, swaggerUiOptions) as unknown as RequestHandler);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/posts', postRoutes);

// Health check endpoint

/**
 * @swagger
 * /health
 *   get:
 *     summary: Check server health
 *     description: Returns a simple health check response
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok :^)' });
});

// Schedule LinkedIn data sync (runs at 2 AM every day)
cron.schedule('0 2 * * *', async () => {
  console.log('Starting scheduled LinkedIn data sync...');
  try {
    // need to store the linkedInAccessToken in the database somewhere when we get it
    // await TaxonomyService.syncIndustries();
    console.log('LinkedIn data sync completed successfully');
  } catch (error) {
    console.error('LinkedIn data sync failed:', error);
  }
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    console.log('✅ Database connection successful');
    console.log('🚀 Starting server on port', port);

    // Start server
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`📚 API documentation available at http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();