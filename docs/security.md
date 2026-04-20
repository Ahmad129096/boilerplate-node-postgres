# Security Documentation

## Overview

This document outlines the security measures implemented in the backend boilerplate, best practices for secure development, and guidelines for maintaining a secure application.

## Authentication Security

### JWT Implementation

#### Token Structure
```json
{
  "userId": "cuid...",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234568790
}
```

#### Security Features
- **Short-lived Access Tokens**: 15 minutes expiration
- **Long-lived Refresh Tokens**: 7 days expiration
- **Strong Secret Keys**: Minimum 32 characters
- **HS256 Algorithm**: Secure signing algorithm

#### Token Storage Recommendations
- **Access Tokens**: Memory or sessionStorage (short-lived)
- **Refresh Tokens**: httpOnly, secure cookies
- **Never store tokens in localStorage** (XSS vulnerability)

### Password Security

#### Hashing Implementation
```typescript
import bcrypt from 'bcryptjs';

// Hash password with 12 salt rounds
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

#### Security Features
- **bcrypt**: Industry-standard password hashing
- **12 Salt Rounds**: Strong computational cost
- **Never store plain text passwords**
- **Password complexity requirements**

#### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Optional: Special characters

### Email Verification

#### Security Flow
1. **Registration**: User created with `isVerified: false`
2. **Email Sent**: Verification token with 24-hour expiration
3. **Verification**: Token validates and marks account as verified
4. **Token Cleanup**: Expired tokens automatically cleaned

#### Security Features
- **Unique Tokens**: Cryptographically secure random strings
- **Expiration**: 24-hour validity period
- **Single Use**: Tokens deleted after use
- **Rate Limiting**: Prevent email bombing

### Password Reset

#### Security Flow
1. **Request**: User requests password reset
2. **Token Generation**: Secure token with 1-hour expiration
3. **Email Sent**: Reset link with token
4. **Validation**: Token validates and allows password change
5. **Token Cleanup**: Token deleted after use

#### Security Features
- **Short Expiration**: 1-hour validity
- **Single Use**: Tokens deleted after use
- **Secure Tokens**: 32-character random strings
- **No Information Leakage**: Same response for existing/non-existing emails

## API Security

### Rate Limiting

#### Implementation
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP',
});
```

#### Rate Limits
- **General API**: 100 requests per 15 minutes
- **Auth Endpoints**: Stricter limits recommended
- **Password Reset**: Very strict limits (5 per hour)

#### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Input Validation

#### Zod Validation
```typescript
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
});
```

#### Validation Features
- **Type Safety**: Runtime type checking
- **Sanitization**: Input sanitization and validation
- **Error Messages**: User-friendly error messages
- **SQL Injection Prevention**: Through Prisma ORM

### CORS Security

#### Configuration
```typescript
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

#### Security Features
- **Origin Whitelisting**: Only allowed domains
- **Credential Support**: Secure cookie handling
- **Method Restrictions**: Limited HTTP methods
- **Header Control**: Specific allowed headers

### Security Headers

#### Helmet Implementation
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

#### Security Headers Included
- **X-Frame-Options**: Prevent clickjacking
- **X-Content-Type-Options**: Prevent MIME sniffing
- **X-XSS-Protection**: XSS protection
- **Strict-Transport-Security**: HTTPS enforcement
- **Content-Security-Policy**: Content restrictions

## Data Security

### Database Security

#### Connection Security
```env
# Production database with SSL
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

#### Security Features
- **SSL Connections**: Encrypted database connections
- **Connection Pooling**: Efficient connection management
- **Prisma ORM**: SQL injection prevention
- **Least Privilege**: Limited database user permissions

#### Sensitive Data Handling
- **Password Hashing**: Never store plain passwords
- **Token Expiration**: Automatic cleanup of expired tokens
- **Data Minimization**: Only store necessary data
- **Audit Logging**: Log sensitive operations

### Environment Variable Security

#### Secret Management
```typescript
// Validate required secrets
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}
```

#### Security Practices
- **Never commit secrets** to version control
- **Use strong secrets**: Minimum 32 characters
- **Environment isolation**: Different secrets per environment
- **Regular rotation**: Change secrets periodically

## Error Handling Security

### Information Disclosure Prevention

#### Error Messages
```typescript
// Don't expose sensitive information
res.status(401).json({
  success: false,
  message: 'Invalid email or password', // Generic message
});

// Instead of:
res.status(401).json({
  success: false,
  message: 'User not found with email: user@example.com', // Too specific
});
```

#### Security Features
- **Generic Error Messages**: Don't reveal system details
- **Stack Trace Control**: Only in development
- **Error Logging**: Detailed logs for debugging
- **Status Code Consistency**: Proper HTTP status codes

