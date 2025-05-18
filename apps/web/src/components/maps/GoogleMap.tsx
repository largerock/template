'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  type MapMouseEvent,
  type MapEvent,
} from '@vis.gl/react-google-maps';
import { Location } from '@template/core-types';
import { MapProps, MarkerPosition } from './types';
import MapInput from './MapSearchInput';
import { reverseGeocode } from './utils';

/**
 * A reusable map component using @vis.gl/react-google-maps
 * Allows for displaying a map, searching for locations, and selecting a location via marker
 */
const Map: React.FC<MapProps> = ({
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  // initialCenter = { lat: 37.7749, lng: -122.4194 }, // Default: San Francisco
  initialLocation = undefined, // Default: San Francisco
  initialZoom = 12,
  height = '400px',
  width = '100%',
  onMarkerChange,
  className = '',
  mapId = '8f348c1f4f91a9e8', // Default map style
  placeholder = 'Search for a location...',
}) => {
  const [markerPosition, setMarkerPosition] = useState<MarkerPosition | null>(null);
  const [searchInput, setSearchInput] = useState<string>(initialLocation?.formattedAddress ?? '');
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  // const [initialCenter, setInitialCenter] = useState<{ lat: number; lng: number }>({ lat: 37.7749, lng: -122.4194 });
  const initialCenter = initialLocation ? { lat: initialLocation.latitude, lng: initialLocation.longitude } : { lat: 37.7749, lng: -122.4194 };

  // Center map on marker position when it changes
  useEffect(() => {
    if (!mapRef.current || !markerPosition) return;

    // Validate coordinates to prevent NaN errors
    const lat = Number(markerPosition.lat);
    const lng = Number(markerPosition.lng);

    if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
      console.error('Invalid coordinates:', markerPosition);
      return;
    }

    const validPosition = {
      lat,
      lng
    };

    // Center the map on the marker position
    mapRef.current.panTo(validPosition);

    // Zoom in a bit if selecting from search
    const zoom = mapRef.current.getZoom();
    if (zoom !== undefined && zoom < 14) {
      mapRef.current.setZoom(14);
    }
  }, [markerPosition]);



  // Handle map click to place/move marker and perform geocoding
  const handleMapClick = useCallback((e: MapMouseEvent) => {
    if (!e.detail?.latLng) return;

    const newPosition = {
      lat: e.detail.latLng.lat,
      lng: e.detail.latLng.lng
    };

    setMarkerPosition(newPosition);

    // Perform reverse geocoding to get address details
    reverseGeocode(newPosition, (locationData) => {
      // Notify parent component of location change if callback provided
      if (onMarkerChange) {
        onMarkerChange(locationData);
      }

      // Update search input with formatted address
      setSearchInput(locationData.formattedAddress);
    });
  }, [onMarkerChange]);

  // Handle location selection from search or autocomplete
  const handleLocationSelect = useCallback((locationData: Location, position: MarkerPosition) => {
    // Validate coordinates before using them
    const lat = Number(position.lat);
    const lng = Number(position.lng);

    if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
      console.error('Received invalid coordinates from location select:', position);
      return;
    }

    const validPosition: MarkerPosition = {
      lat,
      lng
    };

    // Set marker with validated coordinates
    setMarkerPosition(validPosition);

    if (onMarkerChange) {
      // Also ensure the location data has valid coordinates
      const validLocationData = {
        ...locationData,
        latitude: lat,
        longitude: lng
      };
      onMarkerChange(validLocationData);
    }
  }, [onMarkerChange]);

  // Handle map load to capture the map instance
  const handleMapLoad = useCallback((event: MapEvent) => {
    if (event.map) {
      mapRef.current = event.map;
    }
  }, []);

  // Handle API load completion
  const handleApiLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    console.log('initialLocation', initialLocation);
    // if (initialLocation && initialLocation.latitude && initialLocation.longitude) {
    //   setInitialCenter({
    //     lat: initialLocation.latitude,
    //     lng: initialLocation.longitude
    //   });

    //   // set the search input to the formatted address
    //   setSearchInput(initialLocation.formattedAddress);
    // } else {
    //   setInitialCenter({
    //     lat: 37.7749,
    //     lng: -122.4194
    //   });
    // }
  }, [initialLocation]);

  // If no API key is provided
  if (!apiKey) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ height, width }}
      >
        <p className="text-gray-500">Google Maps API key is required</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Map Container with APIProvider wrapping everything */}
      <div className="relative">
        <APIProvider
          apiKey={apiKey}
          version="beta"
          libraries={['places', 'geocoding']}
          onLoad={handleApiLoaded}
        >
          {/* Search Box with Autocomplete */}
          <MapInput
            placeholder={placeholder}
            value={searchInput}
            onChange={setSearchInput}
            onLocationSelect={handleLocationSelect}
          />

          {/* Map Container */}
          <div className="relative" style={{ height, width }}>
            <div ref={mapDivRef} style={{ height, width }}>
              <GoogleMap
                defaultCenter={initialCenter || { lat: 37.7749, lng: -122.4194 }}
                defaultZoom={initialZoom}
                mapId={mapId}
                gestureHandling="greedy"
                onClick={handleMapClick}
                className="h-full w-full rounded-md"
                onIdle={handleMapLoad}
              >
                {markerPosition && (
                  <AdvancedMarker position={markerPosition} />
                )}
              </GoogleMap>
            </div>

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 rounded-md">
                <div className="text-gray-500">Loading map...</div>
              </div>
            )}
          </div>
        </APIProvider>
      </div>
    </div>
  );
};

export default Map;
