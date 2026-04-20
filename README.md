# 🏫 AbsensiQR — Sistem Absensi Digital QR Code

## Deploy ke Vercel (Frontend) + Railway (Backend + Database)

---

## 📁 Struktur Repo

```
absensi-qr/
├── frontend/        → Next.js (deploy ke Vercel)
├── backend/         → Express.js (deploy ke Railway)
├── database/        → SQL schema (import ke Railway MySQL)
├── vercel.json      → konfigurasi Vercel
└── .gitignore
```

---

## 🚀 Cara Deploy

### Step 1 — Import Database ke Railway MySQL
1. Buka Railway → klik MySQL → tab Database → kotak query
2. Copy isi file `database/schema_railway.sql`
3. Paste di kotak query → Run

### Step 2 — Deploy Backend ke Railway
1. Buat repo GitHub khusus isi folder `backend/`
2. Di Railway → New Service → GitHub Repo → pilih repo backend
3. Isi Environment Variables:
```
DB_HOST=      (dari MySQL Railway → Variables → MYSQL_HOST)
DB_PORT=      (dari MySQL Railway → Variables → MYSQL_PORT)
DB_USER=      (dari MySQL Railway → Variables → MYSQL_USER)
DB_PASSWORD=  (dari MySQL Railway → Variables → MYSQL_PASSWORD)
DB_NAME=      railway
JWT_SECRET=   isi_bebas_minimal_32_karakter
QR_SECRET=    isi_bebas_terserah
FRONTEND_URL= https://nama-project.vercel.app
NODE_ENV=     production
```

### Step 3 — Deploy Frontend ke Vercel
1. Buat repo GitHub khusus isi folder `frontend/`
2. Buka vercel.com → New Project → pilih repo frontend
3. Isi Environment Variables:
```
NEXT_PUBLIC_API_URL = https://URL-backend-railway.up.railway.app/api
```
4. Klik Deploy

---

## 🔑 Akun Default (setelah import schema)
- Email: `admin@sekolah.sch.id`
- Password: `admin123`

> ⚠️ Segera ganti password setelah login pertama!