### Logging Security

#### Structured Logging
```typescript
logger.error('Authentication failed', {
  email: email, // Log attempt but not password
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString(),
});
```

#### Security Features
- **No Password Logging**: Never log passwords
- **PII Protection**: Limit personal information in logs
- **Secure Transport**: Logs sent to secure logging service
- **Log Retention**: Appropriate retention policies

## Common Vulnerabilities and Protections

### OWASP Top 10 Protections

#### 1. Injection
- **Protection**: Prisma ORM with parameterized queries
- **Validation**: Input validation with Zod
- **Sanitization**: Input sanitization and escaping

#### 2. Broken Authentication
- **Protection**: JWT with proper expiration
- **Password Security**: Strong hashing and complexity
- **Session Management**: Secure token handling

#### 3. Sensitive Data Exposure
- **Protection**: HTTPS enforcement
- **Data Encryption**: Encrypted database connections
- **Environment Security**: Secure secret management

#### 4. XML External Entities (XXE)
- **Protection**: No XML parsing in current implementation
- **Input Validation**: General input validation practices

#### 5. Broken Access Control
- **Protection**: Role-based authentication middleware
- **Authorization**: Proper access control checks
- **Route Protection**: Middleware-based protection

#### 6. Security Misconfiguration
- **Protection**: Security headers with Helmet
- **Environment Configuration**: Proper environment setup
- **Default Credentials**: No default passwords/secrets

#### 7. Cross-Site Scripting (XSS)
- **Protection**: Content Security Policy
- **Input Validation**: Proper input validation
- **Output Encoding**: Safe response formatting

#### 8. Insecure Deserialization
- **Protection**: Limited deserialization
- **Validation**: Input validation for serialized data
- **Type Safety**: TypeScript type checking

#### 9. Using Components with Known Vulnerabilities
- **Protection**: Regular dependency updates
- **Security Scanning**: Automated vulnerability scanning
- **Package Monitoring**: Dependabot or similar tools

#### 10. Insufficient Logging & Monitoring
- **Protection**: Comprehensive logging
- **Security Events**: Authentication failure logging
- **Monitoring**: Error tracking and monitoring

### Additional Security Measures

#### CSRF Protection
```typescript
// Future: CSRF token implementation
app.use(csrf({ cookie: true }));
```

#### IP-based Restrictions
```typescript
// Future: IP whitelisting for admin endpoints
const adminIPWhitelist = ['192.168.1.100', '10.0.0.50'];
```

#### Account Lockout
```typescript
// Future: Account lockout after failed attempts
if (failedAttempts >= 5) {
  await lockUserAccount(userId);
}
```

## Development Security Practices

### Secure Coding Guidelines

#### Input Validation
```typescript
// Always validate input
const validatedData = signupSchema.parse(req.body);

// Never trust user input
const user = await prisma.user.findUnique({
  where: { email: req.body.email }, // Validate first!
});
```

#### Error Handling
```typescript
// Handle errors securely
try {
  await sensitiveOperation();
} catch (error) {
  logger.error('Operation failed', { error: error.message });
  res.status(500).json({
    success: false,
    message: 'Internal server error', // Generic message
  });
}
```

#### Secret Management
```typescript
// Use environment variables, never hardcode
const jwtSecret = process.env.JWT_SECRET;

// Never do this:
const jwtSecret = 'hardcoded-secret-key'; // INSECURE!
```

### Code Review Checklist

#### Authentication
- [ ] JWT secrets are properly configured
- [ ] Password hashing uses bcrypt with sufficient rounds
- [ ] Token expiration times are appropriate
- [ ] Rate limiting is implemented on auth endpoints

#### Data Protection
- [ ] Environment variables are used for secrets
- [ ] Database connections use SSL in production
- [ ] Sensitive data is not logged
- [ ] Input validation is implemented

#### API Security
- [ ] CORS is properly configured
- [ ] Security headers are implemented
- [ ] Rate limiting is configured
- [ ] Error messages don't expose sensitive information

## Testing Security

### Security Testing

#### Authentication Testing
```typescript
describe('Authentication Security', () => {
  it('should reject weak passwords', async () => {
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'weak', // Too weak
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors.password).toBeDefined();
  });

  it('should rate limit login attempts', async () => {
    // Make multiple login attempts
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
    }

    // Should be rate limited
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(429);
  });
});
```

#### Input Validation Testing
```typescript
describe('Input Validation Security', () => {
  it('should sanitize SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: maliciousInput,
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(400);
    // Database should still be intact
  });
});
```

### Security Scanning

