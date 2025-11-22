# API Documentation for Users Module

## General Information

All endpoints of the Users module are available at the base URL: `/api/users`

For authentication, a JWT token is used, which is obtained through the `/api/login` endpoint. The token is valid for 14 days.

---

## Endpoints

### 1. Authentication (Login)

#### `POST /api/login`

Authenticates a user via LDAP and returns a JWT token. If the user does not exist in the database, they are automatically created based on information from LDAP.

**Authentication:** Not required

**Request Body:**
```json
{
  "login": "string (required)",
  "password": "string (required)"
}
```

**Validation:**
- `login` - required field, string
- `password` - required field, string

**Response 200 (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 400 (Error):**
```json
{
  "error": "Login or password is false"
}
```

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "20230266",
    "password": "password123"
  }'
```

**Notes:**
- Authentication occurs through an LDAP server
- After successful authentication, if the user does not exist, they are created automatically
- User role is determined automatically: if `description` starts with a digit - role "Student", otherwise - value from `description`
- JWT token contains `userId` and is valid for 14 days

---

### 2. Get Current User

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
    "pc_number": "20230266",
    "skills": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "JavaScript"
      }
    ],
    "mail": "john.doe@example.com"
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

### 3. Update Current User

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
  "skills": ["skill_id_1", "skill_id_2"]
}
```

**Request Body (Form Data):**
- `photo` - image file (optional)
- `description` - text description (optional)
- `github_link` - GitHub link (optional)
- `linkedin_link` - LinkedIn link (optional)
- `banner_link` - banner link (optional)
- `skills` - array of skill IDs (optional)

**Validation:**
- At least one field must be provided
- `description` - maximum length 300 characters
- `photo_path` cannot be set directly (use `photo` file field)
- `skills` - array of strings (skill IDs), all IDs must exist

**Response 200 (Success):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "first_name": "John",
    "last_name": "Doe",
    "description": "Updated description",
    "department": "IF",
    "class": "3AHIF",
    "photo_path": "new_photo.jpg",
    "role": "Student",
    "github_link": "https://github.com/username",
    "linkedin_link": "https://linkedin.com/in/username",
    "banner_link": null,
    "created_at": "2024-01-15T10:30:00.000Z",
    "pc_number": "20230266",
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
    "mail": "john.doe@example.com"
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
    "github_link": "https://github.com/newusername"
  }'
```

With photo:
```bash
curl -X PATCH http://localhost:3000/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "photo=@/path/to/photo.jpg" \
  -F "description=Updated description"
```

**Notes:**
- When uploading a new photo, the old photo is automatically deleted
- `photo_path` cannot be passed in the body, use the `photo` field to upload a file
- All provided `skills` IDs must exist in the database

---

### 4. Get User by ID

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
    "pc_number": "20230266",
    "skills": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "JavaScript"
      }
    ],
    "mail": "john.doe@example.com"
  }
}
```

**Response 400 (Error):**
```json
{
  "error": "User ID is required"
}
```
or
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

### 5. Get Users List

#### `GET /api/users`

Returns a list of users with filtering and pagination capabilities.

**Authentication:** Not required

**Query Parameters:**
- `department` - filter by department (optional)
  - Possible values: `IF`, `WI`, `MB`, `EL`, `ETI`
- `class` - filter by class (optional, partial search from the start)
  - Example: `3AHIF` will find `3AHIF`, `3AHIFa`, `3AHIFb`, etc.
- `nameContains` - search by first name or last name (optional, case-insensitive, 1-20 characters)
- `pc_id` - filter by PC number (optional)
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
      "pc_number": "20230266",
      "skills": [],
      "mail": "john.doe@example.com"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "first_name": "Jane",
      "last_name": "Smith",
      "description": null,
      "department": "IF",
      "class": "3BHIF",
      "photo_path": null,
      "role": "Student",
      "github_link": null,
      "linkedin_link": null,
      "banner_link": null,
      "created_at": "2024-01-16T12:00:00.000Z",
      "pc_number": "20230267",
      "skills": [
        {
          "id": "507f1f77bcf86cd799439013",
          "name": "Python"
        }
      ],
      "mail": "jane.smith@example.com"
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

```typescript
{
  id: string;                    // ObjectId as string
  first_name: string | null;     // First name (3-20 characters)
  last_name: string | null;      // Last name (3-20 characters)
  description: string | null;    // Description (up to 300 characters)
  department: string | null;     // Department: 'IF' | 'WI' | 'MB' | 'EL' | 'ETI'
  class: string | null;          // Class (format: /^[1-5][A-Z]{1}[A-Z]{2,4}$/i)
  photo_path: string | null;     // Photo path (up to 100 characters)
  role: string | null;           // User role
  github_link: string | null;    // GitHub link (up to 100 characters)
  linkedin_link: string | null;  // LinkedIn link (up to 100 characters)
  banner_link: string | null;    // Banner link (up to 100 characters)
  created_at: Date;              // Creation date
  pc_number: string;             // PC number (unique, required)
  skills: Array<{                // Skills array
    id: string;
    name: string;
  }>;
  mail: string | null;           // Email address
}
```

---

## Error Codes

- **200** - Successful request
- **400** - Validation error or incorrect data
- **401** - Not authenticated (for protected endpoints)
- **404** - Resource not found

---

## Notes

1. **LDAP Authentication**: The system uses LDAP for user authentication. On first login, the user is automatically created in the database.

2. **Automatic User Creation**: On login, if the user does not exist, they are automatically created with data from LDAP:
   - `first_name` - from `givenName`
   - `last_name` - from `sn`
   - `role` - determined automatically (if `description` starts with a digit - "Student")
   - `mail` - from `mail`
   - `department` - defaults to "IF"

3. **Photos**: When updating a photo, the old photo is automatically deleted from the file system.

4. **Skills**: Skills are stored as references to the `Skill` collection. When updating, it is checked that all skill IDs exist.

5. **JWT Token**: The token contains `userId` and is valid for 14 days. Pass it in the `Authorization: Bearer <token>` header for protected endpoints.