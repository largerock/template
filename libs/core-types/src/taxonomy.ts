import { z } from 'zod';
import { databaseEntrySchema } from './common';

export const interestBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  popularity: z.string(),
  category: z.string(),
});

export const interestSchema = databaseEntrySchema.extend(interestBaseSchema.shape);

export const interestUpdateSchema = interestBaseSchema.partial().extend({id: z.string(),});

// interest types
export type Interest = z.infer<typeof interestSchema>;
export type InterestCreate = z.infer<typeof interestBaseSchema>;
export type InterestUpdate = z.infer<typeof interestUpdateSchema>;