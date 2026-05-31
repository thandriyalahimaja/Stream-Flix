/**
 * Application configuration
 */
export const APP_CONFIG = {
  name: 'StreamFlix',
  tagline: 'Handcrafted cinema for the curious',
  description: 'Stream something worth remembering.',
  version: '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  pagination: {
    defaultPageSize: 20,
    browsePageSize: 20,
    searchPageSize: 16,
  },
  search: {
    debounceMs: 300,
    maxSuggestions: 5,
  },
  auth: {
    tokenKey: 'streamflix-token',
    themeKey: 'streamflix-theme',
  },
};
