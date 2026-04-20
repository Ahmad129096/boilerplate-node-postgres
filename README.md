# Production-Ready Node.js Backend Boilerplate

A comprehensive, production-ready backend boilerplate built with Node.js, TypeScript, Express, PostgreSQL, and Prisma. Features include JWT authentication, email verification, password reset, and comprehensive security measures.

## Features

- **Modern Tech Stack**: Node.js, TypeScript, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with access/refresh tokens
- **Security**: bcrypt, Helmet, CORS, rate limiting
- **Email**: Nodemailer with HTML templates
- **Validation**: Zod schemas for input validation
- **Logging**: Structured logging with Pino
- **Documentation**: Comprehensive API and architecture docs
- **Type Safety**: Full TypeScript support
- **Testing Ready**: Jest configuration included

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend-boilerplate
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

4. **Set up the database**
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed the database
npm run db:seed
```

5. **Start the development server**
```bash
npm run dev
```

The server will start at `http://localhost:3000`

## Project Structure

```
backend-boilerplate/
|-- .env.example              # Environment variables template
|-- .eslintrc.json           # ESLint configuration
|-- package.json              # Project dependencies and scripts
|-- tsconfig.json            # TypeScript configuration
|-- prisma/                  # Database schema and migrations
|   |-- schema.prisma        # Prisma schema definition
|   `-- migrations/          # Database migration files
|-- src/                     # Source code
|   |-- controllers/         # HTTP request handlers
|   |-- services/            # Business logic
|   |-- routes/              # API routes
|   |-- middleware/          # Express middleware
|   |-- modules/             # Feature modules (extensible)
|   |-- config/              # Configuration management
|   |-- utils/               # Utility functions
|   |-- types/               # TypeScript type definitions
|   |-- db/                  # Database connection
|   |-- email/               # Email service
|   |-- app.ts               # Express app configuration
|   `-- index.ts             # Application entry point
|-- docs/                    # Documentation
|   |-- overview.md          # System architecture
|   |-- folder-structure.md  # Project structure explanation
|   |-- database.md           # Database documentation
|   |-- auth-flow.md          # Authentication workflows
|   |-- api.md               # API documentation
|   |-- email.md             # Email system documentation
|   |-- env.md                # Environment variables
|   `-- security.md          # Security best practices
`-- dist/                    # Compiled JavaScript (generated)
```

## Available Scripts

### Development
```bash
npm run dev          # Start development server with hot reload
npm run build         # Build for production
npm run start         # Start production server
```

### Database
```bash
npm run db:generate  # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Run database migrations
npm run db:studio     # Open Prisma Studio
npm run db:seed       # Seed database with sample data
```

### Code Quality
```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues automatically
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
```

## API Documentation

### Base URL
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJ..."
}
```

#### Forgot Password
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_string",
  "password": "NewPassword123!"
}
```

#### Verify Email
```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_string"
}
```

#### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

### Health Check
```http
GET /health
```

For complete API documentation, see [docs/api.md](docs/api.md).

## Authentication Flow

### 1. User Registration
1. User submits registration form
2. Server validates input and hashes password
3. User is created in database (unverified)
4. Email verification token is generated and sent
5. JWT tokens are returned to client

### 2. Email Verification
1. User clicks verification link in email
2. Frontend sends token to verification endpoint
3. Server validates token and marks user as verified
4. User can now fully use the application

### 3. Login
1. User submits credentials
2. Server validates credentials and account status
3. JWT access and refresh tokens are generated
4. Tokens are returned to client

### 4. Token Refresh
1. Client sends refresh token when access token expires
2. Server validates refresh token
3. New access token is generated and returned

### 5. Password Reset
1. User requests password reset
2. Reset token is generated and emailed
3. User clicks reset link and submits new password
4. Password is updated and token is invalidated

## Database Setup

### PostgreSQL Configuration

1. **Create database**:
```sql
CREATE DATABASE your_database_name;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_user;
```

2. **Update environment variables**:
```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/your_database_name"
```

3. **Run migrations**:
```bash
npm run db:migrate
```

### Database Schema

The application uses the following main models:

- **User**: User accounts with authentication data
- **PasswordResetToken**: Password reset tokens
- **EmailVerificationToken**: Email verification tokens

For detailed database documentation, see [docs/database.md](docs/database.md).

## Email Configuration

### Gmail Setup (Development)

1. **Enable 2-factor authentication** on your Google account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a new app password
3. **Update environment variables**:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Production Email Services

For production, consider using:
- **SendGrid**: Transactional email service
- **Amazon SES**: AWS email service
- **Mailgun**: Email API service

For detailed email configuration, see [docs/email.md](docs/email.md).

## Security Features

