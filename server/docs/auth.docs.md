# API Documentation for Authorization Module

## General Information

All endpoints of the Authorization module are available at the base URL: `/api`

This module handles user authentication and authorization. It supports two authentication methods:
1. Email verification code (passwordless)
2. Email and password login

For protected endpoints in other modules, a JWT token is required, which is obtained through one of the authentication endpoints. The token is valid for 14 days.

**Note:** All endpoints in this module have rate limiting to prevent abuse.

---

## Endpoints

### 1. Send Verification Code

#### `POST /api/send-code`

Sends a 4-digit verification code to the specified email address. The code is valid for 20 minutes and can be used for passwordless authentication.

**Authentication:** Not required

**Rate Limiting:** 3 requests per 15 minutes per IP address

**Request Body:**
```json
{
  "email": "string (required, must match pattern: firstname.lastname@htlstp.at)"
}
```

**Validation:**
- `email` - required field, must be in format: `firstname.lastname@htlstp.at`
  - Only letters allowed in firstname and lastname parts
  - Must end with `@htlstp.at`

**Response 200 (Success):**
```json
{}
```

**Response 400 (Error):**
```json
{
  "error": "Email must be in the format firstname.lastname@htlstp.at"
}
```

**Response 429 (Rate Limit Error):**
```json
{
  "error": "Too many code requests from this IP, please try again after 15 minutes"
}
```

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "max.mustermann@htlstp.at"
  }'
```

**Notes:**
- A 4-digit verification code (1000-9999) is generated using cryptographically secure random number generator
- The code is hashed using SHA-256 before storage for security
- Any previous codes for the same email are automatically invalidated
- The verification code is sent to the email address
- Code expires after 20 minutes
- Maximum 5 verification attempts are allowed per code
- Only valid school email format is accepted (firstname.lastname@htlstp.at)

---

### 2. Verify Code

#### `POST /api/verify-code`

Verifies the email verification code and returns a JWT token. If the user does not exist in the database, they are automatically created.

**Authentication:** Not required

**Rate Limiting:** 5 requests per 15 minutes per IP address

**Request Body:**
```json
{
  "email": "string (required)",
  "code": "number (required, 4-digit code: 1000-9999)"
}
```

**Validation:**
- `email` - required, must match pattern: `firstname.lastname@htlstp.at`
- `code` - required, number between 1000 and 9999

**Response 200 (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 400 (Error):**
```json
{
  "error": "Code not found"
}
```
or
```json
{
  "error": "Code expired"
}
```
or
```json
{
  "error": "Code attempts exceeded"
}
```

**Response 429 (Rate Limit Error):**
```json
{
  "error": "Too many code verifications from this IP, please try again later."
}
```

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "max.mustermann@htlstp.at",
    "code": 1234
  }'
```

**Notes:**
- Each verification attempt decrements the remaining attempts counter
- After 5 failed attempts, a new code must be requested
- If the code is expired (>20 minutes), a new code must be requested
- JWT token contains `userId` and is valid for 14 days
- If user exists, returns token for existing user
- If user doesn't exist, creates a new user automatically:
  - `mail` is set to the provided email
  - `first_name` is extracted from email (part before first dot)
  - `last_name` is extracted from email (part after first dot, before @)

---

### 3. Login with Password

#### `POST /api/login`

Authenticates a user using email and password, and returns a JWT token.

**Authentication:** Not required

**Rate Limiting:** 10 requests per 15 minutes per IP address

**Request Body:**
```json
{
  "mail": "string (required)",
  "password": "string (required)"
}
```

**Validation:**
- `mail` - required, must match pattern: `firstname.lastname@htlstp.at`
- `password` - required, string

**Response 200 (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 400 (Error):**
```json
{
  "error": "User not found"
}
```
or
```json
{
  "error": "User has no password, please set a password first or login with email and code"
}
```
or
```json
{
  "error": "Invalid password"
}
```

**Response 429 (Rate Limit Error):**
```json
{
  "error": "Too many login attempts from this IP, please try again after 15 minutes."
}
```

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "mail": "max.mustermann@htlstp.at",
    "password": "MySecurePassword123!"
  }'
