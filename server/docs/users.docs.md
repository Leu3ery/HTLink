# API Documentation for Users Module

## General Information

All endpoints of the Users module are available at the base URL: `/api/users`

For authentication, a JWT token is used, which is obtained through the Authorization module endpoints (see `auth.docs.md`):
- `POST /api/send-code` - send verification code to email
- `POST /api/verify-code` - verify code and get JWT token
- `POST /api/login` - login with email and password

The JWT token is valid for 14 days and must be included in the `Authorization: Bearer <token>` header for protected endpoints.

---

## Quick Reference: User Fields

### Fields Returned in All User Responses

All endpoints return the following user information:
- ✅ **Identification**: `id`, `mail`
- ✅ **Personal Info**: `first_name`, `last_name`, `description`, `department`, `class`, `role`
- ✅ **Media**: `photo_path`, `banner_link`
- ✅ **Social Links**: `github_link`, `linkedin_link`
- ✅ **Skills**: `skills` (array of {id, name})
- ✅ **Metadata**: `created_at`
- ❌ **Never Returned**: `password` (for security)

### Fields You Can Update (PATCH /api/users/me)

Users can modify these fields on their own profile:
- ✏️ `description` - personal bio (max 300 chars)
- ✏️ `github_link` - GitHub profile URL (max 100 chars)
- ✏️ `linkedin_link` - LinkedIn profile URL (max 100 chars)
- ✏️ `banner_link` - profile banner/cover URL (max 100 chars)
- ✏️ `skills` - array of skill IDs
- ✏️ `class` - class name (e.g., "3AHIF", "5BHWI")
- ✏️ `department` - department code (IF, WI, MB, EL, ETI)
- ✏️ `password` - account password (hashed automatically)
- ✏️ `photo` - profile photo (file upload only)

### Read-Only Fields

These fields cannot be directly modified:
- 🔒 `id` - auto-generated database ID
- 🔒 `first_name` - set during registration from email
- 🔒 `last_name` - set during registration from email
- 🔒 `mail` - email address (set during registration)
- 🔒 `role` - user role (system-managed)
- 🔒 `created_at` - account creation timestamp

---

## Endpoints

### 1. Get Current User

#### `GET /api/users/me`

Returns information about the currently authenticated user.

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200 (Success):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "first_name": "John",
    "last_name": "Doe",
    "description": "User description",
    "department": "IF",
    "class": "3AHIF",
    "photo_path": "photo.jpg",
    "role": "Student",
    "github_link": "https://github.com/username",
    "linkedin_link": "https://linkedin.com/in/username",
    "banner_link": "https://example.com/banner.jpg",
    "created_at": "2024-01-15T10:30:00.000Z",
    "skills": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "JavaScript"
      }
    ],
    "mail": "john.doe@htlstp.at"
  }
}
```

**Response 404 (Error):**
```json
{
  "error": "User not found"
}
```

**Request Example:**
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Update Current User

#### `PATCH /api/users/me`

Updates information about the currently authenticated user. Supports photo upload via multipart/form-data.

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data (if uploading photo) or application/json
```

**Request Body (JSON):**
```json
{
  "description": "string (optional, max 300 chars)",
  "github_link": "string (optional, max 100 chars)",
  "linkedin_link": "string (optional, max 100 chars)",
  "banner_link": "string (optional, max 100 chars)",
  "skills": ["skill_id_1", "skill_id_2"],
  "class": "string (optional, format: /^[1-5][A-Z]{1}[A-Z]{2,4}$/i)",
  "department": "string (optional, one of: IF, WI, MB, EL, ETI)",
  "password": "string (optional)"
}
```

**Request Body (Form Data):**
- `photo` - image file (optional)
- `description` - text description (optional, max 300 chars)
- `github_link` - GitHub link (optional, max 100 chars)
- `linkedin_link` - LinkedIn link (optional, max 100 chars)
- `banner_link` - banner link (optional, max 100 chars)
- `skills` - array of skill IDs (optional)
- `class` - class name (optional, e.g., "3AHIF")
- `department` - department code (optional, one of: IF, WI, MB, EL, ETI)
- `password` - new password (optional)

**Validation:**
- At least one field must be provided
- `description` - maximum length 300 characters
- `github_link` - maximum length 100 characters
- `linkedin_link` - maximum length 100 characters
- `banner_link` - maximum length 100 characters
- `photo_path` cannot be set directly (use `photo` file field)
- `skills` - array of strings (skill IDs), all IDs must exist
- `class` - must match pattern `/^[1-5][A-Z]{1}[A-Z]{2,4}$/i` (e.g., "3AHIF", "5BHWI")
- `department` - must be one of: `IF`, `WI`, `MB`, `EL`, `ETI`
- `password` - will be hashed before storage

