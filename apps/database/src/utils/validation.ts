import { Location } from '@template/core-types';

export const locationValidator = (value: Location) => {
  // Skip validation if value is null or undefined (when allowNull is true)
  if (value === null || value === undefined) return;

  // Check if required fields exist
  if (!value.city && !value.formattedAddress) {
    throw new Error('Location must include either city or formattedAddress');
  }

  // Validate latitude and longitude if provided
  if (value.latitude !== undefined || value.longitude !== undefined) {
    if (typeof value.latitude !== 'number' || typeof value.longitude !== 'number') {
      throw new Error('Latitude and longitude must be numbers');
    }

    if (value.latitude < -90 || value.latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }

    if (value.longitude < -180 || value.longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
  }

  // Validate countryCode format if provided
  if (value.countryCode && (typeof value.countryCode !== 'string' || !/^[A-Z]{2}$/.test(value.countryCode))) {
    throw new Error('Country code must be a valid 2-character ISO code');
  }
};
