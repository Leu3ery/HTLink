# API Documentation for Categories Module

## General Information

All endpoints of the Categories module are available at the base URL: `/api/categories`

Categories are predefined project categories that can be used to classify projects. Categories are automatically initialized in the database when the server starts using the `setCategories` script.

---

## Endpoints

### 1. Get All Categories

#### `GET /api/categories`

Returns a list of all available categories in the system.

**Authentication:** Not required

**Response 200 (Success):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Web development"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Mobile development"
  },
  {
    "id": "507f1f77bcf86cd799439020",
    "name": "Other"
  }
]
```

**Request Example:**
```bash
curl -X GET http://localhost:3000/api/categories
```

**Response Format:**
- Returns an array of category objects
- Each category object contains:
  - `id` - Unique identifier (MongoDB ObjectId as string)
  - `name` - Category name (required)

---

## Category Data Structure

```typescript
{
  id: string;    // ObjectId as string
  name: string;  // Category name (required)
}
```

---

## Initialization and Management

### Automatic Initialization

Categories are automatically initialized when the server starts. The initialization is handled by the `setCategories` script located at `server/src/scripts/setCategories.ts`.



#### How It Works

1. **On Server Start**: When the server starts, the `setCategories` script is executed automatically (see `server/src/server.ts`)

2. **Check Existing Data**: The script checks if categories are already set by comparing the count of documents in the database with the number of predefined categories

3. **Reset and Populate**: If the count doesn't match:
   - All existing categories are deleted
   - All predefined categories are inserted into the database using `bulkWrite`
   - A success message is logged

4. **Skip If Already Set**: If categories are already correctly set, the script skips the operation and logs "Categories already set"


#### Customizing Categories

To customize the categories, you can modify the `category` array in `server/src/scripts/setCategories.ts`:

```typescript
export const category = [
    "Web development",
    "Mobile development",
    "Design",
    "Fullstack",
    "AI",
    ...
];
```

**Note**: After modifying the categories array, you need to:
1. Restart the server
2. The script will automatically detect the mismatch and update the database

Alternatively, you can instantiate the class with a custom array:

```typescript
const customCategories = ["Frontend", "Backend", "Fullstack", "DevOps"]
await new setCategories(customCategories).set()
```

---

## Model Schema

```typescript
interface ICategory {
  _id: Types.ObjectId,
  name: string  // required
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true
  }
})
```

## Error Codes

- **200** - Successful request
- **500** - Server error (e.g., database connection issues)