**Response 200 (Success):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "first_name": "John",
    "last_name": "Doe",
    "description": "Updated description",
    "department": "WI",
    "class": "5BHWI",
    "photo_path": "new_photo.jpg",
    "role": "Student",
    "github_link": "https://github.com/username",
    "linkedin_link": "https://linkedin.com/in/username",
    "banner_link": null,
    "created_at": "2024-01-15T10:30:00.000Z",
    "skills": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "JavaScript"
      },
      {
        "id": "507f1f77bcf86cd799439013",
        "name": "TypeScript"
      }
    ],
    "mail": "john.doe@htlstp.at"
  }
}
```

**Response 400 (Error):**
```json
{
  "error": "photo_path is not allowed"
}
```
or
```json
{
  "error": "One or more skill IDs are invalid"
}
```

**Response 404 (Error):**
```json
{
  "error": "User not found"
}
```

**Request Examples:**

With JSON:
```bash
curl -X PATCH http://localhost:3000/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "description": "New description",
    "github_link": "https://github.com/newusername",
    "class": "5BHWI",
    "department": "WI"
  }'
```

With photo:
```bash
curl -X PATCH http://localhost:3000/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "photo=@/path/to/photo.jpg" \
  -F "description=Updated description"
```

Update password:
```bash
curl -X PATCH http://localhost:3000/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "password": "MyNewSecurePassword123!"
  }'
```

**Notes:**
- When uploading a new photo, the old photo is automatically deleted
- `photo_path` cannot be passed in the body, use the `photo` field to upload a file
- All provided `skills` IDs must exist in the database
- `password` is automatically hashed before storage using bcrypt
- Users can update their `class` and `department` fields

---

### 3. Get User by ID

#### `GET /api/users/:id`

Returns information about a user by their ID.

**Authentication:** Not required

**URL Parameters:**
- `id` - User ID (MongoDB ObjectId)

**Response 200 (Success):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "first_name": "John",
    "last_name": "Doe",
    "description": "User description",
    "department": "IF",
    "class": "3AHIF",
    "photo_path": "photo.jpg",
    "role": "Student",
    "github_link": "https://github.com/username",
    "linkedin_link": "https://linkedin.com/in/username",
    "banner_link": null,
    "created_at": "2024-01-15T10:30:00.000Z",
    "skills": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "JavaScript"
      }
    ],
    "mail": "john.doe@htlstp.at"
  }
}
```

**Response 400 (Error):**
```json
{
  "error": "Invalid user id"
}
```

**Response 404 (Error):**
```json
{
  "error": "User not found"
}
```

**Request Example:**
```bash
curl -X GET http://localhost:3000/api/users/507f1f77bcf86cd799439011
```

---

### 4. Get Users List

#### `GET /api/users`

Returns a list of users with filtering and pagination capabilities.

**Authentication:** Not required

**Query Parameters:**
- `department` - filter by department (optional)
  - Possible values: `IF`, `WI`, `MB`, `EL`, `ETI`
- `class` - filter by class (optional, partial search from the start)
  - Example: `3AHIF` will find `3AHIF`, `3AHIFa`, `3AHIFb`, etc.
- `nameContains` - search by first name or last name (optional, case-insensitive, 1-20 characters)
- `offset` - pagination offset (optional, default: 0, min: 0)
- `limit` - number of records per page (optional, default: 20, max: 50, min: 1)

**Response 200 (Success):**
```json
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "first_name": "John",
      "last_name": "Doe",
      "description": "Description",
      "department": "IF",
      "class": "3AHIF",
      "photo_path": "photo.jpg",
      "role": "Student",
      "github_link": null,
      "linkedin_link": null,
      "banner_link": null,
      "created_at": "2024-01-15T10:30:00.000Z",
      "skills": [],
      "mail": "john.doe@htlstp.at"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "first_name": "Jane",
      "last_name": "Smith",
      "description": null,
      "department": "WI",
      "class": "3BHWI",
      "photo_path": null,
      "role": "Student",
      "github_link": null,
      "linkedin_link": null,
      "banner_link": null,
      "created_at": "2024-01-16T12:00:00.000Z",
      "skills": [
        {
          "id": "507f1f77bcf86cd799439013",
          "name": "Python"
        }
      ],
      "mail": "jane.smith@htlstp.at"
    }
  ]
}
```

**Request Examples:**

Get all users with pagination:
```bash
curl -X GET "http://localhost:3000/api/users?offset=0&limit=10"
```

Filter by department:
```bash
curl -X GET "http://localhost:3000/api/users?department=IF&limit=20"
```

