# 🚀 CricV NestJS + PostgreSQL Backend

Foundational NestJS backend server built with **Prisma ORM** and **PostgreSQL** for the CricV Cricket Scoring app.

---

## 📁 Directory Architecture

```
backend/
├── prisma/
│   └── schema.prisma         # Database schema (Team & Player models)
├── src/
│   ├── prisma/
│   │   ├── prisma.service.ts # Connection lifecycle management
│   │   └── prisma.module.ts  # Global Prisma Module
│   ├── teams/
│   │   ├── dto/
│   │   │   └── create-team.dto.ts
│   │   ├── teams.controller.ts # REST endpoints (/teams)
│   │   ├── teams.service.ts    # CRUD business logic
│   │   └── teams.module.ts
│   ├── app.module.ts         # Root Application Module
│   └── main.ts               # NestJS Entrypoint with CORS enabled
├── .env                      # Database & Server configuration
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## 🛠️ Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** installed locally or hosted (e.g. Supabase / Neon / Render)

---

## 🚀 How to Run Locally

### 1. Navigate to the backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Database URL in `.env`
Update the `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cricv_db?schema=public"
PORT=3000
```

### 4. Sync Prisma Schema with PostgreSQL
Generate Prisma Client types and push models to your PostgreSQL instance:
```bash
# Generate Prisma Client
npx prisma generate

# Push models directly to PostgreSQL database
npx prisma db push
```

### 5. Start NestJS Development Server
```bash
npm run start:dev
```
The server will start at `http://localhost:3000`.

---

## 📡 REST API Endpoints

- `GET /teams` - Fetch all teams with their players
- `GET /teams/:id` - Fetch single team details
- `POST /teams` - Create a new team with optional initial players
- `POST /teams/:id/players` - Add a player to a specific team
- `DELETE /teams/:id` - Delete a team
