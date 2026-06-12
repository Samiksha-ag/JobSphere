# JobSphere — Full-Stack Job Portal (MERN)

JobSphere is a role-based job portal where **Applicants** discover and apply for
jobs, **Recruiters** post openings and manage candidates, and **Admins** oversee
the platform. It features real-time recruiter–applicant chat, an analytics
dashboard, and a JWT-secured, role-based access model.

> **Project note:** JobSphere began as an extension of an open-source MERN job-board
> base. It has since been substantially reworked — role-based authorization,
> real-time chat with persistence, an analytics dashboard, a dead-code cleanup,
> and a consistent UI. The roadmap below tracks what is built and what is planned.

---

## Features

### Built
- **Role-based authentication** — JWT auth with three roles (Admin / Recruiter / Applicant). Route-level authorization middleware guards every protected endpoint.
- **Job management** — Recruiters create, edit, and delete job postings; Applicants browse and apply with a resume upload.
- **Applicant tracking** — Recruiters view applicants per job, download resumes, shortlist, and reject.
- **Real-time chat (Socket.io)** — Recruiters and applicants message each other live. Messages are persisted to MongoDB, so history survives refresh and reconnection. A single shared socket per user handles delivery and online presence.
- **Analytics dashboard** — Recruiter dashboard with Bar, Pie, and Line charts (Recharts) summarizing jobs and applications.
- **Admin console** — Manage users and jobs, view platform-wide stats, and export reports to CSV.
- **Resume storage + ATS match** — Applicants upload a PDF resume; it is stored on **AWS S3** (with automatic local-disk fallback when S3 isn't configured). On submission the resume text is parsed and scored against the job posting, giving recruiters an **ATS-style keyword match %** per applicant.
- **Dockerized** — Dockerfiles for frontend and backend plus a `docker-compose.yml` for one-command local orchestration.

### Planned (roadmap)
- **Email notifications** (Nodemailer) on key events (apply, shortlist)
- **Job recommendations** via a Python recommendation service
- **PostgreSQL** alongside MongoDB for relational data
- **Deployment** to AWS (EC2 + S3) with a CI/CD pipeline

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 17, React Router 6, Redux, Formik + Yup, Recharts, Axios, React-Bootstrap, socket.io-client |
| Backend | Node.js, Express 4, Socket.io 4, Mongoose 6, JWT, bcryptjs, Multer |
| Database | MongoDB (Atlas) |
| Tooling | Docker, docker-compose |

---

## Architecture

```
job-portal-project/
├── job-backend/            Express API + Socket.io server
│   ├── controllers/        Route handlers (auth, admin, provider, user, chat)
│   ├── middleware/         Auth + authorization + upload guards
│   ├── models/             Mongoose schemas (User, Job, Applicant, Message)
│   ├── routes/             REST route definitions
│   └── app.js              Server bootstrap + Socket.io chat handlers
├── job-frontend/           React single-page app
│   └── src/
│       ├── pages/          Admin / Provider / Seeker pages
│       ├── components/      Shared UI, navigation, dashboard, chat
│       ├── utils/          Shared socket, axios config, role labels
│       └── login/          Auth screens + Redux store
└── docker-compose.yml
```

**Auth flow:** On login, the API returns a JWT containing the user id, name, and
role. The frontend stores it and attaches it as a Bearer token. `isAuthenticated`
verifies the token; `isAuthorized` loads the user's role; `isAdmin` / `isProvider`
/ `isUser` gate each route. Invalid or expired tokens return `401`, and a global
Axios interceptor clears the session and redirects to login.

**Chat flow:** Each logged-in user opens one shared Socket.io connection and
registers their user id. When a message is sent, the server persists it, delivers
it to the recipient's socket if online, and echoes it back to the sender. Opening
a conversation loads its history from the API.

---

## Getting Started

### Prerequisites
- Node.js (16+), npm
- A MongoDB connection string (local or Atlas)

### 1. Backend
```bash
cd job-backend
npm install
```
Create `job-backend/.env`:
```
MONGO_URI=<your MongoDB connection string>
PORT=8080
JWT_SECRET=<a long random secret>
```
Run it:
```bash
npm start
```

### 2. Frontend
```bash
cd job-frontend
npm install
npm start
```
The app runs at `http://localhost:3000` and talks to the API at
`http://localhost:8080` (configurable in `src/config/Config.json`).

### Run with Docker
```bash
docker-compose up --build
```

### Enabling AWS S3 for resumes (optional)
Resume uploads work out of the box using local disk. To store them in S3 instead,
set these in `job-backend/.env`:
```
AWS_REGION=<your-region>
AWS_S3_BUCKET=<your-bucket-name>
AWS_ACCESS_KEY_ID=<iam-access-key>
AWS_SECRET_ACCESS_KEY=<iam-secret-key>
```
The IAM user needs `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` on the
bucket. When these are present the app uploads to S3 automatically; when blank it
falls back to local disk.

---

## Roles

| Role | DB value | Capabilities |
|------|----------|--------------|
| Admin | `Admin` | Manage all users and jobs, view platform stats, export reports |
| Recruiter | `Job Provider` | Post/manage jobs, review applicants, shortlist, chat |
| Applicant | `User` | Browse and apply for jobs, track applications, chat with recruiters |

> Role labels shown in the UI (Recruiter/Applicant) are mapped from the internal
> database values for readability.

---

## License

ISC
