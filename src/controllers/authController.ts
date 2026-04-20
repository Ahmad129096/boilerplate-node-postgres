import { Request, Response } from 'express';
import { authService } from '@/services/authService';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse } from '@/types';

/**
 * Authentication controller
 */
export class AuthController {
  /**
   * Register a new user
   */
  signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.signup(req.body);
    
    const response: ApiResponse = {
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: result,
    };

    res.status(201).json(response);
  });

  /**
   * Login user
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body);
    
    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: result,
    };

    res.status(200).json(response);
  });

  /**
   * Refresh access token
   */
  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    
    const response: ApiResponse = {
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    };

    res.status(200).json(response);
  });

  /**
   * Send password reset email
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.forgotPassword(req.body);
    
    const response: ApiResponse = {
      success: true,
      message: result.message,
    };

    res.status(200).json(response);
  });

  /**
   * Reset password
   */
  resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.resetPassword(req.body);
    
    const response: ApiResponse = {
      success: true,
      message: result.message,
    };

    res.status(200).json(response);
  });

  /**
   * Verify email
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.verifyEmail(req.body);
    
    const response: ApiResponse = {
      success: true,
      message: result.message,
    };

    res.status(200).json(response);
  });

  /**
   * Resend verification email
   */
  resendVerificationEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const result = await authService.resendVerificationEmail(email);
    
    const response: ApiResponse = {
      success: true,
      message: result.message,
    };

    res.status(200).json(response);
  });

  /**
   * Get current user profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // This would be implemented after we create the user service
    const response: ApiResponse = {
      success: true,
      message: 'Profile retrieved successfully',
      data: req.user, // User data from auth middleware
    };

    res.status(200).json(response);
  });

  /**
   * Logout user (client-side token invalidation)
   */
  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // In a stateless JWT system, logout is handled client-side
    // The client simply discards the tokens
    // If needed, you could implement a token blacklist
    
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
    };

    res.status(200).json(response);
  });
}

// Export singleton instance
export const authController = new AuthController();
