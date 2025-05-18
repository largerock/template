// Type for Google Analytics event parameters
export type GAEventParams = {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: string | number | undefined;
};
// Track custom events
export const trackEvent = (params: GAEventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const {
      action, category, label, value, ...rest 
    } = params;
    const eventParams: Record<string, unknown> = {
      event_category: category,
      event_label: label,
      value,
      ...rest,
    };
    // Type assertion since we know action is required
    window.gtag('event', action as string, eventParams);
  }
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID as string, {page_path: url,});
  }
};

// Common event categories
export const AnalyticsCategories = {
  USER: 'user',
  CONNECTION: 'connection',
  PROFILE: 'profile',
  SEARCH: 'search',
  AUTH: 'auth',
} as const;

// Common event actions
export const AnalyticsActions = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  LOGOUT: 'logout',
  UPDATE_PROFILE: 'update_profile',
  SEND_CONNECTION_REQUEST: 'send_connection_request',
  ACCEPT_CONNECTION: 'accept_connection',
  REJECT_CONNECTION: 'reject_connection',
  SEARCH_USERS: 'search_users',
  VIEW_PROFILE: 'view_profile',
} as const;
