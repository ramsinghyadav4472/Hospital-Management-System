# 🏥 Hospital Management System

A full-stack web application to digitize and streamline hospital operations — managing patients, doctors, appointments, and medical records with secure, role-based access control.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Role-Based Access Control](#role-based-access-control)
- [Database Models](#database-models)
- [Screenshots / Pages](#screenshots--pages)
- [Security](#security)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## Overview

The Hospital Management System is a comprehensive full-stack web application designed to automate hospital administrative tasks. It supports three user roles — **Admin**, **Doctor**, and **Patient** — each with a dedicated dashboard and role-restricted access to data.

Built with a **Node.js / Express.js** REST API backend and a **vanilla HTML/CSS/JavaScript** frontend, the system uses **MongoDB** for persistent storage and **JWT** for secure authentication.

---

## Features

| Feature | Description |
|---|---|
| 🔐 Authentication | JWT-based login with bcrypt password hashing |
| 👥 Role Management | Admin, Doctor, and Patient roles with RBAC |
| 📅 Appointments | Book, approve, complete, and cancel appointments |
| 🏥 Medical Records | Doctors create; patients view their own records |
| 🛡️ Security | Protected routes, input validation, CORS |
| 📊 Dashboards | Separate, role-specific dashboards |

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | Latest | Runtime environment |
| Express.js | ^4.18.2 | Web framework |
| MongoDB | Latest | NoSQL database |
| Mongoose | ^8.0.3 | MongoDB ODM |
| jsonwebtoken | ^9.0.2 | Authentication tokens |
| bcryptjs | ^2.4.3 | Password hashing |
| cors | ^2.8.5 | Cross-origin requests |
| express-validator | ^7.0.1 | Input validation |
| dotenv | ^16.3.1 | Environment variables |
| nodemon | ^3.0.2 | Dev auto-restart |

### Frontend

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling (glassmorphism UI) |
| Vanilla JavaScript | Client-side logic |
| Fetch API | HTTP requests to backend |

---

## Project Structure

```
Hospital Management System/
├── Backend/                        # Node.js + Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js             # User schema (Admin/Doctor/Patient)
│   │   │   ├── Appointment.js      # Appointment schema
│   │   │   └── MedicalRecord.js    # Medical record schema
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── appointment.controller.js
│   │   │   └── medicalRecord.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── appointment.routes.js
│   │   │   └── medicalRecord.routes.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js  # JWT verification & RBAC
│   │   └── app.js                  # Express app configuration
│   ├── server.js                   # Server entry point
│   ├── .env                        # Environment variables
│   ├── .gitignore
│   └── package.json
│
├── Frontend/                       # Vanilla HTML/CSS/JS client
│   ├── index.html                  # Login page
│   ├── signup.html                 # Registration page
│   ├── admin.html                  # Admin dashboard
│   ├── doctor.html                 # Doctor dashboard
│   ├── patient.html                # Patient dashboard
│   ├── css/
│   │   ├── login.css
│   │   ├── dashboard.css
│   │   ├── doctor.css
│   │   ├── patient.css
│   │   ├── table.css
│   │   └── global.css
│   ├── js/
│   │   ├── api.js                  # API base URL configuration
│   │   ├── login.js
│   │   ├── signup.js
│   │   ├── admin.js
│   │   ├── doctor.js
│   │   ├── patient.js
│   │   ├── appointments.js
│   │   └── patients.js
│   └── assest/                     # Static assets
│
└── README.md                       # ← You are here
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- [MongoDB](https://www.mongodb.com/) — local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- npm (comes with Node.js)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Hospital Management System"
```

### 2. Backend Setup

```bash
# Navigate to the backend folder
cd Backend

# Install dependencies
npm install

# Create the .env file
```

Create a `.env` file inside the `Backend/` folder:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5500
```

> **MongoDB Atlas**: Replace `MONGODB_URI` with your Atlas connection string.

```bash
# Start the development server (with auto-restart)
npm run dev

# OR start in production mode
npm start
```

The API will be available at: **<http://localhost:5000>**

### 3. Frontend Setup

No build step is required. Simply:

1. Open the `Frontend/` folder.
2. Open `index.html` in your browser directly, **or** use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VS Code extension.
3. Ensure `Frontend/js/api.js` points to your backend URL (default: `http://localhost:5000`).

---

## API Endpoints

All protected routes require the `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and get JWT token |
| `GET` | `/api/auth/me` | Protected | Get current user profile |

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | Get all users |
| `GET` | `/api/users/role/:role` | Admin | Get users by role |

### Appointments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/appointments` | Protected | Get appointments (role-filtered) |
| `POST` | `/api/appointments` | Patient | Create an appointment |
| `PUT` | `/api/appointments/:id` | Admin / Doctor | Update appointment status |
| `DELETE` | `/api/appointments/:id` | Admin | Delete an appointment |

### Medical Records

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/medical-records` | Protected | Get records (role-filtered) |
| `POST` | `/api/medical-records` | Doctor | Create a medical record |
| `GET` | `/api/medical-records/:id` | Protected | Get a single record |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check if the API is running |

---

## Role-Based Access Control

| Permission | Admin | Doctor | Patient |
|---|:---:|:---:|:---:|
| View all users | ✅ | ❌ | ❌ |
| View all appointments | ✅ | ❌ | ❌ |
| View assigned appointments | ✅ | ✅ | ❌ |
| View own appointments | ✅ | ✅ | ✅ |
| Create appointments | ✅ | ❌ | ✅ |
| Update appointment status | ✅ | ✅ | ❌ |
| Delete appointments | ✅ | ❌ | ❌ |
| Create medical records | ❌ | ✅ | ❌ |
| View own medical records | ✅ | ✅ | ✅ |
| User management | ✅ | ❌ | ❌ |

---

## Database Models

### User

```
name, email, password (hashed), role (admin|doctor|patient),
contact, age, gender, specialization (doctors only)
```

### Appointment

```
patient (ref), patientName, doctor (ref), doctorName,
date, time, status (Pending|Approved|Completed|Cancelled), reason
```

### MedicalRecord

```
patient (ref), doctor (ref), doctorName,
diagnosis, prescription, notes, visitDate
```

---

## Screenshots / Pages

| Page | File | Description |
|---|---|---|
| Login | `Frontend/index.html` | Role-select, email/password, glassmorphism UI |
| Sign Up | `Frontend/signup.html` | Registration with role-based fields |
| Admin Dashboard | `Frontend/admin.html` | Manage users, appointments, records |
| Doctor Dashboard | `Frontend/doctor.html` | View appointments, create medical records |
| Patient Dashboard | `Frontend/patient.html` | Book appointments, view records |

---

## Security

- 🔑 **Password Hashing** — bcrypt with 10 salt rounds
- 🎟️ **JWT Authentication** — configurable expiry (default 7 days)
- 🚦 **RBAC Middleware** — enforced at the route level
- 🌐 **CORS** — configured for frontend origin
- 🧹 **Input Validation** — via `express-validator`
- 🔒 **Password Exclusion** — passwords never returned in API responses
- 🗝️ **Environment Variables** — secrets stored in `.env`, never committed

---

## Future Enhancements

- [ ] Rate limiting to prevent brute-force attacks
- [ ] Forgot password / email notifications
- [ ] Pagination and search/filter for large datasets
- [ ] File upload for medical reports / prescriptions
- [ ] Audit logs for admin actions
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] Progressive Web App (PWA) support

---

## License

This project is licensed under the **ISC License**.
