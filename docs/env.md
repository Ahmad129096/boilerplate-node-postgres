# Environment Variables Documentation

## Overview

This document explains all environment variables used in the backend boilerplate, their purposes, default values, and configuration requirements.

## Environment Files

### `.env.example`
Template file showing all required environment variables. Copy this to `.env` and fill with actual values.

### `.env`
Actual environment variables file (never commit to version control).

### `.env.local`
Local overrides for development (optional).

### `.env.production`
Production-specific variables (optional).

## Required Environment Variables

### Database Configuration

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

**Description**: PostgreSQL database connection string

**Format**: `postgresql://[user[:password]@][host][:port][/dbname][?param1=value1&...]`

**Examples**:
- Local: `postgresql://postgres:password@localhost:5432/myapp_dev`
- Production: `postgresql://user:pass@prod-db.example.com:5432/myapp_prod?sslmode=require`

**Notes**:
- Required for application startup
- Use SSL in production (`sslmode=require`)
- Store in secrets management system in production

---

### JWT Configuration

```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
```

**Description**: Secret keys for JWT token signing

**Requirements**:
- Minimum 32 characters long
- Use cryptographically secure random strings
- Different secrets for access and refresh tokens
- Never use default values in production

**Generation**:
```bash
# Generate secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### JWT Expiration Times

```env
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

**Description**: Token expiration times

**Formats**:
- `s` - seconds (e.g., `30s`)
- `m` - minutes (e.g., `15m`)
- `h` - hours (e.g., `2h`)
- `d` - days (e.g., `7d`)
- `w` - weeks (e.g., `2w`)

**Default Values**:
- Access token: 15 minutes
- Refresh token: 7 days

**Security Considerations**:
- Shorter access tokens reduce exposure if compromised
- Longer refresh tokens improve user experience
- Consider shorter refresh tokens for high-security applications

---

### Email Configuration

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

**Description**: SMTP email service configuration

**Provider Examples**:

**Gmail/Google Workspace**:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@domain.com"
SMTP_PASS="your-app-password"  # Use App Password, not regular password
```

**Outlook/Office 365**:
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
```

**Custom SMTP**:
```env
SMTP_HOST="smtp.yourprovider.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="username"
SMTP_PASS="password"
```

**Notes**:
- `SMTP_SECURE=true` for port 465 (SSL)
- `SMTP_SECURE=false` for port 587 (STARTTLS)
- Use app-specific passwords when available
- Consider transactional email services for production

---

### Server Configuration

```env
PORT=3000
NODE_ENV="development"
```

**Description**: Basic server configuration

**PORT**:
- Default: `3000`
- Can be any available port
- Override with `PORT` environment variable

**NODE_ENV**:
- `development` - Verbose logging, debug features
- `production` - Optimized logging, security features
- `test` - Testing configuration

---

### Rate Limiting

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Description**: API rate limiting configuration

**RATE_LIMIT_WINDOW_MS**:
- Time window in milliseconds
- Default: 900000 (15 minutes)
- Format: Number

**RATE_LIMIT_MAX_REQUESTS**:
- Maximum requests per window
- Default: 100
- Format: Number

**Examples**:
```env
# Stricter limits
RATE_LIMIT_WINDOW_MS=300000    # 5 minutes
RATE_LIMIT_MAX_REQUESTS=20     # 20 requests per 5 minutes

# More lenient limits
RATE_LIMIT_WINDOW_MS=3600000   # 1 hour
RATE_LIMIT_MAX_REQUESTS=1000    # 1000 requests per hour
```

---

### CORS Configuration

```env
CORS_ORIGIN="http://localhost:3000"
```

**Description**: Cross-Origin Resource Sharing configuration

**Single Origin**:
```env
CORS_ORIGIN="https://yourdomain.com"
```

**Multiple Origins** (comma-separated):
```env
CORS_ORIGIN="https://yourdomain.com,https://app.yourdomain.com"
```

**Wildcard** (development only):
```env
CORS_ORIGIN="*"
```