### Authentication Security
- **JWT Tokens**: Access (15min) + Refresh (7 days) tokens
- **Password Hashing**: bcrypt with 12 salt rounds
- **Email Verification**: Required for account activation
- **Rate Limiting**: 100 requests per 15 minutes per IP

### API Security
- **CORS**: Configurable origin whitelisting
- **Security Headers**: Helmet middleware
- **Input Validation**: Zod schema validation
- **Error Handling**: Secure error messages

### Data Protection
- **Environment Variables**: Secure configuration management
- **Database Security**: SSL connections, connection pooling
- **Logging**: Structured logging without sensitive data

For comprehensive security documentation, see [docs/security.md](docs/security.md).

## Environment Variables

### Required Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### Optional Variables
```env
# Server
PORT=3000
NODE_ENV="development"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN="http://localhost:3000"

# Frontend URL for email links
FRONTEND_URL="http://localhost:3000"
```

For complete environment variable documentation, see [docs/env.md](docs/env.md).

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
```
tests/
|-- unit/                    # Unit tests
|-- integration/             # Integration tests
|-- fixtures/                # Test data
|-- mocks/                   # Mock implementations
`-- helpers/                 # Test utilities
```

### Example Test
```typescript
describe('Auth Controller', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Environment Setup
1. **Set production environment variables**
2. **Configure SSL certificates**
3. **Set up reverse proxy (nginx)**
4. **Configure monitoring and logging**
5. **Set up database backups**

### Health Checks
- **Application Health**: `GET /health`
- **Database Health**: Connection monitoring
- **Email Service**: SMTP connection verification

## Development Guide

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for security and quality
- **File Naming**: PascalCase for classes, camelCase for files
- **Imports**: Absolute imports with path mapping

### Adding New Features
1. **Create module** in `src/modules/[feature]/`
2. **Define types** in `src/types/`
3. **Implement services** in `src/services/`
4. **Add controllers** in `src/controllers/`
5. **Define routes** in `src/routes/`
6. **Write tests** for the new feature
7. **Update documentation**

### Debugging
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Database debugging
npx prisma studio

# API testing
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'
```

## Monitoring and Logging

### Logging
- **Structured JSON logs** with Pino
- **Log levels**: fatal, error, warn, info, debug, trace
- **Request logging**: HTTP requests with timing
- **Error tracking**: Detailed error logging

### Monitoring
- **Health endpoints**: Application and database health
- **Performance metrics**: Request timing and database queries
- **Security events**: Authentication failures and suspicious activity

### Log Example
```json
{
  "level": "info",
  "time": 1640995200000,
  "pid": 12345,
  "hostname": "backend-server",
  "msg": "User login successful",
  "userId": "cuid...",
  "email": "user@example.com",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

## Contributing

### Development Workflow
1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** with proper tests
4. **Run tests**: `npm test`
5. **Lint code**: `npm run lint`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push branch**: `git push origin feature/amazing-feature`
8. **Create pull request**

### Code Review Guidelines
- **Security**: Ensure no security vulnerabilities
- **Performance**: Check for performance implications
- **Testing**: Verify adequate test coverage
- **Documentation**: Update relevant documentation
- **TypeScript**: Maintain type safety

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check database connection
npx prisma db pull

# Reset database
npx prisma migrate reset
```

#### Environment Variables
```bash
# Check loaded variables
node -e "console.log(process.env)"

# Validate configuration
node -e "require('./src/config')"
```

#### Email Issues
```bash
# Test email configuration
node -e "require('./src/email').emailService.verifyConnection()"
```

#### TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Clear cache
rm -rf node_modules/.cache
npm install
```

### Getting Help
- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue on GitHub
- **Community**: Join our Discord/Slack
- **Support**: Email support@yourdomain.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Express.js** - Web framework
- **Prisma** - Database ORM
- **TypeScript** - Type safety
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Zod** - Validation
- **Pino** - Logging
- **Helmet** - Security headers

## Roadmap

### Upcoming Features
- [ ] Two-factor authentication (2FA)
- [ ] Role-based access control (RBAC)
- [ ] File upload handling
- [ ] Real-time notifications (WebSockets)
- [ ] API documentation with Swagger/OpenAPI
- [ ] GraphQL endpoint
- [ ] Microservice architecture support
- [ ] Advanced caching with Redis
- [ ] Queue system for email processing

### Performance Improvements
- [ ] Database query optimization
- [ ] Response caching
- [ ] Request compression
- [ ] Load balancing support
- [ ] Horizontal scaling support

### Security Enhancements
- [ ] Advanced rate limiting
- [ ] IP whitelisting
- [ ] Account lockout
- [ ] Security audit logging
- [ ] Automated security scanning

---

**Built with love for the developer community!**

For more information, check out our [documentation](docs/) or [contact us](mailto:support@yourdomain.com).
