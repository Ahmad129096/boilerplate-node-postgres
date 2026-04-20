import { Router } from 'express';
import { authController } from '@/controllers/authController';
import { authenticate } from '@/middleware/auth';
import { validateBody } from '@/middleware/validation';
import {
  signupSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@/utils/validation';

const router = Router();

/**
 * @route POST /api/v1/auth/signup
 * @desc Register a new user
 * @access Public
 */
router.post('/signup', validateBody(signupSchema), authController.signup);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', validateBody(loginSchema), authController.login);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', validateBody(refreshTokenSchema), authController.refreshToken);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Send password reset email
 * @access Public
 */
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset password
 * @access Public
 */
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);

/**
 * @route POST /api/v1/auth/verify-email
 * @desc Verify email
 * @access Public
 */
router.post('/verify-email', validateBody(verifyEmailSchema), authController.verifyEmail);

/**
 * @route POST /api/v1/auth/resend-verification
 * @desc Resend verification email
 * @access Public
 */
router.post('/resend-verification', authController.resendVerificationEmail);

/**
 * @route GET /api/v1/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authenticate, authController.logout);

export { router as authRoutes };
