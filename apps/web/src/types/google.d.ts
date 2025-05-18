/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    // Google Maps
    google: typeof google;
    // Google Analytics
    gtag: (
      command: 'event' | 'config',
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export {};
