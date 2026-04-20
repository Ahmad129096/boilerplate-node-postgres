# Authentication Flow Documentation

## Overview

This document describes the complete authentication flows implemented in the backend, including signup, login, token management, password reset, and email verification processes.

## Authentication Architecture

The system uses JWT (JSON Web Tokens) for authentication with a dual-token approach:
- **Access Token**: Short-lived (15 minutes) token for API access
- **Refresh Token**: Long-lived (7 days) token for obtaining new access tokens

## User Registration Flow

### 1. Signup Process

```
Client -> POST /api/v1/auth/signup
       -> Validate input (email, password, name)
       -> Hash password with bcrypt
       -> Create user in database
       -> Generate email verification token
       -> Send verification email
       -> Generate JWT tokens
       -> Return tokens and user data
```

**API Endpoint**: `POST /api/v1/auth/signup`

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
- Email: Valid email format
- Password: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
- Names: Required, max 50 characters

**Response**:
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

### 2. Email Verification

```
Client -> Click email link -> Frontend -> POST /api/v1/auth/verify-email
       -> Validate token
       -> Find verification token in database
       -> Check token expiration
       -> Mark user as verified
       -> Delete verification token
       -> Return success message
```

**API Endpoint**: `POST /api/v1/auth/verify-email`

**Request Body**:
```json
{
  "token": "verification_token_string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### 3. Resend Verification Email

```
Client -> POST /api/v1/auth/resend-verification
       -> Find user by email
       -> Check if already verified
       -> Delete existing tokens
       -> Generate new verification token
       -> Send verification email
       -> Return success message
```

**API Endpoint**: `POST /api/v1/auth/resend-verification`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

## User Login Flow

### 1. Login Process

```
Client -> POST /api/v1/auth/login
       -> Validate input (email, password)
       -> Find user in database
       -> Check account status
       -> Compare password with hash
       -> Generate JWT tokens
       -> Return tokens and user data
```

**API Endpoint**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response**:
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

### 2. Token Refresh Process

```
Client -> POST /api/v1/auth/refresh
       -> Validate refresh token
       -> Verify token signature
       -> Find user from token
       -> Check account status
       -> Generate new access token
       -> Return new access token
```

**API Endpoint**: `POST /api/v1/auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "eyJ..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJ..."
  }
}
```

## Password Reset Flow

### 1. Forgot Password

```
Client -> POST /api/v1/auth/forgot-password
       -> Validate email
       -> Find user (don't reveal if exists)
       -> Generate reset token
       -> Delete existing reset tokens
       -> Store new reset token
       -> Send reset email
       -> Return success message
```

**API Endpoint**: `POST /api/v1/auth/forgot-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "If an account with this email exists, a password reset link has been sent"
}
```

### 2. Reset Password

```
Client -> POST /api/v1/auth/reset-password
       -> Validate token and new password
       -> Find reset token in database
       -> Check token expiration
       -> Hash new password
       -> Update user password
       -> Delete reset token
       -> Return success message
```

**API Endpoint**: `POST /api/v1/auth/reset-password`

**Request Body**:
```json
{
  "token": "reset_token_string",
  "password": "NewPassword123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Token Management

### Access Token
- **Purpose**: API authentication
- **Lifetime**: 15 minutes
- **Algorithm**: HS256
- **Payload**:
```json
{
  "userId": "cuid...",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Refresh Token
- **Purpose**: Obtain new access tokens
- **Lifetime**: 7 days
- **Algorithm**: HS256
- **Payload**:
```json
{
  "userId": "cuid...",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Verification Tokens
- **Purpose**: Email verification and password reset
- **Lifetime**: 
  - Email verification: 24 hours
  - Password reset: 1 hour
- **Format**: 32-character random string
- **Storage**: Database with expiration timestamp

## Security Considerations

### Password Security
- **Hashing**: bcrypt with 12 salt rounds
- **Validation**: Minimum 8 characters, complexity requirements
- **Storage**: Never store plain text passwords

### Token Security
- **Secret Keys**: Environment variables, never hardcoded
- **Algorithm**: HS256 with strong secrets
- **Expiration**: Short-lived access tokens
- **Rotation**: Refresh tokens generate new access tokens

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Auth Endpoints**: Additional rate limiting considerations
- **Password Reset**: Limit attempts per email

### Email Security
- **Verification**: Required for account activation
- **Reset Links**: One-time use, expire quickly
- **Template Security**: HTML sanitization

## Error Handling

### Common Error Responses

#### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters long"]
  }
}
```

#### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### Authorization Errors (403)
```json
{
  "success": false,
  "message": "Account is deactivated"
}
```

#### Not Found Errors (404)
```json
{
  "success": false,
  "message": "User not found"
}
```

#### Token Errors
```json
{
  "success": false,
  "message": "Invalid or expired access token"
}
```

## Client Implementation Guide

### Authentication Header
```
Authorization: Bearer <access_token>
```

### Token Storage
- **Access Token**: Memory or sessionStorage (short-lived)
- **Refresh Token**: httpOnly cookie or secure storage

### Automatic Token Refresh
```javascript
// Example client-side token refresh
async function apiCall(url, options) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${getAccessToken()}`
    }
  });

  if (response.status === 401) {
    // Try to refresh token
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry the original request
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        }
      });
    }
  }

  return response;
}
```

## Flow Diagrams

### Registration Flow
```
User -> Signup Form -> API -> Create User -> Send Email -> Return Tokens
                                    |
                                    v
                              Email Link -> Verify Email -> Activate Account
```

### Login Flow
```
User -> Login Form -> API -> Validate Credentials -> Return Tokens
                                    |
                                    v
                              Store Tokens -> Make Authenticated Requests
```

### Token Refresh Flow
```
API Request -> 401 Error -> Refresh Token -> New Access Token -> Retry Request
```

### Password Reset Flow
```
User -> Forgot Password -> API -> Send Reset Email
                                    |
                                    v
                              Email Link -> Reset Password -> Update Password
```

## Best Practices

### For Developers
1. **Always validate input** before processing
2. **Use HTTPS** in production
3. **Implement proper error handling** without exposing sensitive information
4. **Log authentication events** for security monitoring
5. **Clean up expired tokens** regularly

### For Users
1. **Use strong, unique passwords**
2. **Enable two-factor authentication** (when implemented)
3. **Report suspicious activity**
4. **Log out from shared devices**
5. **Keep email addresses up to date**

## Future Enhancements

### Planned Features
1. **Two-Factor Authentication (2FA)**
2. **Social Login (Google, GitHub, etc.)**
3. **Session Management** (view active sessions, revoke access)
4. **Account Lockout** after failed attempts
5. **Password Strength Meter**
6. **Biometric Authentication**

### Security Improvements
1. **JWT Token Blacklisting**
2. **Advanced Rate Limiting**
3. **IP-based Restrictions**
4. **Device Fingerprinting**
5. **Anomaly Detection**

This authentication system provides a secure, scalable foundation for user management and can be extended with additional features as needed.
