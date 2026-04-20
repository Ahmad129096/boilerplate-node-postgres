# Email System Documentation

## Overview

The backend includes a comprehensive email system built with Nodemailer that supports transactional emails, HTML templates, and multiple email providers. The system is designed to be easily extensible and provider-agnostic.

## Email Service Architecture

### Core Components

1. **EmailService Class**: Main service for sending emails
2. **HTML Templates**: Pre-built responsive email templates
3. **Provider Abstraction**: Easy switching between email providers
4. **Error Handling**: Robust error handling and logging

### Supported Features

- **HTML Email Templates**: Responsive, professional-looking emails
- **Template Variables**: Dynamic content insertion
- **Multiple Providers**: Gmail, SMTP, SendGrid (ready for extension)
- **Async Processing**: Non-blocking email sending
- **Error Recovery**: Retry logic and fallback handling

## Configuration

### Environment Variables

```env
# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# Optional: Frontend URL for email links
FRONTEND_URL="http://localhost:3000"
```

### Email Provider Setup

#### Gmail/Google Workspace
1. Enable 2-factor authentication
2. Generate an App Password
3. Use App Password in `SMTP_PASS`

#### Custom SMTP
```env
SMTP_HOST="smtp.yourprovider.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-username"
SMTP_PASS="your-password"
```

#### SendGrid (Future Enhancement)
```env
SENDGRID_API_KEY="your-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```

## Email Templates

### Template Structure

All email templates are responsive HTML with inline CSS for maximum email client compatibility.

### Welcome Email

**Trigger**: User registration

**Template Features**:
- Professional header with branding
- Personalized greeting
- Account information
- Call-to-action for email verification
- Footer with contact information

**HTML Structure**:
```html
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
      <p>Hi {{firstName}},</p>
      <p>Thank you for signing up! We're excited to have you on board.</p>
      <!-- Dynamic content -->
    </div>
    <div class="footer">
      <p>This email was sent to {{email}}.</p>
    </div>
  </div>
</body>
</html>
```

### Email Verification Email

**Trigger**: Email verification request

**Template Features**:
- Clear verification instructions
- Prominent verification button
- Fallback link for button-disabled clients
- Expiration information
- Security notice

**Key Elements**:
- Verification button with token link
- Expiration time (24 hours)
- Security warning about not sharing the link

### Password Reset Email

**Trigger**: Password reset request

**Template Features**:
- Security-focused design
- Clear reset instructions
- Prominent reset button
- Expiration information (1 hour)
- Security warning and support contact

**Key Elements**:
- Reset button with token link
- Short expiration for security
- Warning about not requesting the reset

## Email Service Implementation

### EmailService Class

```typescript
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    // Implementation with error handling
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    // Welcome email implementation
  }

  async sendEmailVerification(email: string, firstName: string, token: string): Promise<boolean> {
    // Verification email implementation
  }

  async sendPasswordReset(email: string, firstName: string, token: string): Promise<boolean> {
    // Password reset email implementation
  }
}
```

### Template Methods

Each email type has its own template method:

```typescript
private getWelcomeTemplate(firstName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <!-- Welcome email template -->
    </html>
  `;
}

private getEmailVerificationTemplate(firstName: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <!-- Verification email template -->
    </html>
  `;
}

private getPasswordResetTemplate(firstName: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <!-- Password reset email template -->
    </html>
  `;
}
```

## Usage Examples

### Basic Email Sending

```typescript
import { emailService } from '@/email';

// Send welcome email
await emailService.sendWelcomeEmail('user@example.com', 'John');

// Send verification email
await emailService.sendEmailVerification(
  'user@example.com',
  'John',
  'verification_token_123'
);

// Send password reset email
await emailService.sendPasswordReset(
  'user@example.com',
  'John',
  'reset_token_456'
);
```

### Custom Email Sending

```typescript
// Send custom email
const success = await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Custom Subject',
  html: '<h1>Custom HTML Content</h1>',
  text: 'Plain text fallback',
});

if (success) {
  console.log('Email sent successfully');
} else {
  console.log('Failed to send email');
}
```

### Template with Variables

```typescript
// Future enhancement: Template system
const success = await emailService.sendTemplateEmail({
  to: 'user@example.com',
  template: 'welcome',
  templateData: {
    firstName: 'John',
    verificationUrl: 'https://example.com/verify?token=abc123',
  },
});
```

## Error Handling

### Connection Verification

The EmailService automatically verifies the connection on startup:

```typescript
private async verifyConnection(): Promise<void> {
  try {
    await this.transporter.verify();
    logger.info('Email service connection verified successfully');
  } catch (error) {
    logger.error('Email service connection verification failed', error);
    // Application continues, email functionality disabled
  }
}
```

### Send Error Handling

```typescript
async sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const info = await this.transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { messageId: info.messageId });
    return true;
  } catch (error) {
    logger.error('Failed to send email', { error, to: options.to });
    return false;
  }
}
```

### Error Recovery Strategies

1. **Graceful Degradation**: Application continues if email fails
2. **Logging**: Detailed error logging for debugging
3. **Retry Logic**: Can be implemented for critical emails
4. **Fallback Providers**: Multiple email provider support

## Email Provider Switching

### Current Implementation

The system uses Nodemailer with SMTP, supporting any SMTP-compatible provider.

### Adding New Providers

#### SendGrid Integration

```typescript
// Future: SendGrid provider
export class SendGridEmailService extends EmailService {
  private sgMail: any;

