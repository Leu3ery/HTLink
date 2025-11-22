# API Documentation for Skills Module

## General Information

All endpoints of the Skills module are available at the base URL: `/api/skills`

Skills are predefined items that users can select and associate with their profiles. Skills are automatically initialized in the database when the server starts using the `SetSkills` script.

---

## Endpoints

### 1. Get All Skills

#### `GET /api/skills`

Returns a list of all available skills in the system.

**Authentication:** Not required

**Response 200 (Success):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Express Js"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Angular"
  }
]
```

**Request Example:**
```bash
curl -X GET http://localhost:3000/api/skills
```

**Response Format:**
- Returns an array of skill objects
- Each skill object contains:
  - `id` - Unique identifier (MongoDB ObjectId as string)
  - `name` - Skill name (unique, required)

---

## Skill Data Structure

```typescript
{
  id: string;    // ObjectId as string
  name: string;  // Skill name (unique, required)
}
```

---

## Initialization and Management

### Automatic Initialization

Skills are automatically initialized when the server starts. The initialization is handled by the `SetSkills` script located at `server/src/scripts/setSkills.ts`.



#### How It Works

1. **On Server Start**: When the server starts, the `SetSkills` script is executed automatically (see `server/src/server.ts`)

2. **Check Existing Data**: The script checks if skills are already set by comparing the count of documents in the database with the number of predefined skills

3. **Reset and Populate**: If the count doesn't match:
   - All existing skills are deleted
   - All predefined skills are inserted into the database using `bulkWrite`
   - A success message is logged

4. **Skip If Already Set**: If skills are already correctly set, the script skips the operation and logs "Skills already set"


#### Customizing Skills

To customize the skills, you can modify the `SetSkills.skills` array in `server/src/scripts/setSkills.ts`:

```typescript
static skills = ["Express Js", "Angular", "Python", "React", "Vue.js", ...];
```

**Note**: After modifying the skills array, you need to:
1. Restart the server
2. The script will automatically detect the mismatch and update the database

Alternatively, you can instantiate the class with a custom array:

```typescript
const customSkills = ["JavaScript", "TypeScript", "Java", "C++"]
await new SetSkills(customSkills).set()
```

---

## Model Schema

```typescript
interface ISkill {
  _id: Types.ObjectId,
  name: string  // unique, required
}

const skillSchema = new Schema<ISkill>({
  name: {
    type: String,
    unique: true,
    required: true
  }
})
```

## Error Codes

- **200** - Successful request
- **500** - Server error (e.g., database connection issues)
