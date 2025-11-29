# 📨 HTLink Backend

HTLink is an internal social network platform designed for connecting students and showcasing their profiles to potential employers. The platform enables users to find collaborators for joint projects and allows administrators to publish important school-related announcements.

> **⚠️ Project Status:** The project is currently under active development. The core functionality is being implemented incrementally.

**The project consists of:**

**Backend** – handles authentication, user management, project management, LDAP integration, and news administration.

**Frontend** – Angular-based web application providing a modern and intuitive user interface.

## 🚀 Tech Stack

**Node.js + Express.js** – REST API

**TypeScript** – type safety and code reliability

**MongoDB** – database with Mongoose ORM

**Jest** – testing framework

**Angular** – frontend framework

**LDAP (ldapts)** – authentication for students via internal LDAP server

**JWT** – authentication

**Express Rate Limit** – API rate limiting

**CORS** – cross-origin resource sharing

**Docker + Docker Compose** – containerization and deployment

**GitHub Actions** – CI/CD pipeline

**Git/GitHub** – version control

**Jira + SCRUM** – project management and team collaboration

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd HTLink
```

### 2. Install dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

### 3. Create .env file

Create a `.env` file in the `server` root directory with the following variables:

```env
PORT=3000
JWT_SECRET=your_jwt_secret

# MongoDB Configuration
MONGO_URI=mongodb://127.0.0.1:27017/htlgram
PASSWORD_SALT=10

# LDAP Configuration (for student authentication)
LDAP_URL=your_ldap_server_url
LDAP_BIND_DN=your_ldap_bind_dn
LDAP_BIND_PW=your_ldap_bind_password
LDAP_SEARCH_BASES=your_search_base1;your_search_base2

# CORS Configuration
DOMEN=*
```

### 4. Setup MongoDB Database

Make sure MongoDB is installed and running. The application will use the database specified in `MONGO_URI`.

### 5. Run the application

**Backend (Development mode):**
```bash
cd server
npm run test  # Run tests first (optional)
# Start server (you may need to configure a start script)
ts-node src/server.ts
```

**Frontend (Development mode):**
```bash
cd client
ng serve
# or
npm start
```

The server will start on `http://localhost:3000` by default (or the port specified in your `.env` file).
The frontend will typically run on `http://localhost:4200`.

### 6. Docker Setup (Alternative)

Run the entire application stack using Docker Compose:

```bash
docker-compose up -d
```

Make sure to create a `.env` file in the root directory with all required environment variables for Docker Compose.

## 🔑 Key Features

### ✅ Currently Implemented

**LDAP Authentication:** Secure student login using internal LDAP server

**User Profile:** Personal profile management and editing functionality

**Project Management:** Currently under active development - work is being done on project creation, search, and management features with role-based access

### 🚧 Planned Features

**News System:** Admin-controlled announcements for important school-related information

**Feed:** Centralized activity feed

**Marketplace:** Discover and browse available resources

**Image Management:** Upload and manage project images

## 📁 Project Structure

```
HTLink/
├── server/                    # Backend application
│   ├── src/
│   │   ├── app.ts            # Express app configuration
│   │   ├── server.ts         # Server entry point
│   │   ├── config/
│   │   │   ├── config.ts     # Environment configuration
│   │   │   └── db.ts         # Database connection
│   │   ├── modules/
│   │   │   ├── users/        # User management module
│   │   │   │   ├── authenticate.ts  # LDAP authentication service
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── users.model.ts
│   │   │   ├── projects/     # Project management module
│   │   │   │   ├── dto/      # Data Transfer Objects
│   │   │   │   ├── images/   # Image management
│   │   │   │   └── utils/    # Project helper functions
│   │   │   ├── skills/       # Skills management
│   │   │   └── categories/   # Categories management
│   │   ├── common/
│   │   │   ├── middlewares/  # Custom middlewares (JWT, error handling, etc.)
│   │   │   ├── multer/       # File upload configuration
│   │   │   └── utils/        # Utility functions
│   │   └── scripts/          # Database initialization scripts
│   ├── tests/                # Integration tests
│   ├── public/               # Public static files
│   └── package.json
│
├── client/                    # Frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/        # Application pages
│   │   │   │   ├── feed/     # Activity feed
│   │   │   │   ├── projects/ # Project pages
│   │   │   │   ├── profile/  # User profiles
│   │   │   │   ├── news/     # News/announcements
│   │   │   │   ├── marketplace/
│   │   │   │   └── users/
│   │   │   ├── core/         # Core services and guards
│   │   │   └── shared/       # Shared UI components
│   │   └── main.ts
│   └── package.json
│
├── docker-compose.yaml        # Docker Compose configuration
└── README.md
```

## 🔗 API Endpoints

- `/api/` - Authentication endpoints (login via LDAP)
- `/api/users` - User management endpoints
- `/api/projects` - Project management endpoints
- `/api/skills` - Skills endpoints
- `/api/categories` - Categories endpoints

## 🧪 Testing

The backend uses Jest for testing:

```bash
cd server
npm test
```

Integration tests are located in the `server/tests/` directory.

## 🔒 Security

- **JWT token authentication** for protected routes
- **Rate limiting** to prevent API abuse (100 requests per minute)
- **CORS configuration** for secure cross-origin requests
- **LDAP authentication** for secure student login
- **Input validation** using Joi schemas

## 📊 Development Status

**⚠️ This project is currently under active development.**

**Current implementation status:**

✅ **Authentication** - LDAP-based authentication for students is fully implemented and functional

✅ **User Profile** - Personal profile management, viewing, and editing features are complete

🚧 **Projects** - Active development is ongoing for project creation, search, management, and collaboration features

📋 **Planned** - News system, activity feed, marketplace, and additional features are planned for future releases

## 👥 Team & Development

This project is developed by a team of 4 people using:
- **SCRUM methodology** for agile development
- **Jira** for project management and task tracking
- **Git/GitHub** for version control and collaboration

## 🚀 Deployment

The project uses:
- **Docker** and **Docker Compose** for containerization
- **GitHub Actions** for CI/CD automation

Deployment images:
- Backend: `leu3ery/htlink-backend:latest`
- Frontend: `leu3ery/htlink-frontend:latest`

## 📝 Additional Notes

- The application automatically initializes skills and categories on server startup
- Public files (images) are served from the `/public` directory
- LDAP search bases can be configured as semicolon-separated values for multiple search bases
