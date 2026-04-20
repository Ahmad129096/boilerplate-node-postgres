import nodemailer from 'nodemailer';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { EmailOptions } from '@/types';

/**
 * Email service class for handling email sending
 */
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  /**
   * Verify the email transporter connection
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified successfully');
    } catch (error) {
      logger.error('Email service connection verification failed', error);
      // Don't throw error here, allow the application to start
      // Email functionality will be disabled until connection is restored
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: config.email.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { messageId: info.messageId, to: options.to });
      return true;
    } catch (error) {
      logger.error('Failed to send email', { error, to: options.to, subject: options.subject });
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const html = this.getWelcomeTemplate(firstName);
    return this.sendEmail({
      to: email,
      subject: 'Welcome to Our Platform!',
      html,
    });
  }

  /**
   * Send email verification email
   */
  async sendEmailVerification(email: string, firstName: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    const html = this.getEmailVerificationTemplate(firstName, verificationUrl);

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address',
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, firstName: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const html = this.getPasswordResetTemplate(firstName, resetUrl);

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html,
    });
  }

  /**
   * Get welcome email template
   */
  private getWelcomeTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Our Platform</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Our Platform!</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>Thank you for signing up! We're excited to have you on board.</p>
            <p>Your account has been successfully created. If you haven't already, please verify your email address to unlock all features.</p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to ${firstName}. If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get email verification template
   */
  private getEmailVerificationTemplate(firstName: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>Thank you for signing up! To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <p>Best regards,<br>The Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to ${firstName}. If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get password reset template
   */
  private getPasswordResetTemplate(firstName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>Best regards,<br>The Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to ${firstName}. If you didn't request this reset, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Export singleton instance
export const emailService = new EmailService();
