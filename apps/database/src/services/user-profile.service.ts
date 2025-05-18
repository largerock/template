import {
  Op,
  FindOptions
} from 'sequelize';
import { clerkClient } from '@clerk/express';
import {
  UserProfile,
  UserProfileExtended,
  UserProfileUpdate,
  PublicUserProfileExtended,
  publicUserProfileAttributes,
  ContactInfo,
} from '@template/core-types';
import {
  UserModel,
  InterestModel,
  UserInterestModel,
} from '../models';

// Define service interface
type UserService = {
  get(id: string): Promise<UserProfileExtended | undefined>;
  create(user: UserProfile): Promise<UserProfile | undefined>;
  delete(id: string): Promise<number>;
  deleteSeedUsers(): Promise<number>;
  syncUserFromClerk(clerkId: string): Promise<UserProfile>;
  update(data: UserProfileUpdate): Promise<UserProfile>;
  getAll(limit?: number, offset?: number):
    Promise<{
      users: PublicUserProfileExtended[];
      total: number;
    }>;
  getPublicUserProfiles(ids: string[]): Promise<PublicUserProfileExtended[]>;
  getContactInfo(clerkUserId: string): Promise<ContactInfo | undefined>;
  userExists(clerkUserId: string): Promise<boolean>;
  linkInterests(clerkUserId: string, interestIds: string[]): Promise<void>;
  unlinkInterests(clerkUserId: string, interestIds: string[]): Promise<void>;
};

