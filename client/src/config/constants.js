/**
 * API URL Configuration
 * 
 * This file contains constants used throughout the application
 * For development on an Android emulator, use 10.0.2.2 to access the host machine's localhost
 * For iOS simulator, use localhost
 * For physical devices, use the actual IP address of your machine on the local network
 */

// Environment configurations
const ENV = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
};

// Current environment
const CURRENT_ENV = ENV.DEVELOPMENT;

// Base URLs for different environments
const BASE_URLS = {
  // [ENV.DEVELOPMENT]: 'http://192.168.175.119:8000',
  [ENV.DEVELOPMENT]: 'http://192.168.162.119:8000',
  [ENV.STAGING]: 'http://staging-api.championsarena.com',
  [ENV.PRODUCTION]: 'https://api.championsarena.com'
};

// API version
const API_VERSION = 'v1';

// Construct the full API URL based on environment
export const API_URL = `${BASE_URLS[CURRENT_ENV]}/api/${API_VERSION}`;

// Application constants
export const APP_NAME = 'Champions Arena';
export const APP_VERSION = '1.0.0';

// Validation constants
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

// Authentication constants
export const TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_DATA_KEY = 'user_data';

// Timeouts and intervals
export const DEFAULT_TIMEOUT = 10000; // 10 seconds
export const TOKEN_REFRESH_INTERVAL = 1000 * 60 * 15; // 15 minutes

// UI constants
export const ANIMATION_DURATION = 300; // milliseconds
export const DEBOUNCE_DELAY = 300; // milliseconds

// Auth routes
export const AUTH_ROUTES = {
  // OTP authentication routes
  INITIATE_OTP: '/auth/initiate-otp-auth',
  VERIFY_OTP: '/auth/verify-otp',
  RESEND_OTP: '/auth/resend-otp',
  
  // Token related routes
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  
  // Player specific auth routes
  PLAYER_AUTH: '/player-auth/initiate-otp-auth',
  PLAYER_CHECK_AUTH: '/player-auth/check-auth',
  PLAYER_REGISTER: '/player-auth/register',
  LOGIN: '/player-auth/login',
  CURRENT_USER: '/player-auth/me',
  
  // Password management
  FORGOT_PASSWORD: '/player-auth/forgot-password',
  RESET_PASSWORD: '/player-auth/reset-password',
  CHANGE_PASSWORD: '/player-auth/change-password',
  
  // Profile management
  UPDATE_PROFILE: '/player-auth/update-profile',
  
  // Organizer routes
  ORGANIZER_AUTH: '/auth/organizer/initiate-otp-auth',
  ORGANIZER_CHECK_AUTH: '/auth/organizer/check-auth'
};

// User routes
export const USER_ROUTES = {
  UPLOAD_PROFILE_PICTURE: '/users/upload-profile-picture',
  PLAYER_PROFILE: '/users/player/profile',
  ORGANIZER_PROFILE: '/users/organizer/profile',
  PLAYER_SETTINGS: '/users/player/settings',
  ORGANIZER_SETTINGS: '/users/organizer/settings'
};

// Tournament routes
export const TOURNAMENT_ROUTES = {
  ALL: '/tournaments',
  DETAIL: '/tournaments/:id'
};