# MeetingMind | Premium Meeting Intelligence Platform

MeetingMind is a production-grade SaaS application designed to transform raw meeting recordings into actionable organizational memory.

## 🚀 Key Features
- **Upload Pipeline**: Secure media upload (Audio/Video) with S3 integration.
- **AI-Powered Transcription**: High-accuracy transcription with speaker diarization.
- **Intelligence Extraction**: Multi-stage LLM pipeline extracting summaries, action items, decisions, and risks.
- **Premium Dashboard**: High-end Next.js dashboard with interactive transcript viewer and analytics.
- **Background Processing**: Reliable job queues using BullMQ and Redis.
- **Relational Memory**: Structured storage of all meeting data in PostgreSQL.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion.
- **Backend**: Node.js, Express, TypeScript, Prisma.
- **Queue/Cache**: BullMQ, Redis.
- **AI**: Whisper (STT), GPT-4o (Extraction).
- **Database**: PostgreSQL.

## 🏃 Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- OpenAI API Key

### 2. Setup Server
```bash
cd server
npm install
cp .env.example .env
# Update .env with your credentials
npx prisma generate
npm run dev
```

### 3. Setup Client
```bash
cd client
npm install
npm run dev
```

## 🚀 Deployment

This project is configured for a split deployment: Backend on **Railway** and Frontend on **Vercel**.

### 1. Backend Deployment (Railway)

1.  Create a new project on [Railway](https://railway.app/).
2.  Connect your GitHub repository.
3.  Set the **Root Directory** to `server`.
4.  Add the following Environment Variables:
    *   `PORT`: `4000` (or leave default)
    *   `NODE_ENV`: `production`
    *   `DATABASE_URL`: Your MongoDB connection string.
    *   `REDIS_URL`: Your Redis connection string (Railway provides a Redis plugin).
    *   `FRONTEND_URL`: The URL of your deployed frontend (e.g., `https://your-app.vercel.app`).
    *   `OPENAI_API_KEY`, `GROQ_API_KEY`, `AWS_*`, `EMAIL_*`: As defined in `server/.env.example`.
5.  Railway will automatically use the `railway.json` and `package.json` to build and start the server.

### 2. Frontend Deployment (Vercel)

1.  Create a new project on [Vercel](https://vercel.com/).
2.  Connect your GitHub repository.
3.  Set the **Root Directory** to `client`.
4.  Vercel will auto-detect Next.js.
5.  Add the following Environment Variables:
    *   `NEXT_PUBLIC_API_URL`: Your deployed Backend URL (e.g., `https://your-backend.up.railway.app/api`).
    *   `NEXTAUTH_URL`: Your deployed Frontend URL.
    *   `AUTH_SECRET`: A secure random string (generate with `openssl rand -base64 32`).
    *   `DATABASE_URL`: Same as backend (required for NextAuth Prisma adapter).
6.  Deploy.

## 🏗️ Architecture
MeetingMind uses a modular monolith approach:
- `server/src/services/ai.service.ts`: Core extraction logic.
- `server/src/jobs/workers.ts`: Background processing workers.
- `client/app/meetings/[id]`: Interactive meeting detail view.

## 🔒 Security
- Workspace isolation for all data.
- Signed URLs for secure media access.
- Role-based access control (RBAC).
- Production-ready CORS and Helmet security headers.
