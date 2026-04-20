import { prisma } from '@/db';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyRefreshToken, generateRandomToken, calculateTokenExpiration, isTokenExpired } from '@/utils/auth';
import { emailService } from '@/email';
import { ConflictError, UnauthorizedError, NotFoundError, ValidationError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { SignupInput, LoginInput, ForgotPasswordInput, ResetPasswordInput, VerifyEmailInput } from '@/utils/validation';

/**
 * Authentication service class
 */
export class AuthService {
  /**
   * Register a new user
   */
  async signup(data: SignupInput) {
    const { email, password, firstName, lastName } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Generate email verification token
    const verificationToken = generateRandomToken();
    const expiresAt = calculateTokenExpiration(24); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Send verification email
    try {
      await emailService.sendEmailVerification(user.email, user.firstName || '', verificationToken);
      logger.info('Verification email sent', { userId: user.id, email: user.email });
    } catch (error) {
      logger.error('Failed to send verification email', { error, userId: user.id });
      // Don't fail the registration if email fails
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginInput) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      logger.info('Token refreshed successfully', { userId: user.id });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Send password reset email
   */
  async forgotPassword(data: ForgotPasswordInput) {
    const { email } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      logger.info('Password reset requested for non-existent email', { email });
      return { message: 'If an account with this email exists, a password reset link has been sent' };
    }

    if (!user.isActive) {
      logger.info('Password reset requested for inactive account', { email });
      return { message: 'If an account with this email exists, a password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const expiresAt = calculateTokenExpiration(1); // 1 hour

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Send reset email
    try {
      await emailService.sendPasswordReset(user.email, user.firstName || '', resetToken);
      logger.info('Password reset email sent', { userId: user.id, email: user.email });
    } catch (error) {
      logger.error('Failed to send password reset email', { error, userId: user.id });
      throw new Error('Failed to send password reset email');
    }

    return { message: 'Password reset link sent to your email' };
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordInput) {
    const { token, password } = data;

    // Find reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new ValidationError('Invalid or expired reset token');
    }

    if (isTokenExpired(resetToken.expiresAt)) {
      throw new ValidationError('Reset token has expired');
    }

    if (!resetToken.user.isActive) {
      throw new ValidationError('Account is deactivated');
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Delete reset token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    logger.info('Password reset successfully', { userId: resetToken.userId });

    return { message: 'Password reset successfully' };
  }

  /**
   * Verify email
   */
  async verifyEmail(data: VerifyEmailInput) {
    const { token } = data;

    // Find verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new ValidationError('Invalid or expired verification token');
    }

    if (isTokenExpired(verificationToken.expiresAt)) {
      throw new ValidationError('Verification token has expired');
    }

    if (!verificationToken.user.isActive) {
      throw new ValidationError('Account is deactivated');
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { isVerified: true },
    });

    // Delete verification token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    logger.info('Email verified successfully', { userId: verificationToken.userId });

    return { message: 'Email verified successfully' };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isVerified) {
      throw new ValidationError('Email is already verified');
    }

    if (!user.isActive) {
      throw new ValidationError('Account is deactivated');
    }

    // Delete existing verification tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate new verification token
    const verificationToken = generateRandomToken();
    const expiresAt = calculateTokenExpiration(24); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Send verification email
    try {
      await emailService.sendEmailVerification(user.email, user.firstName || '', verificationToken);
      logger.info('Verification email resent', { userId: user.id, email: user.email });
    } catch (error) {
      logger.error('Failed to resend verification email', { error, userId: user.id });
      throw new Error('Failed to send verification email');
    }

    return { message: 'Verification email sent' };
  }
}

// Export singleton instance
export const authService = new AuthService();
