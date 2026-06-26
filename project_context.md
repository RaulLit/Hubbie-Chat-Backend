# Project Context - Hubbie Chat Backend

This document details the current state, architecture, and technology stack of the backend service for the **Hubbie Chat** application.

---

## 🚀 Tech Stack & Core Dependencies
* **Runtime Environment:** Node.js (v18.15.0 configured in environment)
* **Web Framework:** Express.js (v4.18.2)
* **Database Object Modeling:** Mongoose / MongoDB (v8.0.0)
* **Realtime Communication:** Socket.IO (v4.7.2)
* **Security & Tokens:** JSON Web Token (v9.0.2) & Bcrypt (v5.1.1) for password hashing
* **Email Transmission:** Nodemailer (v6.9.14) via SMTP
* **Input Validation:** Validator (v13.11.0)

---

## 📁 Repository Structure
```
backend/
├── controllers/            # Request handlers / Controller layer
│   ├── authController.js   # User registration, login, verification, and reset logic
│   ├── chatController.js   # Fetching/creating 1v1 and group chats
│   ├── messageController.js# Message transmission and retrieval logic
│   └── userController.js   # User profile retrieval and search routing
├── middleware/             # Express middlewares
│   └── requireAuth.js      # Synchronous cookie-based JWT authentication middleware
├── models/                 # Mongoose Database schemas
│   ├── Chat.js             # Schema definition for chats (1v1 & group chats)
│   ├── Message.js          # Schema definition for individual messages
│   ├── Notification.js     # Empty definition (reserved for notification models)
│   ├── ResetPassword.js    # Schema for password reset tokens (TTL indexed)
│   └── User.js             # User data schema (names, emails, credentials, OTP state)
├── routes/                 # Express API routes
│   ├── index.js            # Initializer routing map
│   ├── authRoutes.js       # Authentication routes (/api/auth)
│   ├── chatRoutes.js       # Chat resource routes (/api/chat)
│   ├── messageRoutes.js    # Message resource routes (/api/message)
│   └── userRoutes.js       # User directory routes (/api/user)
├── utility/                # Utility modules
│   └── utility.js          # CSPRNG OTP generation and email HTML templates
├── .env                    # Environment configurations (Git-ignored)
├── .gitignore              # Dependency and environment ignore configurations
├── package.json            # Scripts and dependecy list
├── server.js               # Application entrypoint & HTTP server connection listener
└── sockets.js              # Socket.IO connection authentication, routing, and room handling
```

---

## 🛣️ API Routes Outline

### 1. Authentication Routes (`/api/auth`)
* `POST /login` -> Matches credentials. If user is unverified, generates a new OTP, sends verification email, and returns `requiresVerification: true`. If verified, signs JWT token and returns `token` cookie.
* `POST /signup` -> Registers a new user, hashes password, generates OTP, and emails verification link.
* `POST /confirm/:id` -> Confirms registration using verification OTP parameters.
* `POST /forgot` -> Requests a password reset link and generates reset token.
* `POST /reset/:key` -> Resets account password using a unique reset token parameters.
* `GET /resend/:id` -> Resends account verification email.
* `GET /logout` -> Clears authentication cookies.
* `POST /verify/verifiedUserExist` -> Verifies if user exists and is not verified.
* `POST /verify/resetRequestExist` -> Verifies if password reset request key is active.

### 2. Chat Routes (`/api/chat`) *(Requires requireAuth middleware)*
* `POST /` -> Creates or fetches a 1v1 chat with target user.
* `GET /` -> Retrieves all chats (1v1 and groups) the current user is participating in.
* `POST /group` -> Creates a group chat.
* `PUT /group/update` -> Renames a group chat.
* `PUT /group/add` -> Adds a user to a group chat.
* `PUT /group/remove` -> Removes a user from a group chat.

### 3. Message Routes (`/api/message`) *(Requires requireAuth middleware)*
* `POST /` -> Sends a new message in a chat (restricted to chat participants).
* `PUT /read` -> Marks all messages in a chat as read by this user.
* `GET /:chatId` -> Retrieves messages of a chat (restricted to chat participants).

### 4. User Routes (`/api/user`) *(Requires requireAuth middleware)*
* `GET /allUser?search=` -> Searches users by name or email (escapes special characters).

---

## 🗃️ Database Schemas Outline

### 1. User Schema (`User`)
* `name` (String, required, minlength: 2) -> Display name of the user.
* `email` (String, required, unique) -> Unique email address.
* `password` (String, required) -> Bcrypt-hashed password.
* `about` (String, default: null) -> Optional status message.
* `notifications` (Array of ObjectIds, ref: `Notification`) -> Array linking to unread notifications.
* `otp` (String, required, length: 6) -> Code for confirming account registration.
* `verified` (Boolean, default: false) -> Flag for verified accounts.

### 2. Chat Schema (`Chat`)
* `chatName` (String, trimmed) -> Display name of the chat or group.
* `isGroupChat` (Boolean, default: false) -> Flag distinguishing group chats from 1v1 chats.
* `users` (Array of ObjectIds, ref: `User`) -> Chat participants.
* `latestMessage` (ObjectId, ref: `Message`) -> Reference to the last sent message.
* `groupAdmin` (ObjectId, ref: `User`) -> Admin of the group chat.

### 3. Message Schema (`Message`)
* `sender` (ObjectId, ref: `User`) -> Reference to the message sender.
* `content` (String, trimmed) -> Text content of the message.
* `chat` (ObjectId, ref: `Chat`) -> Target chat room.
* `readBy` (Array of ObjectIds, ref: `User`) -> Participants who have read this message.

### 4. ResetPassword Schema (`ResetPassword`)
* `userId` (ObjectId, ref: `User`, required) -> User requesting reset.
* `resetKey` (String, required, unique) -> Unique CSPRNG generated key.
* `status` (Boolean, required, default: true) -> Key validity state.
* `createdAt` (Date, TTL indexed) -> Automatically deleted after 15 minutes (`expireAfterSeconds: 900`).
