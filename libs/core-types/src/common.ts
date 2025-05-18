import { z } from 'zod';

export const databaseEntrySchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const locationSchema = z.object({
  formattedAddress: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string(),
  countryCode: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export type Location = z.infer<typeof locationSchema>;

export type DeleteResponse = {
  id: string;
}