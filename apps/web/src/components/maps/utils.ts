'use client';

import { Location } from '@template/core-types';
import { MarkerPosition } from './types';

/**
 * Extract location data from a Google Place result
 */
export const extractLocationDataFromPlace = (place: google.maps.places.PlaceResult): Location => {
  // Get formatted address with fallbacks
  const formattedAddress = place.formatted_address || place.name || 'Selected location';

  // Create base location data
  const locationData: Location = {
    formattedAddress,
    latitude: place.geometry?.location?.lat() || 0,
    longitude: place.geometry?.location?.lng() || 0,
    city: '',
    state: '',
    country: '',
    countryCode: '',
  };

  // Extract address components
  extractAddressComponents(place.address_components, locationData);

  return locationData;
};

/**
 * Extract location data from geocoder result
 */
export const extractLocationFromGeocoderResult = (place: google.maps.GeocoderResult): Location => {
  // Get formatted address with fallbacks
  const formattedAddress = place.formatted_address || 'Selected location';

  // Create base location data
  const locationData: Location = {
    formattedAddress,
    latitude: place.geometry?.location?.lat() || 0,
    longitude: place.geometry?.location?.lng() || 0,
    city: '',
    state: '',
    country: '',
    countryCode: '',
  };

  // Extract address components
  extractAddressComponents(place.address_components, locationData);

  return locationData;
};

/**
 * Helper function to extract city, state, etc from address components
 */
const extractAddressComponents = (
  components: google.maps.GeocoderAddressComponent[] | undefined,
  locationData: Location
): void => {
  if (!components) return;

  for (const component of components) {
    if (component.types?.includes('locality')) {
      locationData.city = component.long_name;
    } else if (component.types?.includes('administrative_area_level_1')) {
      locationData.state = component.long_name;
    } else if (component.types?.includes('country')) {
      locationData.country = component.long_name;
      locationData.countryCode = component.short_name;
    }
  }
};

/**
 * Perform reverse geocoding on a position
 */
export const reverseGeocode = async (
  position: MarkerPosition,
  callback: (location: Location) => void
): Promise<void> => {
  if (!window.google) return;

  const geocoder = new window.google.maps.Geocoder();

  geocoder.geocode({ location: position }, (results, status) => {
    if (status === 'OK' && results && results[0]) {
      const locationData = extractLocationFromGeocoderResult(results[0]);
      callback(locationData);
    } else {
      // If geocoding fails, still provide coordinates
      callback({
        formattedAddress: `Lat: ${position.lat.toFixed(6)}, Lng: ${position.lng.toFixed(6)}`,
        latitude: position.lat,
        longitude: position.lng,
        city: '',
        state: '',
        country: '',
        countryCode: '',
      });
    }
  });
};


/**
 * Geocode an address string
 */
export const geocodeAddress = async (
  address: string,
  callback: (location: Location, position: MarkerPosition) => void
): Promise<void> => {
  if (!address || !window.google) return;

  const geocoder = new window.google.maps.Geocoder();

  geocoder.geocode({ address }, (results, status) => {
    if (status === 'OK' && results && results[0] && results[0].geometry?.location) {
      const location = results[0].geometry.location;

      try {
        // Get coordinates and validate they're numbers
        const lat = typeof location.lat === 'function' ? location.lat() : Number(location.lat);
        const lng = typeof location.lng === 'function' ? location.lng() : Number(location.lng);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
          console.error('Invalid coordinates from geocoding:', location);
          return;
        }

        const newPosition = {
          lat,
          lng
        };

        const locationData = extractLocationFromGeocoderResult(results[0]);

        // Ensure the location data has the same validated coordinates
        locationData.latitude = lat;
        locationData.longitude = lng;

        callback(locationData, newPosition);
      } catch (error) {
        console.error('Error processing geocoding result:', error);
      }
    }
  });
};
