/**
 * API URL Configuration
 * 
 * This file contains constants used throughout the application
 * For development on an Android emulator, use 10.0.2.2 to access the host machine's localhost
 * For iOS simulator, use localhost
 * For physical devices, use the actual IP address of your machine on the local network
 */

// For development
export const API_URL = 'http://10.0.2.2:8000/api/v1';

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