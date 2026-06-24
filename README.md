# Hubbie Chat Backend

This is the backend API and realtime WebSocket server for **Hubbie Chat**, a full-stack MERN real-time chat application. It is built using Node.js, Express, MongoDB/Mongoose, and Socket.IO.

---

## 🚀 Key Features

* **REST API:** Handlers for user authentication, contact search, chat room creation, and message fetching.
* **Cookie-based JWT Auth:** Synchronous token validation and secure cookie sessions.
* **Realtime WebSockets:** Powered by Socket.IO with connection-level authentication and strict room participation checks.
* **Email Verification & Password Reset:** Uses Nodemailer (SMTP) for sending verification OTPs (cryptographically secure) and password reset tokens (TTL indexed).
* **Robust Error Handling & Database Resilience:** Automatic cleanup of stale reset tokens and graceful connection teardown on process exit signals (`SIGINT`, `SIGTERM`).

---

## 🛠️ Prerequisites

* **Node.js:** v18.x or higher recommended.
* **MongoDB:** A running MongoDB instance (local or Atlas cluster).
* **SMTP Account:** A mail account (e.g., Gmail App Password) to send verification and password reset emails.

---

## 📦 Setup & Installation

1. **Navigate to the Backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root of the `backend/` directory and configure the following variables:
   ```env
   # Database Configuration
   MONGO_URI=your_mongodb_production_uri
   DB_DEV_URI=your_mongodb_development_uri

   # Server Configuration
   PORT=4000
   CLIENT_URL=https://hubbie-chat.onrender.com
   NODE_VERSION=18.15.0

   # SMTP Configuration (Nodemailer)
   MAIL_USERNAME=lastbenchscholar@gmail.com
   MAIL_PASSWORD=your_email_app_password

   # Security / JWT
   SECRET=your_jwt_signing_secret_key

   # SSO / External Service Configuration
   SSO_API_KEY=your_sso_api_key
   SSO_SERVER_URL=http://localhost:5000

   # JWT Verification details
   JWT_ISSUER=LBS-AUTH-SERVER
   JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nyour-public-key-here\n-----END PUBLIC KEY-----"
   ```

---

## 🚦 Running the Application

* **Development Mode (with Nodemon):**
  Runs the server with auto-reload enabled when source files change.
  ```bash
  npm run dev
  ```

* **Production Mode:**
  Runs the server with standard node engine.
  ```bash
  npm start
  ```

---

## 📚 API & Project Context

For structural details, models, and endpoints, please refer to the [project_context.md](file:///D:/LastBenchScholar/hubbie-chat-mern/backend/project_context.md) file.
