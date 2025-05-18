import {
  Request,
  Response,
  NextFunction,
  RequestHandler
} from 'express';
import { clerkClient, clerkMiddleware } from '@clerk/express';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    userEmail?: string;
    isAdmin?: boolean;
    auth?: {
      userId: string;
    };
  }
}

const isUserInOrganization = async (userId: string) => {
  const organizationId = process.env.CLERK_ORG_ID;
  if (!organizationId) {
    throw new Error('CLERK_ORG_ID environment variable is not set');
  }

  // use the clerk client to check if the user is in the organization
  const response = await clerkClient.organizations.getOrganizationMembershipList({organizationId,});
  const users = response.data;

  if (users.length === 0) {
    return false;
  }
  const membership = users.at(0);

  // check for membership & that the public user data matches the userId
  if (!membership || membership.publicUserData?.userId !== userId) {
    return false;
  }

  return true;
};

// Create a custom middleware that extends Clerk's requireAuth
export const middlewareAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  clerkMiddleware()(req, res, async (err?: any) => {
    if (err) {
      console.error('Authentication error:', err);
      res.status(401).json({
        error: 'Authentication required',
        details: err.message || 'Invalid or missing authentication token',
        code: err.code || 'AUTH_ERROR'
      });
      return;
    }

    try {
      if (!req.auth) {
        res.status(401).json({
          error: 'Invalid token',
          details: 'User not authenticated or token is invalid'
        });
        return;
      }

      const userId = req.auth?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Invalid token',
          details: 'User ID not found in authentication data'
        });
        return;
      }

      // Set user ID in request headers
      req.headers['userId'] = userId;
      req.headers['isAdmin'] = 'false';

      // Check organization membership
      const isAdmin = await isUserInOrganization(userId);
      if (isAdmin) {
        req.headers['isAdmin'] = 'true';
      }

      next();
    } catch (error) {
      next(error);
    }
  });
};