#### Dependency Scanning
```bash
# Audit dependencies for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Automated scanning in CI/CD
npm audit --audit-level moderate
```

#### Code Analysis
```bash
# ESLint security rules
npx eslint src/ --plugin security

# TypeScript strict mode
npx tsc --noEmit --strict
```

## Monitoring and Incident Response

### Security Monitoring

#### Authentication Events
```typescript
// Log authentication events
logger.info('User login', {
  userId: user.id,
  email: user.email,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString(),
});

logger.warn('Failed login attempt', {
  email: req.body.email,
  ip: req.ip,
  reason: 'invalid_credentials',
});
```

#### Security Metrics
- Failed login attempts per IP
- Password reset requests per email
- Unusual access patterns
- Rate limit violations

### Incident Response

#### Security Incident Checklist
1. **Identify**: Detect security incident
2. **Contain**: Isolate affected systems
3. **Investigate**: Determine scope and impact
4. **Remediate**: Fix vulnerabilities
5. **Communicate**: Notify stakeholders
6. **Review**: Improve processes

#### Response Procedures
```typescript
// Example: Security event logging
class SecurityMonitor {
  static logSuspiciousActivity(event: string, details: any) {
    logger.error('Security event detected', {
      event,
      details,
      timestamp: new Date().toISOString(),
      severity: 'high'
    });
    
    // Trigger alerting system
    this.sendAlert(event, details);
  }
}
```

## Compliance and Regulations

### Data Protection

#### GDPR Compliance
- **Data Minimization**: Only collect necessary data
- **User Consent**: Clear consent mechanisms
- **Data Portability**: Export user data on request
- **Right to Erasure**: Delete user data on request

#### Data Handling
```typescript
// GDPR: Delete user data
async function deleteUserAccount(userId: string) {
  await prisma.user.delete({
    where: { id: userId }
  });
  
  logger.info('User data deleted', { userId });
}
```

### Security Standards

#### ISO 27001 Considerations
- **Access Control**: Proper authentication and authorization
- **Asset Management**: Inventory of sensitive data
- **Incident Management**: Security incident procedures
- **Business Continuity**: Disaster recovery planning

## Future Security Enhancements

### Planned Features

#### Two-Factor Authentication (2FA)
```typescript
// Future: 2FA implementation
interface TwoFactorAuth {
  setupSecret(userId: string): Promise<string>;
  verifyCode(userId: string, code: string): Promise<boolean>;
  generateBackupCodes(userId: string): Promise<string[]>;
}
```

#### Session Management
```typescript
// Future: Session management
interface SessionManager {
  createSession(userId: string, deviceInfo: any): Promise<string>;
  revokeSession(sessionId: string): Promise<void>;
  listActiveSessions(userId: string): Promise<Session[]>;
}
```

#### Advanced Rate Limiting
```typescript
// Future: Advanced rate limiting
interface RateLimiter {
  checkLimit(identifier: string, endpoint: string): Promise<boolean>;
  getRemainingRequests(identifier: string): Promise<number>;
  setCustomLimit(identifier: string, limit: number): Promise<void>;
}
```

#### Security Headers Enhancement
```typescript
// Future: Enhanced security headers
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  expectCt: {
    maxAge: 86400,
    enforce: true
  }
}));
```

## Security Checklist

### Pre-Deployment Checklist

#### Authentication
- [ ] JWT secrets are strong and unique
- [ ] Password complexity requirements are enforced
- [ ] Rate limiting is configured on auth endpoints
- [ ] Email verification is working
- [ ] Password reset flow is secure

#### API Security
- [ ] CORS is properly configured for production
- [ ] Security headers are implemented
- [ ] Rate limiting is configured
- [ ] Input validation is implemented
- [ ] Error messages don't expose sensitive data

#### Data Protection
- [ ] Database connections use SSL
- [ ] Environment variables are secure
- [ ] Sensitive data is not logged
- [ ] Backup encryption is configured
- [ ] Data retention policies are defined

#### Monitoring
- [ ] Security events are logged
- [ ] Error tracking is configured
- [ ] Performance monitoring is set up
- [ ] Alerting is configured for security events
- [ ] Log aggregation is implemented

### Ongoing Security Tasks

#### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Review security logs weekly
- [ ] Audit user access quarterly
- [ ] Update secrets quarterly
- [ ] Security audit annually

#### Incident Response
- [ ] Security incident response plan
- [ ] Emergency contact procedures
- [ ] Communication templates
- [ ] Post-incident review process
- [ ] Security training for team

This security framework provides comprehensive protection for the backend application while maintaining usability and performance. Regular security reviews and updates are essential to maintain protection against evolving threats.