  constructor() {
    super();
    this.sgMail = require('@sendgrid/mail');
    this.sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.sgMail.send({
        to: options.to,
        from: config.email.from,
        subject: options.subject,
        html: options.html,
      });
      return true;
    } catch (error) {
      logger.error('SendGrid email failed', error);
      return false;
    }
  }
}
```

#### Provider Factory Pattern

```typescript
// Future: Provider factory
export class EmailServiceFactory {
  static create(provider: string): EmailService {
    switch (provider) {
      case 'smtp':
        return new SMTPEmailService();
      case 'sendgrid':
        return new SendGridEmailService();
      case 'ses':
        return new SESEmailService();
      default:
        return new SMTPEmailService();
    }
  }
}
```

## Template Management

### Current Approach

Templates are embedded in the EmailService class as private methods.

### Future Enhancements

#### External Template Files

```typescript
// Future: External template loading
export class TemplateManager {
  async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf-8');
  }

  renderTemplate(template: string, data: Record<string, any>): string {
    // Use Handlebars or similar templating engine
    return Handlebars.compile(template)(data);
  }
}
```

#### Template Variables

```typescript
// Future: Template variable system
interface TemplateData {
  firstName: string;
  lastName: string;
  email: string;
  verificationUrl?: string;
  resetUrl?: string;
  companyName?: string;
  supportEmail?: string;
}
```

## Email Queue System

### Current Implementation

Emails are sent synchronously but don't block the main application flow.

### Future: Queue Implementation

```typescript
// Future: Queue-based email processing
export class EmailQueueService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('email processing', {
      redis: process.env.REDIS_URL,
    });
  }

  async addEmail(options: EmailOptions): Promise<void> {
    await this.queue.add('send-email', options, {
      attempts: 3,
      backoff: 'exponential',
    });
  }

  processQueue(): void {
    this.queue.process('send-email', async (job) => {
      const { options } = job.data;
      return await emailService.sendEmail(options);
    });
  }
}
```

## Testing

### Unit Testing

```typescript
describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
  });

  it('should send welcome email', async () => {
    const result = await emailService.sendWelcomeEmail(
      'test@example.com',
      'Test'
    );
    expect(result).toBe(true);
  });

  it('should handle send errors gracefully', async () => {
    // Mock transporter to throw error
    jest.spyOn(emailService['transporter'], 'sendMail')
      .mockRejectedValue(new Error('SMTP error'));

    const result = await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
    });

    expect(result).toBe(false);
  });
});
```

### Integration Testing

```typescript
describe('Email Integration', () => {
  it('should send real email in integration test', async () => {
    // Use test email service (like Mailtrap)
    const testEmailService = new EmailService();
    
    const result = await testEmailService.sendWelcomeEmail(
      'test@mailtrap.io',
      'Test User'
    );

    expect(result).toBe(true);
  });
});
```

## Performance Considerations

### Connection Pooling

Nodemailer automatically handles connection pooling for SMTP connections.

### Async Processing

Email sending is non-blocking and doesn't impact API response times.

### Rate Limiting

Consider email provider rate limits:
- Gmail: ~100 emails/day for personal accounts
- SendGrid: Based on plan
- Custom SMTP: Provider-specific

## Security Considerations

### Credential Management

- Store email credentials in environment variables
- Use app passwords instead of main passwords
- Rotate credentials regularly

### Content Security

- Sanitize user input in email content
- Use HTTPS for verification/reset links
- Include security warnings in emails

### Anti-Spam Compliance

- Include unsubscribe links (for marketing emails)
- Follow CAN-SPAM regulations
- Use proper authentication (SPF, DKIM)

## Monitoring and Analytics

### Email Metrics

Track these metrics:
- Send success rate
- Delivery rate
- Open rate
- Click rate
- Bounce rate

### Implementation

```typescript
// Future: Email analytics
export class EmailAnalytics {
  async trackSent(email: string, template: string): Promise<void> {
    // Track email sent event
  }

  async trackOpened(email: string): Promise<void> {
    // Track email opened (using tracking pixel)
  }

  async trackClicked(email: string, link: string): Promise<void> {
    // Track link clicked (using redirect URLs)
  }
}
```

## Best Practices

### For Developers

1. **Use responsive HTML templates** for mobile compatibility
2. **Include plain text fallbacks** for accessibility
3. **Test across email clients** (Gmail, Outlook, Apple Mail)
4. **Handle errors gracefully** without exposing sensitive data
5. **Log email events** for debugging and analytics

### For Operations

1. **Monitor email deliverability** and sender reputation
2. **Set up proper DNS records** (SPF, DKIM, DMARC)
3. **Implement bounce handling** and list cleaning
4. **Use dedicated IP addresses** for high-volume sending
5. **Comply with anti-spam regulations**

## Future Enhancements

### Planned Features

1. **Template Engine**: Handlebars or Mustache for dynamic templates
2. **Email Queue**: Redis-based queue for reliable delivery
3. **Multiple Providers**: SendGrid, SES, Mailgun integration
4. **Analytics**: Email open and click tracking
5. **A/B Testing**: Template performance testing
6. **Scheduled Emails**: Delayed and recurring email sending

### Advanced Features

1. **Email Personalization**: Dynamic content based on user data
2. **Multi-language Support**: Localized email templates
3. **Email Preview**: Template preview before sending
4. **Bulk Email**: Efficient bulk email processing
5. **Webhook Integration**: Real-time delivery status updates

This email system provides a solid foundation for transactional emails and can be extended with advanced features as the application grows.
