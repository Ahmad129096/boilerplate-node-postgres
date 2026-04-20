# API Usage Examples

This document provides practical examples of how to use the backend API with various clients and tools.

## Table of Contents

- [cURL Examples](#curl-examples)
- [JavaScript/Fetch Examples](#javascriptfetch-examples)
- [Postman Collection](#postman-collection)
- [React Examples](#react-examples)
- [Node.js Examples](#nodejs-examples)

## cURL Examples

### User Registration

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "user": {
      "id": "clv8x7y2z0000abc123def456",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "isVerified": false,
      "createdAt": "2023-12-01T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### User Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password123!"
  }'
```

### Get User Profile (Authenticated)

```bash
# First, get the access token from login response
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Refresh Access Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Forgot Password

```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

### Reset Password

```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset_token_string_here",
    "password": "NewPassword123!"
  }'
```

### Verify Email

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification_token_string_here"
  }'
```

## JavaScript/Fetch Examples

### Authentication Service Class

```javascript
class AuthService {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Store tokens securely
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    // Store refresh token in httpOnly cookie in production
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Clear tokens
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Make authenticated API calls
  async authenticatedFetch(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      headers,
    });

    // Handle token refresh
    if (response.status === 401 && this.refreshToken) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(`${this.baseURL}${url}`, {
          ...options,
          headers,
        });
      }
    }

    return response;
  }

  // Register user
  async register(userData) {
    const response = await fetch(`${this.baseURL}/api/v1/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.success) {
      this.setTokens(data.data.accessToken, data.data.refreshToken);
    }

    return data;
  }

  // Login user
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      this.setTokens(data.data.accessToken, data.data.refreshToken);
    }

    return data;
  }

  // Refresh access token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    const data = await response.json();

    if (data.success) {
      this.accessToken = data.data.accessToken;
      localStorage.setItem('accessToken', data.data.accessToken);
      return data.data.accessToken;
    }

    throw new Error('Token refresh failed');
  }

  // Get user profile
  async getProfile() {
    const response = await this.authenticatedFetch('/api/v1/auth/profile');
    return response.json();
  }

  // Logout
  async logout() {
    this.clearTokens();
    return { success: true, message: 'Logged out successfully' };
  }

  // Forgot password
  async forgotPassword(email) {
    const response = await fetch(`${this.baseURL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    return response.json();
  }

  // Reset password
  async resetPassword(token, newPassword) {
    const response = await fetch(`${this.baseURL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password: newPassword }),
    });

    return response.json();
  }

  // Verify email
  async verifyEmail(token) {
    const response = await fetch(`${this.baseURL}/api/v1/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    return response.json();
  }
}

// Usage example
const authService = new AuthService();

// Register
try {
  const result = await authService.register({
    email: 'john.doe@example.com',
    password: 'Password123!',
    firstName: 'John',
    lastName: 'Doe',
  });
  console.log('Registration successful:', result);
} catch (error) {
  console.error('Registration failed:', error);
}

// Login
try {
  const result = await authService.login('john.doe@example.com', 'Password123!');
  console.log('Login successful:', result);
} catch (error) {
  console.error('Login failed:', error);
}

// Get profile
try {
  const profile = await authService.getProfile();
  console.log('User profile:', profile);
} catch (error) {
  console.error('Failed to get profile:', error);
}
```

## Postman Collection

### Import the following collection into Postman:

```json
{
  "info": {
    "name": "Backend API Collection",
    "description": "Complete API collection for the backend boilerplate",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register User",
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
              "raw": "{\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"Password123!\",\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/signup",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "signup"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    const response = pm.response.json();",
                  "    if (response.success) {",
                  "        pm.collectionVariables.set('accessToken', response.data.accessToken);",
                  "        pm.collectionVariables.set('refreshToken', response.data.refreshToken);",
                  "        pm.collectionVariables.set('userId', response.data.user.id);",
                  "    }",
                  "}"
                ]
              }
            }
          ]
        },
        {
          "name": "Login User",
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
              "raw": "{\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"Password123!\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    if (response.success) {",
                  "        pm.collectionVariables.set('accessToken', response.data.accessToken);",
                  "        pm.collectionVariables.set('refreshToken', response.data.refreshToken);",
                  "        pm.collectionVariables.set('userId', response.data.user.id);",
                  "    }",
                  "}"
                ]
              }
            }
          ]
        },
        {
          "name": "Get Profile",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{accessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/profile",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "profile"]
            }
          }
        },
        {
          "name": "Refresh Token",
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
              "raw": "{\n  \"refreshToken\": \"{{refreshToken}}\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/refresh",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "refresh"]
            }
          }
        },
        {
          "name": "Forgot Password",
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
              "raw": "{\n  \"email\": \"john.doe@example.com\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/forgot-password",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "forgot-password"]
            }
          }
        },
        {
          "name": "Reset Password",
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
              "raw": "{\n  \"token\": \"reset_token_here\",\n  \"password\": \"NewPassword123!\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/reset-password",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "reset-password"]
            }
          }
        },
        {
          "name": "Verify Email",
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
              "raw": "{\n  \"token\": \"verification_token_here\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/verify-email",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "verify-email"]
            }
          }
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{accessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/logout",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "logout"]
            }
          }
        }
      ]
    },
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "accessToken",
      "value": "",
      "type": "string"
    },
    {
      "key": "refreshToken",
      "value": "",
      "type": "string"
    },
    {
      "key": "userId",
      "value": "",
      "type": "string"
    }
  ]
}
```

## React Examples

### Custom Hook for Authentication

```jsx
// hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from 'react';
import { AuthService } from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authService = new AuthService();

  useEffect(() => {
    // Check if user is already logged in
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      authService.accessToken = accessToken;
      authService.refreshToken = localStorage.getItem('refreshToken');
      
      // Verify token and get user data
      getProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const getProfile = async () => {
    try {
      const profile = await authService.getProfile();
      if (profile.success) {
        setUser(profile.data);
      }
    } catch (error) {
      console.error('Failed to get profile:', error);
      // Clear invalid tokens
      authService.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      if (result.success) {
        setUser(result.data.user);
        return { success: true, data: result.data };
      }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setUser(result.data.user);
        return { success: true, data: result.data };
      }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    getProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### Registration Component

```jsx
// components/Register.js
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await register(formData);
    
    if (result.success) {
      // Redirect to dashboard or show success message
      console.log('Registration successful:', result.data);
    } else {
      if (result.data?.errors) {
        setErrors(result.data.errors);
      } else {
        setErrors({ general: result.message });
      }
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      
      {errors.general && <div className="error">{errors.general}</div>}
      
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <span className="error">{errors.email[0]}</span>}
      </div>

      <div>
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <span className="error">{errors.password[0]}</span>}
      </div>

      <div>
        <label>First Name:</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        {errors.firstName && <span className="error">{errors.firstName[0]}</span>}
      </div>

      <div>
        <label>Last Name:</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        {errors.lastName && <span className="error">{errors.lastName[0]}</span>}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}

