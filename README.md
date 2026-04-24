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

## 🏗️ Architecture
MeetingMind uses a modular monolith approach:
- `server/src/services/ai.service.ts`: Core extraction logic.
- `server/src/jobs/workers.ts`: Background processing workers.
- `client/app/meetings/[id]`: Interactive meeting detail view.

## 🔒 Security
- Workspace isolation for all data.
- Signed URLs for secure media access.
- Role-based access control (RBAC).
