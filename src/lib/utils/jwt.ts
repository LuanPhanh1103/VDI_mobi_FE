import { jwtDecode } from 'jwt-decode';

export interface JWTPayload {
  exp: number; // Expiration time (Unix timestamp)
  iat: number; // Issued at time (Unix timestamp)
  sub: string; // Subject (usually user ID)
  username?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Decode JWT token and return payload
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload) return true;
  
  const currentTime = Date.now() / 1000; // Convert to seconds
  return payload.exp < currentTime;
};

/**
 * Get token expiry time in milliseconds
 */
export const getTokenExpiry = (token: string): number | null => {
  const payload = decodeToken(token);
  if (!payload) return null;
  
  return payload.exp * 1000; // Convert to milliseconds
};

/**
 * Check if token will expire soon (within specified minutes)
 */
export const isTokenExpiringSoon = (token: string, minutesThreshold: number = 5): boolean => {
  const payload = decodeToken(token);
  if (!payload) return true;
  
  const currentTime = Date.now() / 1000;
  const thresholdTime = minutesThreshold * 60; // Convert minutes to seconds
  
  return (payload.exp - currentTime) < thresholdTime;
};

/**
 * Get remaining time until token expires (in milliseconds)
 */
export const getTokenRemainingTime = (token: string): number => {
  const payload = decodeToken(token);
  if (!payload) return 0;
  
  const currentTime = Date.now() / 1000;
  const remainingSeconds = payload.exp - currentTime;
  
  return Math.max(0, remainingSeconds * 1000); // Convert to milliseconds
};