Filter by class:
```bash
curl -X GET "http://localhost:3000/api/users?class=3AHIF"
```

Search by name:
```bash
curl -X GET "http://localhost:3000/api/users?nameContains=John"
```

Combined search:
```bash
curl -X GET "http://localhost:3000/api/users?department=IF&class=3A&nameContains=Doe&offset=0&limit=10"
```

**Notes:**
- `class` uses regex with string start (`^`), so it searches for classes starting with the provided value
- `nameContains` searches in `first_name` and `last_name` fields (case-insensitive)
- By default, 20 users are returned
- Maximum number of records per page is 50

---

## User Data Structure

### Response Fields (Public User)

All user endpoints return the following fields:

```typescript
{
  id: string;                    // ObjectId as string (read-only)
  first_name: string | null;     // First name (3-20 characters, read-only)
  last_name: string | null;      // Last name (3-20 characters, read-only)
  description: string | null;    // User description (up to 300 characters, updatable)
  department: string | null;     // Department: 'IF' | 'WI' | 'MB' | 'EL' | 'ETI' (updatable)
  class: string | null;          // Class format: /^[1-5][A-Z]{1}[A-Z]{2,4}$/i (e.g., "3AHIF", updatable)
  photo_path: string | null;     // Photo path (up to 100 characters, updatable via file upload)
  role: string | null;           // User role (read-only, system-managed)
  github_link: string | null;    // GitHub profile link (up to 100 characters, updatable)
  linkedin_link: string | null;  // LinkedIn profile link (up to 100 characters, updatable)
  banner_link: string | null;    // Banner/cover image link (up to 100 characters, updatable)
  created_at: Date;              // Account creation date (read-only)
  skills: Array<{                // Skills array (updatable)
    id: string;                  // Skill ID
    name: string;                // Skill name
  }>;
  mail: string | null;           // Email address (read-only, set during registration)
}
```

**Note:** The `password` field is never returned in responses for security reasons.

### Updatable Fields (PATCH /api/users/me)

Users can update the following fields:

```typescript
{
  description?: string;          // User description (max 300 characters)
  github_link?: string;          // GitHub link (max 100 characters)
  linkedin_link?: string;        // LinkedIn link (max 100 characters)
  banner_link?: string;          // Banner link (max 100 characters)
  skills?: string[];             // Array of skill IDs (all IDs must exist)
  class?: string;                // Class name (format: /^[1-5][A-Z]{1}[A-Z]{2,4}$/i)
  department?: string;           // Department code (one of: IF, WI, MB, EL, ETI)
  password?: string;             // New password (hashed before storage)
  photo?: File;                  // Photo file (via multipart/form-data)
}
```

### Read-Only Fields

These fields cannot be directly updated by users:

- `id` - Auto-generated by database
- `first_name` - Set during user creation from email
- `last_name` - Set during user creation from email
- `role` - System-managed (e.g., "Student", "Teacher")
- `created_at` - Auto-generated on user creation
- `mail` - Set during registration, cannot be changed

---

## Error Codes

- **200** - Successful request
- **400** - Validation error or incorrect data
- **401** - Not authenticated (for protected endpoints)
- **404** - Resource not found

---

## Notes

1. **Authentication**: The system uses the Authorization module for user authentication (see `auth.docs.md`). Users can authenticate via:
   - Email verification code (passwordless)
   - Email and password

2. **Automatic User Creation**: On first authentication via email verification, if the user does not exist, they are automatically created with basic information:
   - `mail` - the verified email address
   - `first_name` - extracted from email (part before first dot)
   - `last_name` - extracted from email (part after first dot, before @)

3. **Photos**: When updating a photo, the old photo is automatically deleted from the file system. Photos must be uploaded via multipart/form-data using the `photo` field.

4. **Skills**: Skills are stored as references to the `Skill` collection. When updating, it is checked that all skill IDs exist.

5. **Password Security**: When a user updates their password, it is automatically hashed using bcrypt before storage. Passwords are never returned in API responses.

6. **Updatable Profile Fields**: Users can update their profile information including:
   - Personal info: `description`, `class`, `department`
   - Social links: `github_link`, `linkedin_link`, `banner_link`
   - Profile picture: `photo` (via file upload)
   - Authentication: `password`
   - Skills: `skills` (array of skill IDs)

7. **Read-Only Fields**: The following fields cannot be changed by users:
   - `id`, `first_name`, `last_name`, `mail`, `role`, `created_at`

8. **JWT Token**: The token contains `userId` and is valid for 14 days. Pass it in the `Authorization: Bearer <token>` header for protected endpoints.