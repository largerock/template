import {
  Request, RequestHandler, Response
} from 'express';
import UserService from '../services/user-profile.service';
import {
  updateProfileSchema,
  UserProfile,
} from '@template/core-types';
import path from 'path';
import fs from 'fs';
import { UserModel } from '../models';
import { Op } from 'sequelize';
import { Webhook } from 'svix';

type UserControllerType = {
  getCurrentUser: RequestHandler;
  update: RequestHandler;
  getById: RequestHandler;
  getAll: RequestHandler;
  seed: RequestHandler;
  deleteSeed: RequestHandler;
  checkTestUsers: RequestHandler;
  clerkWebhook: RequestHandler;
  getPublicUserProfiles: RequestHandler;
};

type ClerkUserWebhookEvent = {
  data: Record<string, unknown>;
  object: string;
  event_attributes: Record<string, unknown>;
  timestamp: number;
  instance_id: string;
  type: string;
}

// Create controller object
const userController: UserControllerType = {
  // Get current user profile
  getCurrentUser: (async (req: Request, res: Response) => {
    try {
      const userId: string | undefined = req.headers['userId'] as string;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized - user not authenticated',
          details: 'User not authenticated or token is invalid'
        });
      }

      // First try to get from our database
      let user = await UserService.get(userId);

      // If not in our database, sync from Clerk and handle the case where the user is not found
      if (!user) {
        await UserService.syncUserFromClerk(userId);
        user = await UserService.get(userId);
        if (!user) {
          res.status(404).json({ error: 'User not found' });
          return;
        }
      }
      res.status(200).json(user);
      return;
    } catch (error: unknown) {
      console.error('Error retrieving user profile:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Server error',
        details: 'Error retrieving user profile'
      });
      return;
    }
  }) as RequestHandler,

  // Update current user profile
  update: (async (req: Request, res: Response) => {
    try {
      if (req.body.createdAt) req.body.createdAt = new Date(req.body.createdAt);
      if (req.body.updatedAt) req.body.updatedAt = new Date(req.body.updatedAt);

      // Transform null values to undefined
      const transformedBody = { ...req.body };
      Object.keys(transformedBody).forEach(key => {
        if (transformedBody[key] === null) {
          transformedBody[key] = undefined;
        }
      });

      // check if location is null and set to undefined
      if (transformedBody.location === null) {
        transformedBody.location = undefined;
      }

      const result = updateProfileSchema.safeParse(transformedBody);
      if (!result.success) {
        res.status(400).json({
          error: 'Invalid input',
          details: result.error.errors,
        });
        return;
      }

      // Update user profile
      const updatedUser = await UserService.update(result.data);
      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(updatedUser);
      return;
    } catch (error: unknown) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
      return;
    }
  }) as RequestHandler,

  // Get user by ID
  getById: (async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await UserService.get(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
      return;
    } catch (error: unknown) {
      console.error('Error retrieving user:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
      return;
    }
  }) as RequestHandler,

  // Get all users with pagination
  getAll: (async (req: Request, res: Response) => {
    try {
      const isAdmin = req.headers['isAdmin'] === 'true';
      if (!isAdmin) {
        res.status(401).json({ error: 'Unauthorized - user not authenticated' });
        return;
      }
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const { users, total } = await UserService.getAll(limit, offset);
      res.status(200).json({ users, total });
      return;
    } catch (error: unknown) {
      console.error('Error getting all users:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
      return;
    }
  }) as RequestHandler,

  // Seed users from JSON file
  seed: (async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      const isAdmin = req.headers['isAdmin'] === 'true';
      if (!isAdmin) {
        res.status(401).json({ error: 'Unauthorized - admin access required' });
        return;
      }

      // Read the seed data file
      const dataPath = path.join(process.cwd(), 'data', 'seinfeld-users.json');
      const seedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

      if (!seedData.users || !Array.isArray(seedData.users)) {
        res.status(400).json({ error: 'Invalid seed data format' });
        return;
      }

      // Process and create each user
      const results: UserProfile[] = [];
      for (const userData of seedData.users) {
        try {
          // Add timestamps
          const now = new Date();
          const processedUserData = {
            ...userData,
            createdAt: now,
            updatedAt: now
          };

          // Create the user
          const user = await UserService.create(processedUserData);
          if (user) {
            results.push(user);
          }
        } catch (userError) {
          console.error(`Error seeding user ${userData.clerkUserId}:`, userError);
        }
      }

      res.status(200).json({
        message: 'Seed process completed',
        results
      });
    } catch (error: unknown) {
      console.error('Error seeding users:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
      return;
    }
  }) as RequestHandler,

  deleteSeed: (async (req: Request, res: Response) => {
    try {
      const isAdmin = req.headers['isAdmin'] === 'true';
      if (!isAdmin) {
        res.status(401).json({ error: 'Unauthorized - admin access required' });
        return;
      }

      // Delete users with clerkUserId starting with 'test_'
      const count = await UserService.deleteSeedUsers();
      res.status(200).json({
        message: 'Seed users deleted',
        count,
      });
    } catch (error: unknown) {
      console.error('Error deleting seed users:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
      return;
    }
  }) as RequestHandler,

  // Check if test users exist
  checkTestUsers: (async (req: Request, res: Response) => {
    try {
      const isAdmin = req.headers['isAdmin'] === 'true';
      if (!isAdmin) {
        res.status(401).json({ error: 'Unauthorized - admin access required' });
        return;
      }

      // Find users with test_ prefix
      const testUsers = await UserModel.findAll({where: {clerkUserId: {[Op.like]: 'test\\_%'}}});

      // Check seed data file
      const dataPath = path.join(process.cwd(), 'data', 'seinfeld-users.json');
      let seedData;
      try {
        seedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      } catch (error) {
        seedData = { users: [] };
      }

      res.status(200).json({
        foundInDB: testUsers.length,
        dbUsers: testUsers.map(u => ({
          clerkUserId: u.get().clerkUserId,
          name: `${u.get().firstName} ${u.get().lastName}`,
          location: u.get().location
        })),
        seedFileExists: fs.existsSync(dataPath),
        seedCount: seedData.users?.length || 0
      });
    } catch (error: unknown) {
      console.error('Error checking test users:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  }) as RequestHandler,

  // Clerk webhook
  clerkWebhook: (async (req: Request, res: Response) => {
    console.log('Request received');
    try {
      console.log('Clerk webhook received');
      const clerkWebhookSecret = process.env.CLERK_WEBHOOK_SECRET;
      if (!clerkWebhookSecret) {
        console.error('Clerk webhook secret not found');
        res.status(401).json({ error: 'Unauthorized - clerk webhook secret not found' });
        return;
      }

      // Verify the webhook signature using Svix headers
      const svixId = req.headers['svix-id'] as string;
      const svixTimestamp = req.headers['svix-timestamp'] as string;
      const svixSignature = req.headers['svix-signature'] as string;

      if (!svixId || !svixTimestamp || !svixSignature) {
        res.status(401).json({ error: 'Unauthorized - missing Svix signature headers' });
        return;
      }

      const wh = new Webhook(clerkWebhookSecret);
      // Throws on error, returns the verified content on success
      // Get the raw body
      const rawBody = Buffer.isBuffer(req.body)
        ? req.body.toString('utf8')
        : typeof req.body === 'string'
          ? req.body
        : JSON.stringify(req.body);
      const headers = {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature
      };
      const verified = wh.verify(rawBody, headers);
      if (!verified) {
        res.status(401).json({ error: 'Unauthorized - invalid Svix signature' });
        return;
      }
      // Type the event
      const typedEvent = verified as ClerkUserWebhookEvent;
      console.log('Typed event:', typedEvent.data);
      const user = await UserService.get(typedEvent.data.id as string);

      console.log('User:', user);

      // Update user with the latest information from Clerk
      if (user) {
        const userId = typedEvent.data.id as string;

        // Find primary email address
        const primaryEmailId = typedEvent.data.primary_email_address_id as string;
        const emailAddresses = typedEvent.data.email_addresses as Array<{
          id: string;
          email_address: string;
        }> || [];

        const primaryEmail = emailAddresses.find(
          (email) => email.id === primaryEmailId
        )?.email_address;

        // Find primary phone number
        const primaryPhoneId = typedEvent.data.primary_phone_number_id as string;
        const phoneNumbers = typedEvent.data.phone_numbers as Array<{
          id: string;
          phone_number: string;
        }> || [];

        const primaryPhone = phoneNumbers.find(
          (phone) => phone.id === primaryPhoneId
        )?.phone_number;

        // Prepare updated user data with required clerkUserId
        const updatedUserData = {
          clerkUserId: userId,
          firstName: typedEvent.data.first_name as string,
          lastName: typedEvent.data.last_name as string,
          email: primaryEmail,
          phone: primaryPhone,
          imageUrl: (typedEvent.data.profile_image_url || typedEvent.data.image_url) as string,
        };

        // Filter out undefined values but ensure clerkUserId remains
        const filteredUserData = {
          clerkUserId: userId,
          ...Object.fromEntries(
            Object.entries(updatedUserData)
              .filter(([key, value]) => key !== 'clerkUserId' && value !== undefined)
          )
        };

        // Update the user in the database
        await UserService.update(filteredUserData);

        console.log('User updated successfully with data:', filteredUserData);
      } else {
        console.log('User not found in database:', typedEvent.data.id);
      }

      const { event } = req.body;
      console.log('Clerk webhook received:', event);

      res.status(200).json({ received: true });

    } catch (error: unknown) {
      console.error('Error processing clerk webhook:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  }) as RequestHandler,

  // Get public user profiles by IDs
  getPublicUserProfiles: (async (req: Request, res: Response) => {
    try {
      const { userIds } = req.body;

      // Validate input
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          error: 'Invalid input',
          details: 'userIds must be a non-empty array of strings'
        });
      }

      // Get public user profiles
      const users = await UserService.getPublicUserProfiles(userIds);

      res.status(200).json(users);
      return;
    } catch (error: unknown) {
      console.error('Error retrieving public user profiles:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Server error',
        details: 'Error retrieving public user profiles'
      });
      return;
    }
  }) as RequestHandler,
};

export default userController;
