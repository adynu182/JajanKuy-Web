# Jajankuy 🍢

PWA (Progressive Web App) untuk menemukan penjual jajanan keliling di sekitarmu secara semi-real-time — lewat peta interaktif atau daftar, lengkap dengan status Buka/Tutup dan notifikasi follow.

## Fitur

- 🗺️ Peta interaktif (Leaflet + OpenStreetMap) & tampilan list, dengan filter
- 🟢 Status Buka/Tutup semi-real-time, auto-expire setelah 12 jam tanpa update
- ⭐ Follow penjual favorit (login Google) + push notification saat mereka buka
- ⏰ Reminder otomatis ke penjual yang lupa update status (>6 jam)
- 📱 Installable ke homescreen, app shell tetap terbuka saat offline
- 📍 Fallback pin lokasi manual kalau GPS gagal/ditolak

## Tech Stack

React 19 + Vite · Firebase (Auth, Firestore, Cloud Messaging) · Leaflet/React-Leaflet · vite-plugin-pwa · GitHub Actions (cron) · Vercel

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Setup project Firebase
1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. **Authentication** → Sign-in method → aktifkan **Google**
3. **Firestore Database** → buat database (mode production)
4. **Project Settings → General** → "Your apps" → tambah Web app → copy config
5. **Project Settings → Cloud Messaging** → generate **Web Push certificate** (VAPID key)
6. Copy `.env.example` → `.env`, isi semua `VITE_FIREBASE_*` dan `VITE_FIREBASE_VAPID_KEY`

> ⚠️ `.env` sudah di-gitignore — jangan pernah commit credentials asli.

### 3. Samakan config di service worker
`public/firebase-messaging-sw.js` adalah file statis (tidak diproses Vite, jadi tidak bisa baca `import.meta.env`). Config Firebase di file ini harus di-hardcode manual, isinya sama seperti `.env`.

### 4. Deploy Firestore rules & index
```bash
npm install -g firebase-tools
firebase login
firebase use --add          # pilih project Firebase kamu
firebase deploy --only firestore:rules,firestore:indexes
```

### 5. Jalankan lokal
```bash
npm run dev
```

### 6. Deploy ke Vercel
- Import repo ini di [vercel.com/new](https://vercel.com/new) (auto-detect sebagai Vite)
- Tambahkan semua env var `VITE_FIREBASE_*` di **Project Settings → Environment Variables**
- `vercel.json` di repo ini sudah handle SPA routing (biar refresh di `/seller/dashboard` dst. tidak 404)

### 7. Setup reminder & notifikasi follower (GitHub Actions)
- Firebase Console → Project Settings → **Service Accounts** → Generate new private key
- GitHub repo → **Settings → Secrets and variables → Actions** → New repository secret
  - Nama: `FIREBASE_SERVICE_ACCOUNT`
  - Value: isi seluruh JSON key tadi
- Workflow `.github/workflows/notifications.yml` jalan otomatis tiap 5 menit

## Struktur Project

Lihat `implementation_plan.md` untuk detail arsitektur & keputusan desain, dan `task.md` untuk status progres tiap fase.

```
src/
├── components/   # UI components (common, layout, map, seller)
├── contexts/     # AuthContext (state auth + useAuth hook)
├── hooks/        # useGeolocation
├── pages/        # buyer/ & seller/ pages + LandingPage
├── services/     # Firestore CRUD (seller, follow, notification, geo)
└── utils/        # constants, distance (haversine), timeAgo
```

## Model Data Firestore

- `sellers/{uid}` — profil penjual, status, lokasi, geohash, jadwal, fcmTokens
- `buyers/{uid}` — profil pembeli, fcmTokens
- `follows/{buyerId}_{sellerId}` — relasi follow
- `pendingNotifications/{id}` — antrian notifikasi follower (diproses cron)