export default Register;
```

## Node.js Examples

### Express Middleware Example

```javascript
// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
```

### API Client Class

```javascript
// api/client.js
const axios = require('axios');

class ApiClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const token = this.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            this.accessToken = newToken;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearTokens();
            throw new Error('Session expired');
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  async register(userData) {
    const response = await this.client.post('/api/v1/auth/signup', userData);
    return response.data;
  }

  async login(email, password) {
    const response = await this.client.post('/api/v1/auth/login', { email, password });
    if (response.data.success) {
      this.setTokens(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data;
  }

  async refreshToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/api/v1/auth/refresh', {
      refreshToken: this.refreshToken,
    });

    if (response.data.success) {
      this.accessToken = response.data.data.accessToken;
      return response.data.data.accessToken;
    }

    throw new Error('Token refresh failed');
  }

  async getProfile() {
    const response = await this.client.get('/api/v1/auth/profile');
    return response.data;
  }
}

module.exports = ApiClient;
```

### Usage in Node.js Application

```javascript
// app.js
const ApiClient = require('./api/client');

async function main() {
  const api = new ApiClient();

  try {
    // Register a new user
    console.log('Registering user...');
    const registerResult = await api.register({
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    });
    console.log('Registration successful:', registerResult);

    // Login
    console.log('Logging in...');
    const loginResult = await api.login('test@example.com', 'Password123!');
    console.log('Login successful:', loginResult);

    // Get profile
    console.log('Getting profile...');
    const profile = await api.getProfile();
    console.log('User profile:', profile);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Error Handling Examples

### Handling API Errors

```javascript
class APIError extends Error {
  constructor(message, statusCode, data) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

async function handleAPICall(apiCall) {
  try {
    const response = await apiCall();
    
    if (!response.success) {
      throw new APIError(response.message, 400, response);
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      // Handle API-specific errors
      console.error('API Error:', error.message);
      
      if (error.data?.errors) {
        // Handle validation errors
        console.error('Validation errors:', error.data.errors);
      }
    } else {
      // Handle other errors (network, etc.)
      console.error('Unexpected error:', error);
    }
    
    throw error;
  }
}

// Usage
try {
  const userData = await handleAPICall(() => api.register({
    email: 'test@example.com',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
  }));
  
  console.log('User registered:', userData);
} catch (error) {
  // Error already handled in handleAPICall
}
```

These examples provide comprehensive guidance for integrating with the backend API across different platforms and use cases.
