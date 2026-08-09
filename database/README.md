# 🗄️ CricV Database Layer (PostgreSQL)

Centralized PostgreSQL database definitions, Prisma schemas, raw SQL DDL initialization scripts, and international seed data for CricV.

---

## 📂 Database Directory Contents

```
database/
├── schema.prisma   # Primary Prisma ORM Schema
├── schema.sql      # Raw PostgreSQL DDL (Tables, Indexes, UUID Extension)
├── seed.sql        # Initial Seed Data (Australia, Sri Lanka, India Roster Data)
└── README.md       # Database Documentation & Guide
```

---

## 🛠️ PostgreSQL & Aiven Setup

### Option 1: Using Prisma ORM (Recommended)
From the `backend/` directory:
```bash
# Generate Prisma Client
npx prisma generate

# Push models directly to Aiven PostgreSQL / local PostgreSQL
npx prisma db push
```

### Option 2: Using Raw SQL (Aiven Web Console or `psql`)
Execute the SQL files in your PostgreSQL database client:
```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```
