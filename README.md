# 📨 HTLink Backend

HTLink is an internal social network platform designed for connecting students and showcasing their profiles to potential employers. The platform enables users to find collaborators for joint projects and allows administrators to publish important school-related announcements.

> **⚠️ Project Status:** The project is currently under active development. The core functionality is being implemented incrementally.

**The project consists of:**

**Backend** – handles authentication, user management, project management, and news administration.

**Frontend** – Angular-based web application providing a modern and intuitive user interface.

## 🚀 Tech Stack

**Node.js + Express.js** – REST API

**TypeScript** – type safety and code reliability

**MongoDB** – database with Mongoose ORM

**Jest** – testing framework

**Angular** – frontend framework

**JWT** – token-based authentication

**Nodemailer** – email service for verification codes

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
JWT_SECRET_COMPOSE=2690b22d6349b352e8d517e3434f78d5


# MongoDB Configuration
PASSWORD_SALT=10
MONGO_URI_COMPOSE=mongodb://username:pass@mongodb:27017/dbname?authSource=admin
MONGO_INITDB_ROOT_USERNAME=username
MONGO_INITDB_ROOT_PASSWORD=pass

EMAIL_TYPE=production
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
# or dev for tests

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

**Email-Based Authentication:** Secure user login with two methods:
- Passwordless authentication via email verification code
- Password-based authentication

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
│   │   │   ├── authorisation/ # Authentication module
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── email/     # Email service for verification codes
│   │   │   ├── users/        # User management module
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

- `/api/send-code` - Send verification code to email
- `/api/verify-code` - Verify code and get JWT token
- `/api/login` - Login with email and password
- `/api/users` - User management endpoints
- `/api/projects` - Project management endpoints
- `/api/skills` - Skills endpoints
- `/api/categories` - Categories endpoints
- `/api/offers` - Offers/marketplace endpoints

For detailed API documentation, see the `/server/docs/` directory.

## 🧪 Testing

The backend uses Jest for testing:

```bash
cd server
npm test
```

Integration tests are located in the `server/tests/` directory.

## 🔒 Security

- **JWT token authentication** for protected routes (14-day token expiration)
- **Rate limiting** on authentication endpoints to prevent abuse:
  - Send code: 3 requests per 15 minutes
  - Verify code: 5 requests per 15 minutes
  - Login: 10 requests per 15 minutes
- **CORS configuration** for secure cross-origin requests
- **Email verification** with cryptographically secure codes (SHA-256 hashing)
- **Password hashing** using bcrypt for secure storage
- **Input validation** using Joi schemas
- **Code expiration** (20 minutes) and attempt limiting (5 attempts per code)

## 📊 Development Status

**⚠️ This project is currently under active development.**

**Current implementation status:**

✅ **Authentication** - Email-based authentication system is fully implemented with two methods:
- Passwordless login via verification code
- Traditional login with email and password

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
- Email format for authentication: `firstname.lastname@htlstp.at`
- Verification codes are valid for 20 minutes with maximum 5 attempts
- JWT tokens are valid for 14 days
- Comprehensive API documentation is available in `/server/docs/`:
  - `auth.docs.md` - Authentication endpoints
  - `users.docs.md` - User management
  - `offers.docs.md` - Offers/marketplace
  - `skills.docs.md` - Skills management
  - `categories.docs.md` - Categories management
