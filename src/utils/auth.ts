import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { JWTPayload, RefreshTokenPayload } from '@/types';

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a password with its hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Verify JWT access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.secret) as JWTPayload;
};

/**
 * Verify JWT refresh token
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
};

/**
 * Generate a random token for email verification or password reset
 */
export const generateRandomToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Calculate token expiration date
 */
export const calculateTokenExpiration = (hours: number = 24): Date => {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

/**
 * Check if token has expired
 */
export const isTokenExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};
