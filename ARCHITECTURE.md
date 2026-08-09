# 🏗️ CricV Architecture & Directory Map

CricV is structured into 3 distinct, modular pillars:

```
cricscore-app/
├── 📱 FRONTEND (React Native / Expo App)
│   ├── src/                  # Application Screens & Navigation
│   │   ├── ScoringScreen.tsx # Live Match Scoring Centre
│   │   ├── SetupScreen.tsx   # Match Setup & Squad Selection
│   │   ├── TeamsScreen.tsx   # Team Roster Management
│   │   ├── MatchesScreen.tsx # Historical Match Storage
│   │   ├── MyProfileScreen.tsx # Player Profile
│   │   ├── SettingsScreen.tsx # Dark Advanced Rules Settings
│   │   ├── mockData.ts       # 20th Over Thriller Mock Data
│   │   └── types.ts          # Frontend Type Definitions
│   ├── components/           # Reusable UI Components
│   │   └── ScoreboardView.tsx# Official Scoreboard Table
│   ├── app/                  # Expo Router directory
│   ├── assets/               # Branding assets & icons
│   ├── App.tsx               # Main Mobile Entrypoint
│   ├── app.json              # Expo Configuration
│   └── package.json          # Mobile Dependencies
│
├── ⚙️ BACKEND (NestJS REST API)
│   ├── backend/
│   │   ├── src/
│   │   │   ├── prisma/       # Prisma Lifecycle Service & Module
│   │   │   ├── teams/        # REST Endpoints, Services & DTOs
│   │   │   ├── app.module.ts # Root Module
│   │   │   └── main.ts       # NestJS Server Entrypoint (CORS Enabled)
│   │   ├── prisma/
│   │   │   └── schema.prisma # Backend Prisma Schema
│   │   ├── .env              # Aiven PostgreSQL Connection String
│   │   ├── nest-cli.json     # Nest CLI Configuration
│   │   └── package.json      # NestJS Backend Dependencies
│
└── 🗄️ DATABASE (PostgreSQL / Prisma)
    ├── database/
    │   ├── schema.prisma     # Central Prisma Schema
    │   ├── schema.sql        # Raw PostgreSQL DDL Schema
    │   ├── seed.sql          # Seed Data (Australia, Sri Lanka, India Roster)
    │   └── README.md         # Database Guide
```

---

## 🚦 Quick Commands

### 1. Run Mobile Frontend (Expo Web / Mobile)
```bash
npm run web
```

### 2. Run NestJS Backend Server
```bash
cd backend
npm install
npm run start:dev
```

### 3. Sync PostgreSQL Database
```bash
cd backend
npx prisma db push
```