**Notes**:
- Never use wildcard in production
- Include all frontend domains
- Include protocol (http:// or https://)

---

## Optional Environment Variables

### Frontend URL

```env
FRONTEND_URL="http://localhost:3000"
```

**Description**: Base URL for frontend application

**Usage**:
- Email verification links
- Password reset links
- Redirect URLs

**Examples**:
```env
# Development
FRONTEND_URL="http://localhost:3000"

# Production
FRONTEND_URL="https://yourdomain.com"

# With subdirectory
FRONTEND_URL="https://yourdomain.com/app"
```

---

### Logging Configuration

```env
LOG_LEVEL="info"
```

**Description**: Logging verbosity level

**Levels**:
- `fatal` - Only fatal errors
- `error` - Errors and fatal
- `warn` - Warnings, errors, and fatal
- `info` - Info, warnings, errors, and fatal (default)
- `debug` - Debug, info, warnings, errors, and fatal
- `trace` - All logs

**Examples**:
```env
# Production
LOG_LEVEL="info"

# Development
LOG_LEVEL="debug"

# Troubleshooting
LOG_LEVEL="trace"
```

---

### Hostname Configuration

```env
HOSTNAME="backend-server"
```

**Description**: Server hostname for logging and identification

**Usage**:
- Log identification
- Service discovery
- Monitoring

**Default**: `localhost`

---

## Production Configuration

### Security Best Practices

1. **Use Strong Secrets**:
```bash
# Generate secure JWT secrets
JWT_SECRET=$(openssl rand -hex 64)
JWT_REFRESH_SECRET=$(openssl rand -hex 64)
```

2. **Enable SSL**:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

3. **Restrict CORS**:
```env
CORS_ORIGIN="https://yourdomain.com"
```

4. **Use Environment-Specific Values**:
```env
NODE_ENV="production"
LOG_LEVEL="info"
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Security

```env
# Production database with SSL
DATABASE_URL="postgresql://app_user:secure_password@db.example.com:5432/production_db?sslmode=require&sslcert=/path/to/cert.pem&sslkey=/path/to/key.pem"

# Connection pooling
DATABASE_URL="postgresql://app_user:secure_password@db.example.com:5432/production_db?sslmode=require&max_pool_size=20"
```

### Email Service Configuration

**Production Email Services**:

**SendGrid**:
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="apikey"
SMTP_PASS="SG.your-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```

**Amazon SES**:
```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-access-key-id"
SMTP_PASS="your-secret-access-key"
EMAIL_FROM="noreply@yourdomain.com"
```

### Monitoring and Observability

```env
# Application monitoring
LOG_LEVEL="info"
HOSTNAME="prod-backend-1"

# Performance monitoring (optional)
NEW_RELIC_LICENSE_KEY="your-new-relic-key"
DATADOG_API_KEY="your-datadog-key"
```

## Development Configuration

### Local Development

```env
# .env for development
DATABASE_URL="postgresql://postgres:password@localhost:5432/myapp_dev"
JWT_SECRET="development-secret-key-not-for-production"
JWT_REFRESH_SECRET="development-refresh-secret-not-for-production"
SMTP_HOST="smtp.mailtrap.io"  # Use Mailtrap for development
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER="mailtrap-user"
SMTP_PASS="mailtrap-pass"
EMAIL_FROM="dev@localhost"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000  # More lenient for development
FRONTEND_URL="http://localhost:3000"
LOG_LEVEL="debug"
```

### Testing Configuration

```env
# .env.test for testing
DATABASE_URL="postgresql://postgres:password@localhost:5432/myapp_test"
JWT_SECRET="test-secret-key"
JWT_REFRESH_SECRET="test-refresh-secret-key"
PORT=3001
NODE_ENV="test"
CORS_ORIGIN="*"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10000  # Very high for testing
EMAIL_FROM="test@localhost"
LOG_LEVEL="error"  # Minimal logging for tests
```

## Environment Variable Validation

The application validates required environment variables on startup:

```typescript
// Required variables check
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}
```

## Configuration Loading

Environment variables are loaded in this order:

1. `.env` file (if exists)
2. System environment variables
3. Default values (where applicable)

```typescript
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Configuration with defaults
const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  // ... other config
};
```

## Security Considerations

### Secret Management

**Development**:
- Use `.env` file
- Never commit `.env` to version control
- Use strong secrets even in development

**Production**:
- Use secrets management system (AWS Secrets Manager, Azure Key Vault, etc.)
- Rotate secrets regularly
- Use different secrets per environment
- Implement secret scanning in CI/CD

### Environment Isolation

**Development Environment**:
```env
NODE_ENV="development"
DATABASE_URL="postgresql://localhost/dev_db"
JWT_SECRET="dev-secret"
```

**Staging Environment**:
```env
NODE_ENV="production"
DATABASE_URL="postgresql://staging-db/staging_db"
JWT_SECRET="staging-secret"
```

**Production Environment**:
```env
NODE_ENV="production"
DATABASE_URL="postgresql://prod-db/prod_db"
JWT_SECRET="prod-secret"
```

### Common Security Mistakes

1. **Committing `.env` files** - Add to `.gitignore`
2. **Using default secrets** - Always generate unique secrets
3. **Hardcoding values** - Use environment variables
4. **Sharing secrets** - Use secure sharing methods
5. **Weak secrets** - Use cryptographically secure random strings

## Troubleshooting

### Common Issues

**Missing Environment Variables**:
```
Error: Missing required environment variables: DATABASE_URL, JWT_SECRET
```

**Invalid Database URL**:
```
Error: Invalid connection string
```

**JWT Secret Too Short**:
```
Error: JWT secret must be at least 32 characters
```

### Debugging Environment Variables

```bash
# Check loaded environment variables
node -e "console.log(process.env)"

# Test configuration loading
node -e "require('./src/config').console.log(config)"

# Verify database connection
npx prisma db pull
```

### Environment Variable Tools

**dotenv-cli**:
```bash
# Load .env and run command
dotenv -- npm run dev

# Load specific env file
dotenv -e .env.production -- npm start
```

**env-cmd**:
```bash
# Use specific environment file
env-cmd .env.production npm start
```

## Best Practices Summary

1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for each environment
3. **Validate required variables** on application startup
4. **Document all environment variables** and their purposes
5. **Use different configurations** for development, staging, and production
6. **Implement proper secret management** in production
7. **Regularly rotate secrets** and update configurations
8. **Monitor configuration changes** and security events

This environment configuration system provides flexibility, security, and maintainability for different deployment scenarios.
