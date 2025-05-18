import { Request, Response, NextFunction } from 'express';

// Ultra simple token authentication
export const swaggerAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Skip auth in development
  if (process.env.ENVIRONMENT === 'development' || process.env.ENVIRONMENT === 'local') {
    console.log('Development mode - skipping auth');
    next();
    return;
  }

  // Simple token check in URL parameter
  const token = req.query.token as string;
  const validToken = process.env.SWAGGER_TOKEN || 'swagger-docs-token';

  console.log(`Auth check - token provided: ${!!token}, environment: ${process.env.ENVIRONMENT}`);

  // If valid token, proceed
  if (token === validToken) {
    next();
    return;
  }

  // Ultra simple response - just a text message
  res.status(401).send(
    `API Documentation requires authentication. Add ?token=swagger-docs-token to the URL.`
  );
};