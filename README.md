# Secure File Management System

This project is a full-stack secure file platform built with React, Tailwind CSS, Node.js, Express, and MongoDB. It focuses on strong authentication, AES-256 encrypted file storage, role-based access control, audit logging, upload threat screening, and secure sharing workflows.

## Architecture

```text
backend/
  config/        MongoDB connection
  controllers/   API handlers
  middleware/    auth, validation, rate limits, uploads, errors
  models/        MongoDB schemas
  routes/        REST endpoints
  security/      encryption, token handling, sanitization, threat detection
  services/      auth, files, audit logs, RBAC, sharing
  utils/         async and validation helpers

frontend/
  src/components/ reusable UI blocks
  src/pages/      login, registration, dashboard
  src/services/   API clients
```

## Security Features

- Password hashing with `bcrypt`
- TOTP-based two-factor authentication with QR provisioning
- JWT access and refresh tokens
- Password strength enforcement
- Role-based access control for `admin`, `user`, and optional `guest`
- AES-256-GCM encryption for stored files
- Encrypted data-encryption-key wrapping with a master key
- File ownership and permission checks before every operation
- Expiring share tokens for limited file sharing
- Login rate limiting and temporary lockout after repeated failures
- Input size validation and sanitization for XSS and injection resistance
- Parameterized database usage through Mongoose
- Upload threat checks with executable blocking, signature checks, and optional ClamAV
- Central audit logging for auth events, file access, sharing, and suspicious activity

## Backend API

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/2fa/setup`
- `POST /api/auth/2fa/verify`

### Files

- `GET /api/files`
- `POST /api/files/upload`
- `GET /api/files/:fileId`
- `GET /api/files/:fileId/download`
- `PUT /api/files/:fileId`
- `POST /api/files/:fileId/share/user`
- `POST /api/files/:fileId/share/link`
- `GET /api/share/:fileId?token=<share-token>`

### Admin

- `GET /api/admin/logs`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId/status`

## Setup

### 1. Backend

1. Copy [backend/.env.example](/C:/Users/Aryan Singh/OneDrive/Desktop/hidden/backend/.env.example) to `backend/.env`.
2. Generate a 32-byte AES master key in hex. Example:

```powershell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

3. Update MongoDB, JWT secrets, SMTP settings, and the master encryption key.
4. Install dependencies and run the API:

```powershell
cd backend
npm install
npm run dev
```

### 2. Frontend

1. Install dependencies and start Vite:

```powershell
cd frontend
npm install
npm run dev
```

2. Open `http://localhost:5173`.

## Operational Notes

- Uploaded files are encrypted before they are written to disk.
- The backend stores only encrypted file bytes plus wrapped key metadata.
- Admin users can inspect logs and enable or disable accounts.
- Shared link access requires the correct token and expires automatically.
- If ClamAV is available, set `ENABLE_CLAMAV=true` and point the host and port to your daemon.

## Production Hardening Recommendations

- Serve the API behind TLS and switch tokens to `httpOnly` secure cookies if preferred.
- Place MongoDB behind network restrictions and enable authentication.
- Store the master encryption key in a cloud KMS or HSM, not in a local `.env`.
- Offload audit logs to SIEM infrastructure for retention and detection.
- Add content-type allowlists and DLP scanning for stricter upload governance.