// Create service object
const userService: UserService = {
  // Get user by ID
  async userExists(clerkUserId: string): Promise<boolean> {
    const user = await UserModel.findByPk(clerkUserId, {
      attributes: ['clerkUserId'],
    });
    return !!user;
  },

  async get(id: string): Promise<UserProfileExtended | undefined> {
    // print the type UserProfileExtended without the zod schema
    const result = await UserModel.findByPk(id, {
      include: [
        { model: InterestModel, as: 'interests' }
      ],
    });
    const user = result?.get({ plain: true }) as UserProfileExtended;
    if (!user) {
      return undefined;
    }
    console.log(typeof user);
    return user;
  },

  async create(user: UserProfile): Promise<UserProfileExtended> {
    const transaction = await UserModel.sequelize!.transaction();

    try {
      // Make sure location is stored as JSON
      if (user.location && typeof user.location === 'string') {
        try {
          user.location = JSON.parse(user.location as unknown as string);
        } catch (e) {
          console.error('Invalid location format:', user.location);
        }
      }

      // Create the user profile
      await UserModel.create(user, { transaction });


      // Fetch the complete user profile with all relationships
      const createdUser = await UserModel.findByPk(user.clerkUserId, {
        include: [
          { model: InterestModel, as: 'interests' },
        ],
        transaction
      });

      if (!createdUser) {
        throw new Error('Failed to retrieve user after creation');
      }

      await transaction.commit();
      return createdUser.get({ plain: true }) as UserProfileExtended;

    } catch (error) {
      await transaction.rollback();
      console.error('Error creating user:', error);
      throw error instanceof Error ? error : new Error('Failed to create user');
    }
  },

  async delete(id: string): Promise<number> {
    const transaction = await UserModel.sequelize!.transaction();

    try {
      await this.unlinkInterests(id, []);

      // Then delete the user
      const result = await UserModel.destroy({
        where: { clerkUserId: id },
        transaction
      });

      if (result === 0) {
        await transaction.rollback();
        throw new Error(`User with clerkUserId ${id} not found`);
      }

      await transaction.commit();
      return result;

    } catch (error) {
      await transaction.rollback();
      console.error('Failed to delete user:', error);
      throw error instanceof Error ? error : new Error(`Failed to delete user: ${id}`);
    }
  },

  async deleteSeedUsers(): Promise<number> {
    const count = await UserModel.destroy({ where: { clerkUserId: { [Op.like]: 'test\\_%' } } });
    return count;
  },

  // Sync user from Clerk
  async syncUserFromClerk(clerkUserId: string): Promise<UserProfile> {
    const transaction = await UserModel.sequelize!.transaction();
    let userData: UserProfile;

    try {
      // Fetch user data from Clerk
      const clerkUser = await clerkClient.users.getUser(clerkUserId);

      // Prepare user data
      userData = {
        clerkUserId,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        headline: '',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        imageUrl: clerkUser.imageUrl,
        theme: 'SYSTEM',
        socialLinks: {},
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Check if user already exists
      const existingUser = await UserModel.findByPk(clerkUserId, { transaction });
      let isNewUser = false;

      if (existingUser) {
        // Update existing user
        await existingUser.update(
          { ...userData, updatedAt: new Date() },
          { transaction }
        );
      } else {
        // Create new user
        await UserModel.create(userData, { transaction });
        isNewUser = true;
      }

      // Fetch the updated/created user
      const syncedUser = await UserModel.findByPk(clerkUserId, { transaction });

      if (!syncedUser) {
        throw new Error(`Failed to sync user with Clerk: ${clerkUserId}`);
      }
      await transaction.commit();

      return syncedUser.get({ plain: true }) as UserProfile;

    } catch (error) {
      await transaction.rollback();
      console.error('Failed to sync user with Clerk:', error);
      throw error instanceof Error ? error : new Error(`Failed to sync user with Clerk: ${clerkUserId}`);
    }
  },

  // Update user profile
  async update(data: UserProfileUpdate): Promise<UserProfile> {
    const transaction = await UserModel.sequelize!.transaction();

    try {
      console.log(data);
      // Find the user with their relationships
      let user = await UserModel.findByPk(data.clerkUserId, {
        include: [
          { model: InterestModel, as: 'interests' },
        ],
        transaction
      });

      // If user doesn't exist, sync from Clerk
      if (!user) {
        await transaction.rollback();
        return await this.syncUserFromClerk(data.clerkUserId);
      }

      // Extract interestIds from the update data
      const { interestIds, ...basicData } = data;

      // Update the basic profile fields
      await user.update({
        ...basicData,
        updatedAt: new Date(),
      }, { transaction });

      // Get existing profile data for relationship handling
      const existingProfile = user.get({ plain: true }) as UserProfileExtended;

      // Handle interests updates if provided
      if (interestIds) {
        // Calculate which interests need to be added/removed
        const interestsToRemove = existingProfile.interests
          .filter(i => !interestIds.includes(i.id))
          .map(i => i.id);

        const interestsToAdd = interestIds.filter(id =>
          !existingProfile.interests.map(i => i.id).includes(id)
        );

        // Only perform database operations if there are changes
        if (interestsToRemove.length > 0) {
          await this.unlinkInterests(data.clerkUserId, interestsToRemove);
        }

        if (interestsToAdd.length > 0) {
          await this.linkInterests(data.clerkUserId, interestsToAdd);
        }
      }

      // Fetch the updated user with all relationships
      const updatedUser = await UserModel.findByPk(data.clerkUserId, {
        include: [
          { model: InterestModel, as: 'interests' },
        ],
        transaction
      });

      if (!updatedUser) {
        throw new Error(`Failed to retrieve user after update: ${data.clerkUserId}`);
      }

      await transaction.commit();
      return updatedUser.get({ plain: true }) as UserProfile;

    } catch (error) {
      await transaction.rollback();
      console.error('Failed to update user:', error);
      throw error instanceof Error ? error : new Error(`Failed to update user: ${data.clerkUserId}`);
    }
  },

  // Get all users with optimized batch processing
  async getAll(limit?: number, offset?: number): Promise<{
    users: PublicUserProfileExtended[];
    total: number;
  }> {
    // Build the query options with includes for all necessary associations
    const queryOptions: FindOptions = {
      attributes: publicUserProfileAttributes,
      include: [
        { model: InterestModel, as: 'interests', required: false },
      ]
    };

    // Add pagination if provided
    if (limit !== undefined && offset !== undefined) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    // Get users with all relationships
    const { rows: users, count: total } = await UserModel.findAndCountAll(queryOptions);

    const usersPlain = users.map(user => user.get({ plain: true })) as unknown as PublicUserProfileExtended[];

    return {
      users: usersPlain,
      total
    };
  },

  async getPublicUserProfiles(ids: string[]): Promise<PublicUserProfileExtended[]> {
    const users = await UserModel.findAll({
      where: {
        clerkUserId: { [Op.in]: ids }
      },
      attributes: publicUserProfileAttributes,
      include: [
        { model: InterestModel, as: 'interests', required: false },
      ]
    });

    if (!users || users.length === 0) {
      return [];
    }

    return users.map(user => user.get({ plain: true })) as unknown as PublicUserProfileExtended[];
  },

  async linkInterests(clerkUserId: string, interestIds: string[]): Promise<void> {
    // If interestIds is empty, remove all interests for this user
    await UserInterestModel.bulkCreate(interestIds.map(interestId => ({ clerkUserId, interestId })));
  },

  async unlinkInterests(clerkUserId: string, interestIds: string[]): Promise<void> {
    // If interestIds is empty, remove all interests for this user
    if (interestIds.length === 0) {
      await UserInterestModel.destroy({ where: { clerkUserId } });
    } else {
      // Otherwise, remove only the specified interests
      await UserInterestModel.destroy({ where: { clerkUserId, interestId: { [Op.in]: interestIds } } });
    }
  },

  async getContactInfo(clerkUserId: string): Promise<ContactInfo | undefined> {
    const user = await UserModel.findByPk(clerkUserId, {
      attributes: ['email', 'phone'],
    });
    if (!user) {
      return;
    }
    const userPlain = user.get({ plain: true }) as ContactInfo;
    return userPlain;
  },

};

export default userService;
