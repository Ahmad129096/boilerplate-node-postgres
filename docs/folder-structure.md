# Folder Structure

This document explains the project's folder structure and the purpose of each directory and file.

## Root Directory Structure

```
backend-boilerplate/
|-- .env.example              # Environment variables template
|-- .eslintrc.json           # ESLint configuration
|-- package.json              # Project dependencies and scripts
|-- tsconfig.json            # TypeScript configuration
|-- prisma/                  # Database schema and migrations
|-- src/                     # Source code
|-- docs/                    # Documentation
|-- dist/                    # Compiled JavaScript (generated)
```

## Source Code Structure (`src/`)

The `src/` directory contains all the application source code, organized by feature and concern.

### `/src/controllers/`
**Purpose**: Handle HTTP requests and responses, orchestrate service calls.

**Files**:
- `authController.ts` - Authentication-related HTTP endpoints

**Responsibilities**:
- Parse incoming requests
- Call appropriate services
- Format and send responses
- Handle HTTP-specific concerns

### `/src/services/`
**Purpose**: Contain business logic and data operations.

**Files**:
- `authService.ts` - Authentication business logic

**Responsibilities**:
- Implement business rules
- Coordinate with database layer
- Handle complex operations
- Maintain data integrity

### `/src/routes/`
**Purpose**: Define API routes and connect them to controllers.

**Files**:
- `auth.ts` - Authentication routes

**Responsibilities**:
- Define API endpoints
- Apply middleware
- Route to appropriate controllers
- Organize API structure

### `/src/middleware/`
**Purpose**: Cross-cutting concerns that process requests before they reach controllers.

**Files**:
- `auth.ts` - Authentication middleware
- `validation.ts` - Input validation middleware
- `errorHandler.ts` - Global error handling

**Responsibilities**:
- Authenticate requests
- Validate input data
- Handle errors consistently
- Process common request concerns

### `/src/modules/`
**Purpose**: Feature-specific modules for larger applications.

**Structure**:
```
modules/
|-- auth/                    # Authentication module
|   |-- controllers/         # Auth-specific controllers
|   |-- services/           # Auth-specific services
|   |-- middleware/          # Auth-specific middleware
|   |-- types/              # Auth-specific types
|   `-- utils/              # Auth-specific utilities
`-- user/                    # User management module
    |-- controllers/
    |-- services/
    |-- middleware/
    |-- types/
    `-- utils/
```

**Current Status**: Ready for modular expansion as the application grows.

### `/src/config/`
**Purpose**: Configuration management and environment variables.

**Files**:
- `index.ts` - Main configuration file

**Responsibilities**:
- Load environment variables
- Validate required configurations
- Provide configuration access
- Environment-specific settings

### `/src/utils/`
**Purpose**: Shared utility functions and helpers.

**Files**:
- `auth.ts` - Authentication utilities (JWT, password hashing)
- `logger.ts` - Logging configuration
- `validation.ts` - Zod validation schemas

**Responsibilities**:
- Provide reusable functions
- Handle common operations
- Maintain utility logic
- Support cross-cutting concerns

### `/src/types/`
**Purpose**: TypeScript type definitions and interfaces.

**Files**:
- `index.ts` - Common type definitions

**Responsibilities**:
- Define data structures
- Create interface contracts
- Support type safety
- Document data shapes

### `/src/db/`
**Purpose**: Database connection and client configuration.

**Files**:
- `index.ts` - Prisma client setup and configuration

**Responsibilities**:
- Initialize database connection
- Configure Prisma client
- Handle connection events
- Provide database access

### `/src/email/`
**Purpose**: Email service and template management.

**Files**:
- `index.ts` - Email service implementation

**Responsibilities**:
- Send emails
- Manage email templates
- Handle email provider configuration
- Process email queues

## Database Structure (`prisma/`)

```
prisma/
|-- schema.prisma            # Database schema definition
|-- migrations/              # Database migration files
`-- seed.ts                  # Database seeding script (optional)
```

### `schema.prisma`
- Defines database models
- Configures database provider
- Specifies relationships
- Generates Prisma client

### `migrations/`
- Auto-generated migration files
- Database schema changes
- Rollback capabilities
- Version control for schema

## Documentation Structure (`docs/`)

```
docs/
|-- overview.md              # System architecture and tech stack
|-- folder-structure.md     # This file
|-- database.md              # Database schema and migrations
|-- auth-flow.md             # Authentication workflows
|-- api.md                   # API documentation
|-- email.md                 # Email system documentation
|-- env.md                   # Environment variables
`-- security.md              # Security best practices
```

## File Naming Conventions

### TypeScript Files
- **PascalCase** for classes and components: `AuthController.ts`
- **camelCase** for utilities and helpers: `authUtils.ts`
- **kebab-case** for documentation: `auth-flow.md`

### Directory Names
- **camelCase** for most directories: `controllers/`
- **kebab-case** for feature modules: `user-management/`

### Export Patterns
- **Default exports** for single classes/functions
- **Named exports** for multiple utilities
- **Barrel exports** (`index.ts`) for clean imports

## Import Patterns

### Absolute Imports
Using TypeScript path mapping for clean imports:

```typescript
// Instead of: import { AuthService } from '../../../services/authService'
// Use: import { AuthService } from '@/services/authService'

// Path mappings in tsconfig.json:
{
  "baseUrl": "./src",
  "paths": {
    "@/*": ["*"],
    "@/controllers/*": ["controllers/*"],
    "@/services/*": ["services/*"],
    // ... other mappings
  }
}
```

### Import Organization
1. Node.js built-in modules
2. Third-party dependencies
3. Internal modules (using @/ prefix)
4. Relative imports (for same-level files)

## Layer Dependencies

```
Controllers
    |
    v
Services
    |
    v
Database Layer (Prisma)
    |
    v
PostgreSQL
```

**Dependency Rules**:
- Controllers can call Services
- Services can call Database Layer
- Controllers should NOT directly access Database Layer
- Each layer should only depend on layers below it

## Configuration Files

### `.env.example`
Template for required environment variables. Copy to `.env` and fill with actual values.

### `.eslintrc.json`
ESLint configuration for code quality and consistency.

### `tsconfig.json`
TypeScript compiler options and path mappings.

### `package.json`
Project metadata, dependencies, and npm scripts.

## Build and Output

### `dist/` Directory
- Generated by TypeScript compilation
- Contains transpiled JavaScript
- Used for production deployment
- Should not be committed to version control

### Development vs Production
- **Development**: Use `ts-node-dev` for hot reload
- **Production**: Use compiled JavaScript from `dist/`

## Testing Structure (Planned)

```
tests/
|-- unit/                    # Unit tests
|-- integration/             # Integration tests
|-- e2e/                     # End-to-end tests
|-- fixtures/                # Test data
|-- mocks/                   # Mock implementations
`-- helpers/                 # Test utilities
```

## Future Expansion

### New Features
1. Create new module in `/src/modules/[feature]/`
2. Add controllers, services, and types
3. Define routes and middleware
4. Update documentation

### Shared Components
1. Add utilities to `/src/utils/`
2. Define types in `/src/types/`
3. Create middleware in `/src/middleware/`
4. Update exports in `index.ts` files

This structure promotes:
- **Separation of Concerns**: Each directory has a clear purpose
- **Scalability**: Easy to add new features and modules
- **Maintainability**: Clear organization and naming conventions
- **Testability**: Modular design supports comprehensive testing
