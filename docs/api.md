# API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the backend boilerplate. The API follows RESTful principles and uses JSON for request/response formats.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## API Versioning

The API is versioned using URL paths:
```
/api/v1/
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

### Authentication Header
```
Authorization: Bearer <access_token>
```

### Token Types
- **Access Token**: Short-lived (15 minutes) for API access
- **Refresh Token**: Long-lived (7 days) for obtaining new access tokens

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

- **General Limit**: 100 requests per 15 minutes per IP
- **Auth Endpoints**: Additional rate limiting may apply
- **Headers Included**:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/signup
```

**Description**: Register a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules**:
- `email`: Valid email format, unique
- `password`: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- `firstName`: Required, max 50 chars
- `lastName`: Required, max 50 chars

**Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "isVerified": false,
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Error Responses**:
- `400`: Validation failed
- `409`: User already exists

---

#### Login User
```http
POST /api/v1/auth/login
```

**Description**: Authenticate user and receive tokens

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "isVerified": true,
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Error Responses**:
- `400`: Validation failed
- `401`: Invalid credentials
- `403`: Account deactivated

---

#### Refresh Access Token
```http
POST /api/v1/auth/refresh
```

**Description**: Obtain new access token using refresh token

**Request Body**:
```json
{
  "refreshToken": "eyJ..."
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJ..."
  }
}
```

**Error Responses**:
- `400`: Invalid refresh token
- `401`: Token expired or invalid

---

#### Forgot Password
```http
POST /api/v1/auth/forgot-password
```

**Description**: Send password reset email

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "If an account with this email exists, a password reset link has been sent"
}
```

**Error Responses**:
- `400`: Invalid email format

---

#### Reset Password
```http
POST /api/v1/auth/reset-password
```

**Description**: Reset password using token from email

**Request Body**:
```json
{
  "token": "reset_token_string",
  "password": "NewPassword123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses**:
- `400`: Invalid token or password
- `422`: Token expired or invalid

---

#### Verify Email
```http
POST /api/v1/auth/verify-email
```

**Description**: Verify email address using token

**Request Body**:
```json
{
  "token": "verification_token_string"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Responses**:
- `400`: Invalid token
- `422`: Token expired or invalid

---

#### Resend Verification Email
```http
POST /api/v1/auth/resend-verification
```

**Description**: Resend email verification link

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

**Error Responses**:
- `400`: Invalid email
- `404`: User not found
- `422`: Email already verified

---

#### Get User Profile
```http
GET /api/v1/auth/profile
```

**Description**: Get current user profile

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "userId": "cuid...",
    "email": "user@example.com",
    "iat": 1234567890,
    "exp": 1234568790
  }
}
```

**Error Responses**:
- `401`: Authentication required

---

#### Logout User
```http
POST /api/v1/auth/logout
```

**Description**: Logout user (client-side token invalidation)

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Responses**:
- `401`: Authentication required

---

### Health Check Endpoint

#### Health Check
```http
GET /health
```

**Description**: Check server health status

**Authentication**: None

**Response** (200):
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

---

## Error Handling

### Validation Errors
Validation errors return detailed field-level errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email format"],
    "password": [
      "Password must be at least 8 characters long",
      "Password must contain at least one uppercase letter"
    ]
  }
}
```

### Authentication Errors
Authentication errors don't expose specific reasons:

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Server Errors
Server errors include stack traces in development:

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message (development only)"
}
```

## Request Examples

### Using curl

#### Signup
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

#### Authenticated Request
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Using JavaScript/Fetch

#### Login Example
```javascript
async function login(email, password) {
  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Store tokens
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return data.data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

#### Authenticated Request Example
```javascript
async function getProfile() {
  const token = localStorage.getItem('accessToken');
  
  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to get profile:', error);
    throw error;
  }
}
```

## SDK Examples

### Postman Collection

Import the following Postman collection for easy testing:

```json
{
  "info": {
    "name": "Backend API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Signup",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"Password123!\",\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/signup",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "signup"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

## Testing

### Unit Testing
Test individual endpoints with mocked dependencies:

```javascript
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
    expect(response.body.data.user.email).toBe('test@example.com');
  });
});
```

### Integration Testing
Test complete workflows:

```javascript
describe('Authentication Flow', () => {
  it('should complete full auth flow', async () => {
    // 1. Signup
    const signupResponse = await request(app)
      .post('/api/v1/auth/signup')
      .send(validUserData);

    // 2. Verify email
    await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token: verificationToken });

    // 3. Login
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });

    // 4. Access protected route
    const profileResponse = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`);

    expect(profileResponse.status).toBe(200);
  });
});
```

## Best Practices

### For API Consumers
1. **Always check the `success` field** before processing data
2. **Handle validation errors** by displaying field-specific messages
3. **Implement automatic token refresh** for better UX
4. **Store tokens securely** (httpOnly cookies for refresh tokens)
5. **Handle rate limiting** gracefully with exponential backoff

### For API Developers
1. **Use consistent response formats** across all endpoints
2. **Provide detailed validation messages** for better UX
3. **Log authentication events** for security monitoring
4. **Implement proper error handling** without exposing sensitive data
5. **Version APIs** to maintain backward compatibility

## Future Enhancements

### Planned Endpoints
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/password` - Change password
- `GET /api/v1/auth/sessions` - List active sessions
- `DELETE /api/v1/auth/sessions/:id` - Revoke session
- `POST /api/v1/auth/2fa/setup` - Setup 2FA
- `POST /api/v1/auth/2fa/verify` - Verify 2FA

### API Improvements
- OpenAPI/Swagger documentation
- GraphQL endpoint
- WebSocket support for real-time features
- API key authentication for service accounts

This API provides a solid foundation for building secure, scalable applications with comprehensive authentication and user management features.
