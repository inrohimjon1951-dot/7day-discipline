# 7 Day Discipline 🔥

> Muhammadyusuf vs Shavkatjon — Intizomiy va ruhiy rivojlanish bellashuvi

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + custom CSS variables
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Deploy**: Vercel

---

## 1-Qadam: GitHub

```bash
git init
git add .
git commit -m "feat: initial 7day-discipline project"
git remote add origin https://github.com/YOUR_USERNAME/7day-discipline.git
git push -u origin main
```

---

## 2-Qadam: Supabase

1. [supabase.com](https://supabase.com) → New project yarating
2. **SQL Editor** ga o'ting → `supabase-schema.sql` faylidagi kodni to'liq paste qiling → Run
3. **Authentication → Settings**:
   - Email confirmation: **O'chiring** (disable) — test uchun
4. **Database → Replication** → `task_logs`, `reactions`, `streaks` tablalarini enable qiling
5. **Project Settings → API** dan nusxa oling:
   - `Project URL`
   - `anon public key`

---

## 3-Qadam: Local sozlash

```bash
# .env.local fayl yarating
cp .env.local.example .env.local
```

`.env.local` faylini oching va to'ldiring:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```bash
npm install
npm run dev
```

Brauzerda: [http://localhost:3000](http://localhost:3000)

---

## 4-Qadam: Vercel Deploy

1. [vercel.com](https://vercel.com) → **New Project** → GitHub reponi import qiling
2. **Environment Variables** ga qo'shing:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Deploy** tugmasini bosing ✅

---

## Foydalanish

1. Saytga kiring → ismingizni tanlang (Muhammadyusuf yoki Shavkatjon)
2. Email + parol kiriting (birinchi marta — avtomatik ro'yxatdan o'tadi)
3. Dashboard ochiladi — tasklarni bajaring!
4. Sherigingizning amallari real vaqtda ko'rinadi

---

## Loyiha tuzilmasi

```
src/
├── app/
│   ├── page.tsx              # Login sahifasi
│   ├── layout.tsx            # Root layout
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard (server)
│   ├── achievements/
│   │   └── page.tsx          # Yutuqlar (server)
│   └── api/
│       ├── tasks/route.ts    # Task CRUD
│       ├── reactions/route.ts
│       └── auth/signout/route.ts
├── components/
│   ├── DashboardClient.tsx   # Main dashboard (client)
│   ├── UserPanel.tsx         # Har bir foydalanuvchi paneli
│   ├── Header.tsx            # Yuqori header + timer
│   ├── MiniChart.tsx         # Haftalik grafik
│   └── AchievementsClient.tsx
├── hooks/
│   ├── useRealtimeSync.ts    # Supabase realtime
│   └── useTimer.ts           # Countdown timer
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── tasks.ts              # Task definitions
│   └── utils.ts
├── types/index.ts
├── styles/globals.css
└── middleware.ts             # Auth protection
```