```

**Notes:**
- User must exist in the database
- User must have a password set (some users may only use email verification)
- Passwords are compared using bcrypt for security
- JWT token contains `userId` and is valid for 14 days
- If user registered via email verification only, they must first set a password or use the email verification method

---

## Authentication Flow

### Passwordless Authentication (Recommended)

1. User enters email on login page
2. Frontend calls `POST /api/send-code` with user's email
3. User receives 4-digit code via email
4. User enters the code on verification page
5. Frontend calls `POST /api/verify-code` with email and code
6. Backend returns JWT token
7. Frontend stores token and uses it for authenticated requests

### Password-based Authentication

1. User enters email and password on login page
2. Frontend calls `POST /api/login` with credentials
3. Backend validates credentials and returns JWT token
4. Frontend stores token and uses it for authenticated requests

---

## JWT Token Usage

After successful authentication, use the JWT token in the `Authorization` header for protected endpoints:

```
Authorization: Bearer <token>
```

**Token Properties:**
- Contains: `userId` (user's MongoDB ObjectId)
- Valid for: 14 days
- Algorithm: HS256

**Example with authenticated request:**
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Security Features

### Rate Limiting

All authentication endpoints have rate limiting to prevent brute force attacks:

- **Send Code**: 3 requests per 15 minutes per IP
- **Verify Code**: 5 requests per 15 minutes per IP  
- **Login**: 10 requests per 15 minutes per IP

### Code Security

- Verification codes are generated using cryptographically secure random number generator (`crypto.randomInt`)
- Codes are hashed using SHA-256 before storage
- Codes expire after 20 minutes
- Maximum 5 verification attempts per code
- Old codes are automatically invalidated when requesting a new code

### Password Security

- Passwords are hashed using bcrypt
- Password comparison uses constant-time comparison to prevent timing attacks

---

## Error Codes

- **200** - Successful request
- **400** - Validation error, invalid credentials, or expired/invalid code
- **429** - Too many requests (rate limit exceeded)

---

## Email Format Requirements

All authentication endpoints require emails in the format:
- Pattern: `firstname.lastname@htlstp.at`
- Only letters (a-z, A-Z) allowed in firstname and lastname
- Must end with `@htlstp.at` domain

**Valid Examples:**
- `max.mustermann@htlstp.at`
- `hans.peter@htlstp.at`

**Invalid Examples:**
- `max.mustermann123@htlstp.at` (contains numbers)
- `max@htlstp.at` (missing lastname)
- `max.mustermann@gmail.com` (wrong domain)

---

## Common Use Cases

### First Time User Registration

1. Call `POST /api/send-code` with email
2. User receives verification code via email
3. Call `POST /api/verify-code` with email and code
4. User is automatically created in the database
5. JWT token is returned for immediate use

### Existing User Login (Passwordless)

1. Call `POST /api/send-code` with email
2. User receives verification code via email
3. Call `POST /api/verify-code` with email and code
4. JWT token is returned

### Existing User Login (Password)

1. Call `POST /api/login` with email and password
2. JWT token is returned

---

## Notes

1. **Automatic User Creation**: When verifying an email code for the first time, the system automatically creates a user account with basic information derived from the email address.

2. **Multiple Authentication Methods**: Users can authenticate using either:
   - Email verification code (passwordless) - recommended for first-time users
   - Email and password - for returning users who have set a password

3. **Rate Limiting**: Rate limits are enforced per IP address. In test environments, these limits are increased to facilitate testing.

4. **Code Expiration**: Verification codes expire after 20 minutes. Users must request a new code if the previous one expires.

5. **Attempt Limiting**: Each verification code allows 5 verification attempts. After 5 failed attempts, a new code must be requested.

6. **Token Expiration**: JWT tokens are valid for 14 days. After expiration, users must authenticate again.

7. **Email Service**: The system uses an email service to send verification codes. The actual email service implementation may vary based on environment configuration.

