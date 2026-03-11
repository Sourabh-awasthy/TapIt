# TapIt

A student engagement tracking platform powered by RFID. Students tap their cards at campus locations — classrooms, library, gym, and club rooms — and TapIt turns those taps into engagement scores, attendance streaks, and performance analytics.

---

## Roles

| Role | Access |
|------|--------|
| **Student** | Personal dashboard — score, streak, charts, tap history |
| **Teacher** | Class overview — leaderboard, needs-attention list, all student stats |
| **Admin** | Student registry, RFID card assignment, location weight configuration |

---

## Tech Stack

- **Frontend** — Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Recharts, SWR
- **Backend** — Node.js, Express, TypeScript
- **Database** — MongoDB Atlas (Mongoose)
- **Auth** — JWT stored in httpOnly cookies

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI (or local MongoDB)

### Install
```bash
npm install
```

### Environment Setup

Create `backend/.env`:
```
PORT=4000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
FRONTEND_ORIGIN=http://localhost:3000
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Run

```bash
# Seed default users and locations
npm run seed --workspace=backend

# (Optional) Inject 30 days of demo tap data
npm run demo --workspace=backend

# Start backend
npm run dev --workspace=backend

# Start frontend (separate terminal)
npm run dev --workspace=frontend
```

Frontend runs at `http://localhost:3000`, backend at `http://localhost:4000`.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.edu | admin123 |
| Teacher | teacher@school.edu | teacher123 |
| Student (Alice) | stu001@school.edu | student123 |
| Student (Bob) | stu002@school.edu | student123 |

---

## How Scoring Works

**Engagement Score (0–100)** — Weighted sum of tap activity across all locations over the last 30 days. Default weights: Classroom 40%, Library 30%, Gym 20%, Club 10%. Admins can adjust weights.

**Attendance Streak** — Consecutive days with at least one classroom tap. Resets if a day is missed.

**Punctuality Rate** — Percentage of classroom taps that occurred before the session start time (09:00).

---

## RFID Tap Endpoint

Hardware readers POST to the backend when a student taps:

```
POST /api/rfid/tap
Content-Type: application/json

{ "rfidCardId": "CARD123", "locationCode": "classroom" }
```

Response includes the student's updated engagement score and streak.
