# Database Documentation

## Overview

This backend uses PostgreSQL as the primary database with Prisma ORM for type-safe database operations. The database schema is designed to support user authentication, email verification, and password reset functionality.

## Prisma Schema

### Database Provider
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Models

#### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String?
  lastName  String?
  isActive  Boolean  @default(true)
  isVerified Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  passwordResetTokens PasswordResetToken[]
  emailVerificationTokens EmailVerificationToken[]

  @@map("users")
}
```

**Fields Explanation**:
- `id`: Primary key using CUID for globally unique identifiers
- `email`: Unique email address for user identification
- `password`: Hashed password using bcrypt
- `firstName`, `lastName`: Optional user profile information
- `isActive`: Account status (active/deactivated)
- `isVerified`: Email verification status
- `createdAt`, `updatedAt`: Automatic timestamps
- `@@map("users")`: Maps to the "users" table in PostgreSQL

#### PasswordResetToken Model
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("password_reset_tokens")
}
```

**Fields Explanation**:
- `token`: Unique token for password reset
- `userId`: Foreign key referencing the user
- `expiresAt`: Token expiration timestamp
- `onDelete: Cascade`: Automatically deletes tokens when user is deleted

#### EmailVerificationToken Model
```prisma
model EmailVerificationToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("email_verification_tokens")
}
```

**Fields Explanation**:
- `token`: Unique token for email verification
- `userId`: Foreign key referencing the user
- `expiresAt`: Token expiration timestamp
- `onDelete: Cascade`: Automatically deletes tokens when user is deleted

## Relationships

### User-PasswordResetToken Relationship
- **Type**: One-to-Many
- **Description**: A user can have multiple password reset tokens (though typically only one active)
- **Cascade**: Tokens are automatically deleted when the user is deleted

### User-EmailVerificationToken Relationship
- **Type**: One-to-Many
- **Description**: A user can have multiple email verification tokens
- **Cascade**: Tokens are automatically deleted when the user is deleted

## Database Operations

### Prisma Client Setup
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'info', 'warn'],
});
```

### Common Operations

#### User Operations
```typescript
// Create user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: hashedPassword,
    firstName: 'John',
    lastName: 'Doe',
  },
});

// Find user by email
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
});

// Update user
const user = await prisma.user.update({
  where: { id: userId },
  data: { isVerified: true },
});

// Delete user
await prisma.user.delete({
  where: { id: userId },
});
```

#### Token Operations
```typescript
// Create password reset token
const resetToken = await prisma.passwordResetToken.create({
  data: {
    token: randomToken,
    userId: userId,
    expiresAt: expirationDate,
  },
});

// Find valid token
const token = await prisma.passwordResetToken.findUnique({
  where: { token: tokenString },
  include: { user: true },
});

// Delete expired tokens
await prisma.passwordResetToken.deleteMany({
  where: {
    expiresAt: { lt: new Date() },
  },
});
```

## Migration Workflow

### Setting Up Migrations

1. **Initialize Prisma** (if not already done):
```bash
npx prisma init
```

2. **Create Initial Migration**:
```bash
npx prisma migrate dev --name init
```

### Making Schema Changes

1. **Update Schema**: Modify `prisma/schema.prisma`

2. **Generate Migration**:
```bash
npx prisma migrate dev --name describe_changes
```

3. **Apply Migration**:
```bash
npx prisma migrate deploy
```

### Migration Commands

#### Development
```bash
# Create and apply migration
npx prisma migrate dev --name migration_name

# Reset database (deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

#### Production
```bash
# Apply pending migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Migration Files

Migration files are stored in `prisma/migrations/` with the structure:
```
prisma/migrations/
|-- 20230101000000_init/
|   |-- migration.sql
|   `-- README.md
|-- 20230102000000_add_user_fields/
|   |-- migration.sql
|   `-- README.md
`-- _migration.lock
```

## Database Seeding

### Seed Script
Create `prisma/seed.ts` for populating initial data:

```typescript
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      isVerified: true,
    },
  });

  console.log('Admin user created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Running Seeds
```bash
npx prisma db seed
```

## Database Configuration

### Environment Variables
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Connection Pooling
Prisma automatically handles connection pooling. For production, consider:

```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

## Performance Considerations

### Indexing
The schema includes indexes on:
- `email` (unique) for fast user lookups
- `token` (unique) for fast token validation

### Query Optimization
```typescript
// Efficient queries with select
const user = await prisma.user.findUnique({
  where: { email },
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    isVerified: true,
  },
});

// Include related data efficiently
const userWithTokens = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    passwordResetTokens: {
      where: { expiresAt: { gt: new Date() } },
    },
  },
});
```

### Database Cleanup
Implement cleanup jobs for expired tokens:

```typescript
// Cleanup expired tokens
async function cleanupExpiredTokens() {
  await prisma.passwordResetToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  await prisma.emailVerificationToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}
```

## Backup and Recovery

### PostgreSQL Backup
```bash
# Create backup
pg_dump -h localhost -U username -d database_name > backup.sql

# Restore backup
psql -h localhost -U username -d database_name < backup.sql
```

### Prisma Studio
Use Prisma Studio for database inspection:
```bash
npx prisma studio
```

## Security Considerations

### Password Storage
- Use bcrypt for password hashing
- Minimum 12 salt rounds
- Never store plain text passwords

### Token Security
- Use cryptographically secure random tokens
- Set appropriate expiration times
- Clean up expired tokens regularly

### Database Access
- Use environment variables for credentials
- Limit database user permissions
- Use SSL connections in production

## Troubleshooting

### Common Issues

#### Migration Conflicts
```bash
# Resolve migration conflicts
npx prisma migrate resolve --rolled-back migration_name
```

#### Connection Issues
```bash
# Test database connection
npx prisma db pull
```

#### Client Generation
```bash
# Regenerate Prisma Client
npx prisma generate
```

### Debug Mode
Enable query logging in development:
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Future Enhancements

### Planned Features
- Soft delete functionality
- Audit logging
- Database views for complex queries
- Read replicas for scaling

### Schema Extensions
- User roles and permissions
- Multi-tenant support
- User preferences and settings
- Activity logging

This database design provides a solid foundation for user authentication and can be easily extended as the application grows.
