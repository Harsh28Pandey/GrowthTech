# Growth Tech — User & Access Management Platform

A production-ready, full-stack User & Access Management Platform built on the **MERN** stack (MongoDB, Express.js, React.js, Node.js) with Tailwind CSS. Growth Tech delivers role-based access control (RBAC), fine-grained permission matrices, administrative oversight, project/record management, and real-time aggregated metrics.

---

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [UI & Design Philosophy](#ui--design-philosophy)
- [Tech Stack](#tech-stack)
- [Project Folder Structure](#project-folder-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [Running the Application](#running-the-application)
- [Default Demo Credentials](#default-demo-credentials)
- [REST API Reference](#rest-api-reference)
- [Role-Based Access Control (RBAC) Matrix](#role-based-access-control-rbac-matrix)
- [Security Architecture](#security-architecture)
- [Screenshots & UI Preview](#screenshots--ui-preview)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Future Improvements](#future-improvements)

---

## Overview

**Growth Tech** is an enterprise-grade platform designed to streamline identity governance, user lifecycle management, and resource authorization. It provides separate operational workspaces for standard users and platform administrators, enabling organizations to enforce strict zero-trust security postures and least-privilege access policies.

---

## Key Features

### 1. Robust Authentication & Session Management
- **Registration & Login**: Secure credential authentication with client- and server-side validation.
- **Show/Hide Password**: Clear, accessible toggle for password visibility on all auth forms.
- **Admin Portal Entry (`/admin/login`)**: Isolated, hardened authentication gateway restricted strictly to accounts holding the `admin` role.
- **httpOnly Cookie JWT**: Access tokens stored in secure, `httpOnly`, `sameSite` cookies preventing XSS-based token theft.
- **Account State Verification**: Instant login rejection with informative messaging for accounts in `inactive` status.
- **Persistent Sessions**: Automatic session restoration on initial load via `GET /api/auth/me`.

### 2. Administrator Portal & Governance
- **Executive System Overview (`/admin/dashboard`)**:
  - 5 real-time aggregated metric cards: Total Users, Active Users, Inactive Users, Total Records, New Registrations This Month.
  - Interactive Recharts visualizations: Users grouped by Role and 6-Month Registration Growth curves (with motion-free rendering).
  - Quick-glance recent users and recent project records tables.
- **User Management (`/admin/users`)**:
  - Paginated data table with debounced search, role filtering, status filtering, and column sorting.
  - Full CRUD operations with detailed user view modals.
  - Instant Active/Inactive status toggle.
  - **Self-Protection Guardrails**: Admins cannot delete or deactivate their own administrative accounts (enforced on both client and API).
- **Access & Role Management (`/admin/roles`)**:
  - Seeded system roles: `admin`, `manager`, `user`.
  - Custom role provisioning with identifier slugs and human-friendly display names.
  - Dynamic **Permission Checkbox Matrix** allowing granular capability assignment across Users, Roles, and Records.
  - Prevention against deleting system-critical roles or custom roles actively assigned to users.

### 3. Project / Record Lifecycle Management (`/records`)
- **Full CRUD Entity**:
  - Fields: `title`, `description`, `category` (Engineering, Marketing, Sales, Design, Operations, Finance, Human Resources, Other), `status` (`pending`, `in-progress`, `completed`), `priority` (`low`, `medium`, `high`), `dueDate`, `createdBy`, and timestamps.
- **Role-Based Scope**:
  - Regular users manage their personal project deliverables.
  - Admins and managers hold organization-wide oversight to view, update, and manage all records.
- **Modal Modals & Dialogs**:
  - Modal creation and editing forms pre-filled with existing data.
  - Comprehensive inspection modal for complete project metadata.
  - Mandatory confirmation modal before performing destructive deletions.

### 4. Standard User Workspace
- **Personal Dashboard (`/dashboard`)**:
  - Metrics tracking assigned project deliverables (Total, Pending, In Progress, Completed).
  - Summary of recent personal tasks and user profile details.
- **Profile Page (`/profile`)**:
  - Inspection of user credentials, assigned role descriptions, and granted permissions list.

---

## UI & Design Philosophy

The UI adheres strictly to a clean, flat, high-clarity enterprise aesthetic:
- **No Distracting Animations**: Zero animated backgrounds, parallax, bouncing, or layout shimmers. Loading states utilize clean, lightweight CSS spinners.
- **Neutral Palette**: Neutral white (`#FFFFFF`) and slate gray backgrounds (`#F9FAFB`), dark gray typography (`#111827`, `#374151`), and a single focused primary blue accent (`#2563EB`). Amber, green, and red are reserved solely for status indicators.
- **Flat Layout Geometry**: Crisp 1px borders (`border-gray-200`), minimal subtle shadows, and uniform 6–8px rounded corners.
- **Responsive Navigation**: Fixed left-hand desktop sidebar paired with a top utility bar. Seamless, instant-toggle mobile drawer menu.
- **Document Titles**: Dynamic browser document titles structured as `<Page Name> | Growth Tech`.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router 7, Axios, Context API, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Node.js (ES Modules), Express.js 4, Mongoose 8 |
| **Database** | MongoDB (v6 / v7 / v8) |
| **Security & Middleware** | JWT, bcryptjs, Helmet, CORS, express-mongo-sanitize, express-rate-limit, cookie-parser, express-validator |
| **Orchestration** | Concurrently |

---

## Project Folder Structure

```
growth-tech/
├── client/                      # React frontend (Vite)
│   ├── src/
│   │   ├── api/                 # Axios client instance & specialized API services
│   │   │   ├── axios.js
│   │   │   ├── authApi.js
│   │   │   ├── dashboardApi.js
│   │   │   ├── userApi.js
│   │   │   ├── roleApi.js
│   │   │   └── recordApi.js
│   │   ├── components/
│   │   │   ├── common/          # Button, Input, Select, Modal, ConfirmDialog, Loader, Toast, Pagination, Badge, ErrorBoundary
│   │   │   ├── layout/          # Navbar, Sidebar, DashboardLayout, AuthLayout
│   │   │   └── dashboard/       # StatCard, DataTable, Charts (isAnimationActive={false})
│   │   ├── context/             # AuthContext, ToastContext
│   │   ├── hooks/               # useAuth, useToast, useDebounce, usePageTitle
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── admin/           # AdminLogin, AdminDashboard, UserManagement, RoleManagement
│   │   │   ├── user/            # UserDashboard, Profile, Records
│   │   │   └── NotFound.jsx     # Custom 404 page
│   │   ├── routes/              # ProtectedRoute, AdminRoute
│   │   ├── utils/               # validators, constants
│   │   ├── App.jsx              # Main application router
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Tailwind directives & base styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── package.json
├── server/                      # Node.js backend
│   ├── src/
│   │   ├── config/              # MongoDB connection & environment loader
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   ├── controllers/         # auth, dashboard, user, role, record controllers
│   │   ├── middleware/          # authenticate, authorize, errorHandler, validate
│   │   │   └── validators/      # express-validator schemas for all endpoints
│   │   ├── models/              # User, Role, Record Mongoose schemas
│   │   ├── routes/              # Modular Express route handlers
│   │   ├── utils/               # ApiError, apiResponse, token helpers, permissions
│   │   ├── seed/                # Database seeder (admin, sample users, project records)
│   │   │   └── seed.js
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # HTTP server startup
│   ├── test-api.js              # Automated end-to-end API test suite
│   ├── .env.example
│   └── package.json
├── .gitignore
├── .prettierrc
├── package.json                 # Root script runner (concurrently)
└── README.md
```

---

## Prerequisites

Ensure you have the following installed locally:
- **Node.js**: v18.x or higher (v20+ recommended)
- **npm**: v9.x or higher
- **MongoDB**: Community Server running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas URI)

---

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Harsh28Pandey/GrowthTech.git
   cd GrowthTech
   ```

2. **Install all dependencies** (root, server, and client):
   ```bash
   npm run install:all
   ```
   *Or install individually:*
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

3. **Configure Environment Variables**:
   Copy the example environment files for both backend and frontend:
   ```bash
   # In server/
   cp server/.env.example server/.env

   # In client/
   cp client/.env.example client/.env
   ```

---

## Environment Variables

### Backend Configuration (`server/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | Port for the Express backend server |
| `NODE_ENV` | `development` | Runtime environment (`development` or `production`) |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/growthtech` | MongoDB connection string |
| `JWT_SECRET` | `growthtech_jwt_secret_super_secure_key_12345` | Secret key used for signing JWT tokens |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_URL` | `http://localhost:5173` | Allowed origin for CORS and cookie dispatch |

### Frontend Configuration (`client/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL for backend REST API endpoints |

---

## Database Seeding

Populate the database with initial roles, default administrator credentials, 10 realistic sample users (including an inactive account), and 20 sample project records:

```bash
npm run seed
```

---

## Running the Application

### Option A: Run Both Concurrently (Recommended)
From the project root:
```bash
npm run dev
```
- Frontend will open at: **http://localhost:5173**
- Backend API will listen at: **http://localhost:5000/api**

### Option B: Run Services Individually
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

---

## Default Demo Credentials

> [!IMPORTANT]
> The default admin account is seeded automatically. In production environments, immediately modify default passwords or generate new administrative credentials.

| Role | Email Address | Password | Permissions & Notes |
|---|---|---|---|
| **Administrator** | `admin@growthtech.com` | `Admin@1234` | Full access; access to `/admin/login`, `/admin/dashboard`, User Management, and Roles & Permissions |
| **Project Manager** | `sarah.jenkins@growthtech.com` | `User@1234` | Project management across organization, user directory view |
| **Standard User** | `elena.rostova@growthtech.com` | `User@1234` | Personal workspace, personal project CRUD |
| **Inactive User** | `rachel.green@growthtech.com` | `User@1234` | *Account deactivated* (test login rejection behavior) |

---

## REST API Reference

Base URL: `/api`

### 1. Authentication (`/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user account | Public |
| `POST` | `/auth/login` | Standard user authentication | Public |
| `POST` | `/auth/admin/login` | Administrator authentication (requires `admin` role) | Public |
| `POST` | `/auth/logout` | Clear authentication cookie | Authenticated |
| `GET` | `/auth/me` | Fetch profile of currently authenticated user | Authenticated |

### 2. Dashboard Analytics (`/dashboard`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/dashboard/stats` | Aggregated metrics, charts & recent records | Authenticated |

### 3. User Governance (`/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/users` | Paginated users table (search, filter, sort) | Admin (`users:read`) |
| `POST` | `/users` | Provision new user account | Admin (`users:write`) |
| `GET` | `/users/:id` | Fetch specific user details | Admin (`users:read`) |
| `PUT` | `/users/:id` | Update user metadata, role, or password | Admin (`users:write`) |
| `PATCH` | `/users/:id/status` | Toggle status between Active and Inactive | Admin (`users:write`) |
| `DELETE` | `/users/:id` | Permanently remove user and assigned records | Admin (`users:delete`) |

### 4. Role & Access Control (`/roles`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/roles` | List all roles, permissions, and user counts | Admin (`roles:read`) |
| `POST` | `/roles` | Create new custom role | Admin (`roles:write`) |
| `PUT` | `/roles/:id` | Update role permissions matrix or description | Admin (`roles:write`) |
| `DELETE` | `/roles/:id` | Delete custom role (if unused and non-system) | Admin (`roles:delete`) |

### 5. Projects & Records (`/records`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/records` | List projects (search, filter, sort, paginate) | Authenticated |
| `POST` | `/records` | Create new project deliverable | Authenticated |
| `GET` | `/records/:id` | Get project detail | Authenticated |
| `PUT` | `/records/:id` | Update project deliverable | Owner / Admin |
| `DELETE` | `/records/:id` | Delete project deliverable | Owner / Admin |

---

## Role-Based Access Control (RBAC) Matrix

| Permission Key | Description | Admin | Manager | User |
|---|---|:---:|:---:|:---:|
| `users:read` | View user roster and profiles | ✓ | ✓ | — |
| `users:write` | Create, edit, and toggle user accounts | ✓ | — | — |
| `users:delete` | Remove user accounts | ✓ | — | — |
| `roles:read` | View roles and permission matrix | ✓ | — | — |
| `roles:write` | Create roles and edit permissions | ✓ | — | — |
| `roles:delete` | Delete unused custom roles | ✓ | — | — |
| `records:read` | Read project records | ✓ | ✓ (all) | ✓ (own) |
| `records:write` | Create and modify project records | ✓ | ✓ (all) | ✓ (own) |
| `records:delete` | Remove project records | ✓ | ✓ (all) | ✓ (own) |

---

## Security Architecture

1. **Password Hashing**: Passwords salted and hashed with `bcryptjs` using 10 rounds. Password fields are omitted by default via Mongoose `select: false` and explicitly stripped in `User.toJSON()`.
2. **httpOnly Cookie Storage**: JWT tokens stored in httpOnly, sameSite cookies to protect against cross-site scripting (XSS).
3. **NoSQL Injection Defense**: `express-mongo-sanitize` scrubs all `$` and `.` operators from incoming request bodies and query parameters.
4. **Security Headers**: `helmet` applies essential security headers (HSTS, X-Content-Type-Options, Frameguard).
5. **Rate Limiting**: `express-rate-limit` enforces a maximum of 100 authentication requests per 15-minute window per IP.
6. **Strict CORS**: Origin whitelist restricted to the frontend application URL (`http://localhost:5173`) with credential exchange enabled.
7. **Administrative Self-Protection**: Logic prevents administrators from deactivating or deleting their own account or removing their own administrative role.

---

## Screenshots & UI Preview

### 1. Administrative Overview (`/admin/dashboard`)
*Responsive dashboard showcasing 5 core metrics, user role distribution chart, 6-month registration growth, and recent activity tables.*

```
+-----------------------------------------------------------------------------------------+
| [^] Growth Tech  Admin Console                    (Search...)     System Administrator  |
+-------------------+---------------------------------------------------------------------+
| [Dashboard]       | SYSTEM OVERVIEW                                                     |
| [User Management] |                                                                     |
| [Roles & Access]  | [Total Users: 11] [Active: 10] [Inactive: 1] [Records: 20] [New: 11]|
| [Projects]        |                                                                     |
| [My Profile]      | +-----------------------------+ +---------------------------------+ |
|                   | | Users by Role (Bar Chart)   | | 6-Month Registrations (Chart)   | |
|                   | +-----------------------------+ +---------------------------------+ |
|                   |                                                                     |
|                   | +-----------------------------+ +---------------------------------+ |
|                   | | Recent Users (Table)        | | Recent Projects (Table)         | |
|                   | +-----------------------------+ +---------------------------------+ |
+-------------------+---------------------------------------------------------------------+
```

### 2. User Governance (`/admin/users`)
*Clean, flat table with status badges, instant status toggles, user search, role/status filters, and user creation modal.*

### 3. Role & Permission Matrix (`/admin/roles`)
*Custom role creation and granular capability assignment using an interactive checkbox matrix.*

---

## Testing & Quality Assurance

Growth Tech includes an automated end-to-end API test suite validating all 25 core security rules, authentication paths, CRUD operations, and permission checks.

To run the automated test suite:
```bash
npm run test:api
```

Expected output:
```
--- STARTING GROWTH TECH END-TO-END API TEST SUITE ---
[1. System Health]
  ✓ PASS: GET /api/health returned 200 OK
[2. Authentication & Authorization]
  ✓ PASS: Inactive user login is correctly rejected with 403 Forbidden
  ✓ PASS: Invalid password rejected with 401 Unauthorized
  ✓ PASS: POST /api/auth/admin/login succeeds for system admin
  ✓ PASS: Password hash is excluded from response
  ✓ PASS: POST /api/auth/login succeeds for standard user
  ✓ PASS: Standard user is blocked from /api/auth/admin/login with 403 Forbidden
  ✓ PASS: GET /api/auth/me returns admin user session
...
=================================================
TEST SUMMARY: 25 PASSED, 0 FAILED
=================================================
```

---

## Future Improvements

1. **Two-Factor Authentication (2FA)**: Time-based One-Time Passwords (TOTP) using authenticator apps.
2. **Audit Log System**: Immutable activity logs tracking role changes, permission adjustments, and user status toggles.
3. **Session Revocation & Device Management**: Redis-backed session token store for instant remote token invalidation.
4. **CSV Export & Bulk Provisioning**: Administrative batch import/export for enterprise user directories.
5. **Email Verification & Password Reset**: Automated SMTP email verification flows with time-limited signed tokens.

---

## License

This project is open-source under the ISC License.

