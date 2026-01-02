# API Documentation for Offers Module

## General Information

All endpoints of the Offers module are available at the base URL: `/api/offers`

For authentication, a JWT token is used, which is obtained through the `/api/login` endpoint. The token is valid for 14 days.

**Note:** All endpoints in this module require authentication (JWT token).

---

## Endpoints

### 1. Create Offer

#### `POST /api/offers`

Creates a new offer. Supports photo upload via multipart/form-data.

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data (if uploading photo) or application/json
```

**Request Body (JSON):**
```json
{
  "title": "string (required, max 100 chars)",
  "description": "string (required, max 1000 chars)",
  "phoneNumber": "string (required, valid international phone number)",
  "price": "number (optional)",
  "skills": ["skill_id_1", "skill_id_2"]
}
```

**Request Body (Form Data):**
- `title` - offer title (required, max 100 characters)
- `description` - offer description (required, max 1000 characters)
- `phoneNumber` - contact phone number (required, valid international format)
- `price` - offer price (optional, number)
- `skills` - array of skill IDs (required)
- `photo_path` - image file (optional)

**Validation:**
- `title` - required, string, maximum length 100 characters
- `description` - required, string, maximum length 1000 characters
- `phoneNumber` - required, must match pattern `/^\+?[1-9]\d{7,14}$/` (international phone number format)
- `price` - optional, number
- `skills` - required, array of strings (skill IDs), all IDs must exist in the database
- `photo_path` cannot be set directly in body (use `photo_path` file field)

**Response 201 (Success):**
```json
{
  "offer": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Web Development Service",
    "description": "Professional web development services with modern technologies",
    "phoneNumber": "+1234567890",
    "price": 150,
    "photo_path": "photo_1234567890.jpg",
    "skills": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Express Js"
      },
      {
        "id": "507f1f77bcf86cd799439013",
        "name": "Angular"
      }
    ],
    "ownerId": {
      "id": "507f1f77bcf86cd799439014",
      "first_name": "John",
      "last_name": "Doe",
      "photo_path": "user_photo.jpg",
      "mail": "john.doe@example.com"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response 400 (Error):**
```json
{
  "error": "Skill not found"
}
```
or
```json
{
  "error": "Phone number must be a valid international phone number"
}
```
or
```json
{
  "error": "photo_path is not allowed"
}
```

**Request Examples:**

With JSON:
```bash
curl -X POST http://localhost:3000/api/offers \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Web Development Service",
    "description": "Professional web development services",
    "phoneNumber": "+1234567890",
    "price": 150,
    "skills": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
  }'
```

With photo:
```bash
curl -X POST http://localhost:3000/api/offers \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "title=Web Development Service" \
  -F "description=Professional web development services" \
  -F "phoneNumber=+1234567890" \
  -F "price=150" \
  -F "skills=507f1f77bcf86cd799439012" \
  -F "skills=507f1f77bcf86cd799439013" \
  -F "photo_path=@/path/to/photo.jpg"
```

**Notes:**
- The offer is automatically associated with the authenticated user (`ownerId` is set from JWT token)
- All provided `skills` IDs must exist in the database
- Phone number must be in international format (e.g., `+1234567890` or `1234567890`)
- When uploading a photo, use the `photo_path` field name in the form data
- `photo_path` cannot be passed directly in the JSON body

---

### 2. Get Offers List

#### `GET /api/offers`

Returns a list of offers with filtering and pagination capabilities. Results are sorted by creation date (newest first).

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `title` - filter by title (optional, case-insensitive partial match, max 100 chars)
- `skills` - filter by skills (optional, array of skill IDs)
  - Example: `?skills[]=skill_id_1&skills[]=skill_id_2` or `?skills=skill_id_1&skills=skill_id_2`
- `offset` - pagination offset (optional, default: 0, min: 0)
- `limit` - number of records per page (optional, default: 20, max: 50, min: 1)

**Response 200 (Success):**
```json
{
  "offers": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Web Development Service",
      "description": "Professional web development services",
      "phoneNumber": "+1234567890",
      "price": 150,
      "photo_path": "photo_1234567890.jpg",
      "skills": [
        {
          "id": "507f1f77bcf86cd799439012",
          "name": "Express Js"
        }
      ],
      "ownerId": {
        "id": "507f1f77bcf86cd799439014",
        "first_name": "John",
        "last_name": "Doe",
        "photo_path": "user_photo.jpg",
        "mail": "john.doe@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "507f1f77bcf86cd799439015",
      "title": "Mobile App Development",
      "description": "iOS and Android app development",
      "phoneNumber": "+9876543210",
      "price": 200,
      "photo_path": null,
      "skills": [
        {
          "id": "507f1f77bcf86cd799439016",
          "name": "React Native"
        }
      ],
      "ownerId": {
        "id": "507f1f77bcf86cd799439017",
        "first_name": "Jane",
        "last_name": "Smith",
        "photo_path": null,
        "mail": "jane.smith@example.com"
      },
      "createdAt": "2024-01-14T08:20:00.000Z",
      "updatedAt": "2024-01-14T08:20:00.000Z"
    }
  ]
}
```

**Request Examples:**

Get all offers with default pagination:
```bash
curl -X GET "http://localhost:3000/api/offers" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Filter by title:
```bash
curl -X GET "http://localhost:3000/api/offers?title=web" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Filter by skills:
```bash
curl -X GET "http://localhost:3000/api/offers?skills[]=507f1f77bcf86cd799439012&skills[]=507f1f77bcf86cd799439013" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

With pagination:
```bash
curl -X GET "http://localhost:3000/api/offers?offset=10&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Combined filters:
```bash
curl -X GET "http://localhost:3000/api/offers?title=web&skills[]=507f1f77bcf86cd799439012&offset=0&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response 400 (Error):**
```json
{
  "error": "Invalid query parameter"
}
```

**Notes:**
- Results are sorted by `createdAt` in descending order (newest first)
- `title` filter uses case-insensitive regex matching
- `skills` filter returns offers that have at least one of the specified skills
- Default limit is 20, maximum is 50
- Default offset is 0

---

### 3. Get My Offers

#### `GET /api/offers/my`

Returns all offers created by the currently authenticated user. Results are sorted by creation date (newest first).

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200 (Success):**
```json
{
  "offers": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Web Development Service",
      "description": "Professional web development services",
      "phoneNumber": "+1234567890",
      "price": 150,
      "photo_path": "photo_1234567890.jpg",
      "skills": [
        {
          "id": "507f1f77bcf86cd799439012",
          "name": "Express Js"
        }
      ],
      "ownerId": {
        "id": "507f1f77bcf86cd799439014",
        "first_name": "John",
        "last_name": "Doe",
        "photo_path": "user_photo.jpg",
        "mail": "john.doe@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Response 200 (Empty List):**
```json
{
  "offers": []
}
```

**Request Example:**
```bash
curl -X GET http://localhost:3000/api/offers/my \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Notes:**
- Returns only offers where `ownerId` matches the authenticated user's ID
- Results are sorted by `createdAt` in descending order (newest first)
- Returns an empty array if the user has no offers

---

### 4. Update Offer

#### `PATCH /api/offers/:id`

Updates an existing offer. Only the owner of the offer can update it. Supports photo upload via multipart/form-data.

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data (if uploading photo) or application/json
```

**URL Parameters:**
- `id` - Offer ID (MongoDB ObjectId)

**Request Body (JSON):**
```json
{
  "title": "string (optional, max 100 chars)",
  "description": "string (optional, max 1000 chars)",
  "phoneNumber": "string (optional, valid international phone number)",
  "price": "number (optional)",
  "skills": ["skill_id_1", "skill_id_2"]
}
```

**Request Body (Form Data):**
- `title` - offer title (optional, max 100 characters)
- `description` - offer description (optional, max 1000 characters)
- `phoneNumber` - contact phone number (optional, valid international format)
- `price` - offer price (optional, number)
- `skills` - array of skill IDs (optional, default: empty array)
- `photo_path` - image file (optional)

**Validation:**
- All fields are optional
- `title` - maximum length 100 characters
- `description` - maximum length 1000 characters
- `phoneNumber` - must match pattern `/^\+?[1-9]\d{7,14}$/` if provided
- `skills` - array of strings (skill IDs), all IDs must exist in the database
- `photo_path` cannot be set directly in body (use `photo_path` file field)

**Response 200 (Success):**
```json
{
  "offer": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Updated Web Development Service",
    "description": "Updated description",
    "phoneNumber": "+9876543210",
    "price": 200,
    "photo_path": "new_photo_1234567890.jpg",
    "skills": [
      {
        "id": "507f1f77bcf86cd799439013",
        "name": "React"
      }
    ],
    "ownerId": {
      "id": "507f1f77bcf86cd799439014",
      "first_name": "John",
      "last_name": "Doe",
      "photo_path": "user_photo.jpg",
      "mail": "john.doe@example.com"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

**Response 400 (Error):**
```json
{
  "error": "Invalid offer id"
}
```
or
```json
{
  "error": "Skill not found"
}
```
or
```json
{
  "error": "photo_path is not allowed"
}
```

**Response 403 (Error):**
```json
{
  "error": "Forbidden"
}
```

**Response 404 (Error):**
```json
{
  "error": "Offer not found"
}
```

**Request Examples:**

Update with JSON:
```bash
curl -X PATCH http://localhost:3000/api/offers/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "price": 200
  }'
```

Update with photo:
```bash
curl -X PATCH http://localhost:3000/api/offers/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "title=Updated Title" \
  -F "photo_path=@/path/to/new_photo.jpg"
```

**Notes:**
- Only the owner of the offer can update it
- When uploading a new photo, the old photo is automatically deleted from the file system
- `skills` defaults to an empty array if not provided
- `updatedAt` is automatically updated when the offer is modified
- `photo_path` cannot be passed directly in the JSON body

---

### 5. Delete Offer

#### `DELETE /api/offers/:id`

Deletes an existing offer. Only the owner of the offer can delete it. If the offer has a photo, it is automatically deleted from the file system.

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - Offer ID (MongoDB ObjectId)

**Response 200 (Success):**
```json
{
  "offer": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Web Development Service",
    "description": "Professional web development services",
    "phoneNumber": "+1234567890",
    "price": 150,
    "photo_path": "photo_1234567890.jpg",
    "skills": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Express Js"
      }
    ],
    "ownerId": {
      "id": "507f1f77bcf86cd799439014",
      "first_name": "John",
      "last_name": "Doe",
      "photo_path": "user_photo.jpg",
      "mail": "john.doe@example.com"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response 400 (Error):**
```json
{
  "error": "Invalid offer id"
}
```

**Response 403 (Error):**
```json
{
  "error": "Forbidden"
}
```

**Response 404 (Error):**
```json
{
  "error": "Offer not found"
}
```

**Request Example:**
```bash
curl -X DELETE http://localhost:3000/api/offers/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Notes:**
- Only the owner of the offer can delete it
- If the offer has a `photo_path`, the file is automatically deleted from the file system
- The response returns the deleted offer data

---

## Offer Data Structure

```typescript
{
  id: string;                    // ObjectId as string
  title: string;                 // Offer title (max 100 characters)
  description: string;           // Offer description (max 1000 characters)
  phoneNumber: string;           // Contact phone number (international format)
  price?: number;                // Offer price (optional)
  photo_path?: string;           // Photo path (optional)
  skills: Array<{                // Skills array
    id: string;
    name: string;
  }>;
  ownerId: {                     // Owner information (short user format)
    id: string;
    first_name: string | null;
    last_name: string | null;
    photo_path: string | null;
    mail: string | null;
  };
  createdAt: Date;               // Creation date
  updatedAt: Date;               // Last update date
}
```

---

## Error Codes

- **200** - Successful request
- **201** - Resource created successfully
- **400** - Validation error or incorrect data
- **401** - Not authenticated
- **403** - Forbidden (not the owner of the resource)
- **404** - Resource not found

---

## Notes

1. **Authentication**: All endpoints in this module require JWT authentication. The token is obtained through the `/api/login` endpoint and is valid for 14 days.

2. **Photo Management**: 
   - Photos can be uploaded using multipart/form-data with the field name `photo_path`
   - When updating an offer with a new photo, the old photo is automatically deleted
   - When deleting an offer, its photo is automatically deleted from the file system
   - `photo_path` cannot be passed directly in JSON body

3. **Skills**: 
   - Skills are stored as references to the `Skill` collection
   - All skill IDs provided must exist in the database
   - When creating an offer, at least one skill is required
   - When updating an offer, skills default to an empty array if not provided

4. **Phone Number Format**: 
   - Phone numbers must be in international format
   - Valid formats: `+1234567890` or `1234567890` (7-14 digits, starting with 1-9)
   - Pattern: `/^\+?[1-9]\d{7,14}$/`

5. **Pagination**: 
   - Default limit: 20 offers per page
   - Maximum limit: 50 offers per page
   - Default offset: 0
   - Results are always sorted by creation date (newest first)

6. **Authorization**: 
   - Users can only update and delete their own offers
   - Attempting to modify or delete someone else's offer returns a 403 Forbidden error

7. **Filtering**:
   - Title filter is case-insensitive and uses partial matching
   - Skills filter returns offers that have at least one of the specified skills
   - Filters can be combined for more specific results

