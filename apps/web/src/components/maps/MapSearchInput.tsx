'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Location } from '@template/core-types';
import { MarkerPosition } from './types';
import { geocodeAddress } from './utils';
import { Input } from '../ui/input';
interface MapInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: Location, position: MarkerPosition) => void;
}

// Custom hook for autocomplete suggestions based on example
function useAutocompleteSuggestions(inputString: string, skipSearch: boolean) {
  const placesLib = useMapsLibrary('places');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken | null>(null);
  const [debouncedInput, setDebouncedInput] = useState<string>('');

  // Debounce input to prevent too many API calls
  useEffect(() => {
    // Don't search if skipSearch flag is true or input is too short
    if (skipSearch || inputString.length < 3) {
      setDebouncedInput('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedInput(inputString);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputString, skipSearch]);

  useEffect(() => {
    // Debug logging
    if (placesLib) {
      console.log('Places library loaded in MapInput:', true);
    }

    if (!placesLib || debouncedInput === '') return;

    // Create a session token if one doesn't exist
    if (!sessionToken) {
      setSessionToken(new placesLib.AutocompleteSessionToken());
    }

    // Skip if no session token
    if (!sessionToken) return;

    // Keep request simple with only essential params
    const request = {
      input: debouncedInput,
      sessionToken
    };

    console.log('Fetching suggestions for:', debouncedInput);
    setIsLoading(true);

    placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
      .then(res => {
        console.log('Suggestions received:', res.suggestions.length);
        setSuggestions(res.suggestions);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching suggestions:', error);
        setIsLoading(false);
      });
  }, [placesLib, debouncedInput, sessionToken]);

  const resetSession = useCallback(() => {
    // Explicitly clear suggestions immediately
    setSuggestions([]);

    // Reset the session token
    setSessionToken(null);
  }, []);

  return { suggestions, isLoading, resetSession };
}

/**
 * Search input component with Google Places autocomplete
 * Updated to use the modern Places API
 */
const MapInput: React.FC<MapInputProps> = ({
  placeholder = 'Search for a location...',
  value,
  onChange,
  onLocationSelect,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);
  const placesLib = useMapsLibrary('places');
  const { suggestions, isLoading, resetSession } = useAutocompleteSuggestions(inputValue, locationSelected);

  // Update the inputValue when the parent value changes
  React.useEffect(() => {
    // Skip updating if we just selected a location
    if (locationSelected && value.includes(inputValue)) {
      return;
    }

    setInputValue(value);

    // Clear suggestions when input value is externally updated
    if (value !== inputValue) {
      resetSession();

      // If value is being set externally to a non-empty value,
      // likely it's from a selection or programmatic update
      if (value && value.length > 0) {
        setLocationSelected(true);
      }
    }
  }, [value, inputValue, resetSession, locationSelected]);

  // Update showSuggestions when suggestions change
  useEffect(() => {
    // Only show suggestions if we haven't selected a location yet
    setShowSuggestions(suggestions.length > 0 && !locationSelected);
  }, [suggestions, locationSelected]);

  // Log when Places API becomes available
  useEffect(() => {
    if (placesLib) {
      console.log('Places API is available in MapInput component');
    }
  }, [placesLib]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    // When user starts typing again, reset the location selected flag
    if (locationSelected) {
      setLocationSelected(false);
    }
  }, [onChange, locationSelected]);

  const handleSuggestionClick = useCallback(async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    // Hide suggestions immediately on click
    setShowSuggestions(false);

    if (!placesLib || !suggestion.placePrediction) return;

    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['viewport', 'location', 'formattedAddress', 'addressComponents']
      });

      if (place.location) {
        // Parse and validate coordinates
        const lat = typeof place.location.lat === 'function'
          ? place.location.lat()
          : Number(place.location.lat);

        const lng = typeof place.location.lng === 'function'
          ? place.location.lng()
          : Number(place.location.lng);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
          console.error('Invalid coordinates from place:', place.location);
          return;
        }

        // Create position with validated coordinates
        const newPosition: MarkerPosition = {
          lat,
          lng
        };

        // Get full location data
        const locationData: Location = {
          formattedAddress: place.formattedAddress || '',
          city: '',
          country: '',
          countryCode: '',
          latitude: lat,
          longitude: lng,
        };

        // Extract address components if available
        if (place.addressComponents) {
          place.addressComponents.forEach(component => {
            const types = component.types || [];

            if (types.includes('locality')) {
              locationData.city = component.shortText || '';
            } else if (types.includes('administrative_area_level_1')) {
              locationData.state = component.shortText || '';
            } else if (types.includes('country')) {
              locationData.country = component.longText || '';
              locationData.countryCode = component.shortText || '';
            }
          });
        }

        // Set the location selected flag to prevent additional searches
        setLocationSelected(true);

        onLocationSelect(locationData, newPosition);
        onChange(place.formattedAddress || '');
      }

      // Reset the session after using it
      resetSession();
    } catch (error) {
      console.error('Error processing place selection:', error);
      // Fallback to geocoding the text if needed
      const searchText = suggestion.placePrediction?.text.text || inputValue;
      geocodeAddress(searchText, (locationData, position) => {
        setLocationSelected(true);
        onLocationSelect(locationData, position);
        onChange(locationData.formattedAddress);
        resetSession();
      });
    }
  }, [placesLib, inputValue, onChange, onLocationSelect, resetSession]);

  // Handle manual search when the search button is clicked
  const handleManualSearch = useCallback(() => {
    if (!inputValue.trim()) return;

    console.log('Performing manual search for:', inputValue);
    geocodeAddress(inputValue, (locationData, position) => {
      console.log('Manual search result:', locationData);
      setLocationSelected(true);
      onLocationSelect(locationData, position);
      onChange(locationData.formattedAddress);
    });
  }, [inputValue, onChange, onLocationSelect]);

  // Handle Enter key press for manual search
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleManualSearch();
    }
  }, [handleManualSearch]);

  return (
    <div className="mb-3">
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          className="w-full p-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          // Hide suggestions on blur after a short delay
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          // Show suggestions on focus if we have any
          onFocus={() => !locationSelected && suggestions.length > 0 && setShowSuggestions(true)}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
        )}

        {/* Clear button - only show when not loading and we have a value */}
        {!isLoading && inputValue && (
          <button
            type="button"
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            style={{ zIndex: 10 }}
            onClick={() => {
              setInputValue('');
              onChange('');
              setLocationSelected(false);
              resetSession();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Debug info */}
        {inputValue.length > 0 && !locationSelected && (
          <div className="text-xs text-gray-500 mt-1">
            {suggestions.length > 0 ? `${suggestions.length} suggestions found` :
             isLoading ? 'Loading suggestions...' : 'No suggestions found'}
          </div>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.placePrediction?.text.text || 'Unknown place'}
              </li>
            ))}
          </ul>
        )}
        {/* Search button */}
        <button
          type="button"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          style={{ zIndex: 10 }}
          onClick={handleManualSearch}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MapInput;