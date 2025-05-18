import { Location } from '@template/core-types';

export interface MapProps {
  apiKey?: string;
  initialLocation?: Location;
  initialZoom?: number;
  height?: string | number;
  width?: string | number;
  onMarkerChange?: (location: Location) => void;
  className?: string;
  mapId?: string;
  placeholder?: string;
}

export interface MarkerPosition {
  lat: number;
  lng: number;
}
