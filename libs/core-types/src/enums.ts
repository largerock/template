import { z } from "zod";


export const availabilitySchema = z.enum([
  'full_time',
  'part_time',
  'freelance',
  'volunteer',
  'student',
  'internship',
  'contract',
  'self_employed',
  'other',
]);
export type Availability = z.infer<typeof availabilitySchema>;

export const notificationTypeSchema = z.enum([
  'CONNECTION_REQUEST',
  'CONNECTION_ACCEPTED',
  'PROFILE_UPDATE',
  'NEW_POST',
  'MENTION',
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationStatusSchema = z.enum([
  'UNREAD',
  'READ',
  'ARCHIVED',
]);
export type NotificationStatus = z.infer<typeof notificationStatusSchema>;

export const connectionStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'BLOCKED',
]);
export type ConnectionStatus = z.infer<typeof connectionStatusSchema>;

export const locationSearchTypeSchema = z.enum([
  'radius',
  'cityCountry',
]);
export type LocationSearchType = z.infer<typeof locationSearchTypeSchema>;

// User Theme
export const userThemeSchema = z.enum([
  'LIGHT',
  'DARK',
  'SYSTEM'
]);
export type Theme = z.infer<typeof userThemeSchema>;
