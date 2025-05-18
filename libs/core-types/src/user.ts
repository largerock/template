import { z } from 'zod';
import {
  locationSchema,
} from './common';
import { availabilitySchema, connectionStatusSchema, userThemeSchema } from './enums';
import { interestSchema } from './taxonomy';

// --- Base profile schemas ---
export const baseUserProfileSchema = z.object({
  clerkUserId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  availability: availabilitySchema.optional(),
  rate: z.number().optional(),
  email: z.string().email(),
  phone: z.string().optional().transform(val => val === '' ? undefined : val),
  imageUrl: z.string().optional().transform(val => val === '' ? undefined : val),
  headline: z.string().optional().transform(val => val === '' ? undefined : val),
  bio: z.string().optional().transform(val => val === '' ? undefined : val),
  location: locationSchema.optional().transform(val => val === null ? undefined : val),
  website: z.string().url().optional().transform(val => val === '' ? undefined : val),
  socialLinks: z.record(z.string()).default({}),
  theme: userThemeSchema.default('SYSTEM'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const contactInfoSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional().transform(val => val === '' ? undefined : val),
});

export const publicUserProfileBaseSchema = baseUserProfileSchema.omit({
  email: true,
  phone: true,
  theme: true,
  createdAt: true,
  updatedAt: true,
});

export const publicUserProfileAttributes = [
  'clerkUserId',
  'firstName',
  'lastName',
  'availability',
  'rate',
  'imageUrl',
  'headline',
  'bio',
  'location',
  'website',
  'socialLinks'
];

export const userProfileSimpleAttributes = [
  'clerkUserId',
  'firstName',
  'lastName',
  'imageUrl',
  'headline',
  'availability',
  'rate',
]

export const userProfileSimpleSchema = baseUserProfileSchema.omit({
  email: true,
  phone: true,
  bio: true,
  location: true,
  website: true,
  socialLinks: true,
  theme: true,
  createdAt: true,
  updatedAt: true,
});

// --- Extended user profile schemas ---
export const userProfileExtendedSchema = baseUserProfileSchema.extend({
  interests: z.array(interestSchema),
});

// Update user profile schemas
export const updateProfileSchema = baseUserProfileSchema.partial().extend({
  clerkUserId: z.string(),
  interestIds: z.array(z.string()).optional(),
});

// User plan schema
export const userPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  features: z.array(z.string()),
});

export type UserProfileUpdate = z.infer<typeof updateProfileSchema>;
export type UserProfile = z.infer<typeof baseUserProfileSchema>;
export type UserProfileExtended = z.infer<typeof userProfileExtendedSchema>;
export type UserProfileSimple = z.infer<typeof userProfileSimpleSchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type PublicUserProfile = z.infer<typeof publicUserProfileBaseSchema>;

// Re-define the schema without circular reference
export const publicUserProfileExtendedSchema = userProfileExtendedSchema.omit({
  createdAt: true,
  updatedAt: true,
  email: true,
  phone: true,
  theme: true,
}).extend({
  // Use a generic object array to avoid circular references
  connections: z.array(z.object({
    id: z.string(),
    requesterId: z.string(),
    recipientId: z.string(),
    status: connectionStatusSchema,
    notes: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    requester: userProfileSimpleSchema.optional(),
    recipient: userProfileSimpleSchema.optional()
  })).optional()
});

export type PublicUserProfileExtended = z.infer<typeof publicUserProfileExtendedSchema>;

// user plan types (payed tiers)
export type UserPlan = z.infer<typeof userPlanSchema>;

/**
 * Converts a UserProfileExtended object to a PublicUserProfileExtended object
 * by extracting only the fields that should be publicly visible.
 *
 * @param userProfile The complete user profile with extended data
 * @returns A public-facing user profile with only permitted fields
 */
export const convertToPublicProfile = (userProfile: UserProfileExtended):
  PublicUserProfileExtended => {
  return {
    clerkUserId: userProfile.clerkUserId,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    imageUrl: userProfile.imageUrl || undefined,
    headline: userProfile.headline || undefined,
    bio: userProfile.bio || undefined,
    location: userProfile.location,
    interests: userProfile.interests,
    availability: userProfile.availability,
    rate: userProfile.rate,
    socialLinks: userProfile.socialLinks,
    website: userProfile.website,
  };
};


export const convertToShortProfile = (userProfile: UserProfile): UserProfileSimple => {
  return {
    clerkUserId: userProfile.clerkUserId,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    imageUrl: userProfile.imageUrl || undefined,
    headline: userProfile.headline || undefined,
    availability: userProfile.availability || undefined,
    rate: userProfile.rate || undefined,
  };
};

