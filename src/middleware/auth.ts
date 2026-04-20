import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/auth';
import { AuthenticatedRequest } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      logger.warn('Invalid access token', { error, token: token.substring(0, 10) + '...' });
      res.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
      });
      return;
    }
  } catch (error) {
    logger.error('Authentication middleware error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
      } catch (error) {
        // Token is invalid but we don't fail the request
        logger.debug('Optional auth: Invalid token', { token: token.substring(0, 10) + '...' });
      }
    }
    
    next();
  } catch (error) {
    logger.error('Optional authentication middleware error', error);
    next(); // Don't fail the request
  }
};

/**
 * Middleware to check if user is verified
 */
export const requireVerified = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  // Note: In a real implementation, you'd check the user's verification status from the database
  // For now, we'll assume the user is verified if they have a valid token
  // You can extend this by fetching user data from the database
  
  next();
};
