# InventoryPro

A full-stack inventory management system built with Next.js 14, PostgreSQL, Prisma, Socket.io, and AI-powered insights.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Theme | next-themes |
| Backend | Next.js API Routes, Socket.io (real-time) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth v4 + Google OAuth |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Email | Nodemailer |
| WhatsApp | Baileys (multi-device) |
| Logging | Pino |
| Validation | Zod |

## Features

- **Dashboard** — KPI cards, stock movement charts, category distribution, low-stock list
- **Products** — Full CRUD, search/filter/pagination, stock status badges
- **Categories** — Color-coded categories with product counts
- **Suppliers** — Vendor management
- **Stock Movements** — Track every IN/OUT/ADJUSTMENT/RETURN with history
- **Alerts** — Real-time low-stock and out-of-stock alerts (Socket.io)
- **AI Assistant** — Chat with Claude for inventory insights and recommendations
- **WhatsApp** — Baileys integration for QR-based connection + alert notifications
- **Auth** — Email/password + Google OAuth, role-based access (ADMIN/MANAGER/STAFF)
- **Dark/Light Mode** — Full theme support

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL database

### 1. Clone and install

```bash
git clone https://github.com/your-username/inventory-app.git
cd inventory-app
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
ANTHROPIC_API_KEY="sk-ant-..."  # Optional: for AI features
```

### 3. Set up database

```bash
# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo credentials:** `admin@inventory.com` / `admin123`

---

## Deploy to Railway

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/inventory-app.git
git push -u origin main
```

### 2. Create Railway project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `inventory-app` repository

### 3. Add PostgreSQL database

1. In your Railway project, click **+ New** → **Database** → **Add PostgreSQL**
2. Railway will auto-set `DATABASE_URL` in your environment

### 4. Set environment variables

In Railway project → **Variables**, add:

```
NEXTAUTH_URL=https://your-app.up.railway.app
NEXTAUTH_SECRET=your-secret-key
ANTHROPIC_API_KEY=sk-ant-...          # Optional
GOOGLE_CLIENT_ID=...                   # Optional
GOOGLE_CLIENT_SECRET=...               # Optional
SMTP_HOST=smtp.gmail.com               # Optional
SMTP_USER=your@gmail.com               # Optional
SMTP_PASS=your-app-password            # Optional
```

### 5. Deploy

Railway will automatically:
1. Detect Next.js
2. Run `npm install && npm run build`
3. Run `npm run db:migrate && npm start`

### 6. Seed production database (first deploy)

In Railway → **Project** → open your service shell:
```bash
npm run db:seed
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | App URL (e.g. https://yourapp.railway.app) |
| `NEXTAUTH_SECRET` | ✅ | Random secret (openssl rand -base64 32) |
| `ANTHROPIC_API_KEY` | ⬜ | Claude AI key for AI Assistant |
| `GOOGLE_CLIENT_ID` | ⬜ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ⬜ | Google OAuth client secret |
| `SMTP_HOST` | ⬜ | SMTP server for email alerts |
| `SMTP_USER` | ⬜ | SMTP username |
| `SMTP_PASS` | ⬜ | SMTP password |
| `ALERT_EMAIL` | ⬜ | Email to receive stock alerts |
| `WHATSAPP_SESSION_PATH` | ⬜ | Path for WhatsApp session (default: ./whatsapp-session) |

---

## Database Commands

```bash
npm run db:push      # Push schema (development)
npm run db:migrate   # Run migrations (production)
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed demo data
```

---

## Project Structure

```
inventory-app/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Demo data seed
├── src/
│   ├── app/
│   │   ├── (auth)/        # Login, Register pages
│   │   ├── (dashboard)/   # Protected dashboard pages
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── ai/            # AI chat component
│   │   ├── dashboard/     # Charts and stats
│   │   ├── layout/        # Sidebar and header
│   │   ├── products/      # Product form
│   │   ├── providers/     # Context providers
│   │   ├── ui/            # Reusable UI components
│   │   └── whatsapp/      # WhatsApp panel
│   ├── lib/
│   │   ├── ai.ts          # Anthropic/Claude integration
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── email.ts       # Nodemailer
│   │   ├── prisma.ts      # Prisma client
│   │   ├── socket.ts      # Socket.io client/server
│   │   ├── validations.ts # Zod schemas
│   │   ├── whatsapp.ts    # Baileys WhatsApp
│   │   └── utils.ts       # Utilities
│   └── types/
│       └── index.ts
├── server.js              # Custom server (Next.js + Socket.io)
├── railway.toml           # Railway deployment config
└── .env.example           # Environment variables template
```

## License

MIT
