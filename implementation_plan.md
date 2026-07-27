# Implementasi Jajankuy PWA — MVP

Implementasi full-stack Progressive Web App Jajankuy: direktori penjual jajanan keliling dengan status semi-real-time, peta interaktif, dan push notification. Dibangun dengan React + Vite, Firebase (Auth, Firestore, FCM), Leaflet + OpenStreetMap, dan deploy ke Vercel.

---

## Keputusan Desain (dari diskusi)

| Keputusan | Pilihan |
|---|---|
| Auth pembeli | Browsing tanpa login; wajib login Google saat mau follow |
| Push notification | Implementasi sekarang — FCM + GitHub Actions cron |
| Geo-query | Geohash + `geofirestore-js` dari awal |

---

## Proposed Changes

### Fase 1 — Project Bootstrap & PWA Foundation (EPIC-08)

#### [NEW] Vite + React project initialization
- `npx create-vite@latest ./ --template react` 
- Install dependencies: `react-router-dom`, `firebase`, `leaflet`, `react-leaflet`, `geofirestore`, `vite-plugin-pwa`
- Setup file structure:

```
src/
├── main.jsx                  # Entry point
├── App.jsx                   # Router setup
├── index.css                 # Global design system
├── config/
│   └── firebase.js           # Firebase init (Auth, Firestore, FCM)
├── hooks/
│   ├── useAuth.js            # Auth state & Google Sign-In
│   ├── useGeolocation.js     # GPS wrapper with error handling
│   └── useFirestore.js       # Firestore CRUD helpers
├── contexts/
│   └── AuthContext.jsx       # Auth provider wrapping app
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx        # Top navigation bar
│   │   └── BottomNav.jsx     # Bottom tab navigation (mobile)
│   ├── common/
│   │   ├── Button.jsx        # Reusable button component
│   │   ├── Input.jsx         # Form input component
│   │   ├── Chip.jsx          # Filter chip component
│   │   ├── Card.jsx          # Seller card component
│   │   ├── ToggleSwitch.jsx  # Status toggle component
│   │   ├── Modal.jsx         # Confirmation/guard modal
│   │   └── LoadingSpinner.jsx
│   ├── map/
│   │   ├── MapView.jsx       # Leaflet map wrapper
│   │   ├── SellerPin.jsx     # Custom pin (green/gray)
│   │   └── MapPicker.jsx     # Manual location picker (fallback)
│   └── seller/
│       ├── SellerCard.jsx    # List item for seller
│       ├── ScheduleEditor.jsx # Dynamic schedule CRUD
│       └── StatusBadge.jsx   # Buka/Tutup badge
├── pages/
│   ├── LandingPage.jsx       # Welcome + login entry
│   ├── buyer/
│   │   ├── HomePage.jsx      # Tab Peta & List
│   │   ├── SellerDetail.jsx  # Detail + Follow + Directions
│   │   └── FollowingList.jsx # List penjual yang diikuti
│   └── seller/
│       ├── RegisterPage.jsx  # Onboarding form
│       ├── DashboardPage.jsx # Toggle Buka/Tutup + map preview
│       ├── EditProfilePage.jsx
│       └── EditSchedulePage.jsx
├── services/
│   ├── sellerService.js      # Firestore CRUD for sellers
│   ├── buyerService.js       # Firestore CRUD for buyers
│   ├── followService.js      # Follow/unfollow logic
│   ├── notificationService.js # FCM token registration
│   └── geoService.js         # Geohash encoding/decoding
└── utils/
    ├── distance.js            # Haversine formula
    ├── timeAgo.js             # "5 menit lalu" formatter
    └── constants.js           # Enums, config values
```

#### [NEW] `manifest.json` & PWA config
- App name: "Jajankuy", short_name: "Jajankuy"
- Theme color, background color, icons (192x192, 512x512)
- Display: `standalone`
- `vite-plugin-pwa` config dengan Workbox: cache-first untuk assets, stale-while-revalidate untuk API/data

#### [NEW] `public/firebase-messaging-sw.js`
- Service worker untuk menerima push notification di background

---

### Fase 2 — Autentikasi & Onboarding (EPIC-01)

#### [NEW] `src/config/firebase.js`
- Init Firebase app dengan environment variables
- Export `auth`, `db` (Firestore), `messaging` (FCM)

#### [NEW] `src/contexts/AuthContext.jsx`
- `AuthProvider` wrapping app
- State: `user`, `userRole` (seller/buyer/null), `loading`
- Listen `onAuthStateChanged`
- Method: `signInWithGoogle()`, `signOut()`

#### [NEW] `src/pages/LandingPage.jsx`
- Hero section dengan branding Jajankuy
- Tombol "Masuk dengan Google" (penjual)
- Tombol "Jelajahi Penjual" (pembeli, tanpa login) → langsung ke HomePage

#### [NEW] `src/pages/seller/RegisterPage.jsx`
- Form: nama, jenis dagangan, mode (Stay/Keliling), alat angkut (dropdown)
- Komponen jadwal dinamis (tambah/hapus slot waktu+alamat) + tombol "Lewati, isi nanti"
- Validasi field wajib (nama, jenis dagangan, mode)
- Simpan ke Firestore `sellers` collection
- Redirect ke DashboardPage setelah berhasil

---

### Fase 3 — Status & Lokasi Penjual (EPIC-02)

#### [NEW] `src/pages/seller/DashboardPage.jsx`
- Greeting: "Halo, {nama}"
- Toggle besar Buka/Tutup dengan microcopy guard
- Saat toggle "Buka":
  1. Tampilkan modal konfirmasi: "Pastikan Anda sudah di lokasi jualan"
  2. Request geolocation (`getCurrentPosition`)
  3. Update Firestore: `status`, `location`, `locationSource`, `lastUpdate`
  4. Encode geohash dan simpan ke field `geohash`
- Saat toggle "Tutup":
  1. Update `status` → "tutup", `lastUpdate` → now
  2. Lokasi terakhir tetap tersimpan
- Preview peta kecil menampilkan posisi terkini
- Link fallback "GPS gagal? Pilih lokasi manual" → buka MapPicker
- Info "Terakhir update: X menit lalu"
- Tombol navigasi ke Edit Jadwal & Edit Profil

#### [NEW] `src/components/map/MapPicker.jsx`
- Leaflet map fullscreen/modal
- User bisa drag pin untuk pilih lokasi
- Hanya muncul saat GPS error/permission denied
- Return koordinat ke parent component

#### Auto-expire logic (client-side)
- Saat query penjual di sisi pembeli: filter `lastUpdate > 12 jam` → tidak ditampilkan
- Penjual dengan `lastUpdate` antara 0–12 jam dan `status === "tutup"` → tampil abu-abu

---

### Fase 4 — Manajemen Profil & Jadwal (EPIC-03)

#### [NEW] `src/pages/seller/EditProfilePage.jsx`
- Reuse form fields dari RegisterPage (nama, jenis dagangan, mode, alat angkut)
- Pre-populate dari data Firestore
- Update document `sellers/{uid}`

#### [NEW] `src/pages/seller/EditSchedulePage.jsx`
- CRUD list jadwal (array of `{label, time, address}`)
- Tambah/edit/hapus slot
- Simpan ke Firestore

---

### Fase 5 — Discovery Pembeli: Peta & List (EPIC-05)

#### [NEW] `src/pages/buyer/HomePage.jsx`
- Tab switcher: Peta / List
- Filter chips: Semua, Buka Sekarang, Stay, Keliling, + filter jenis dagangan
- **Tab Peta (`MapView`):**
  - Leaflet map centered pada lokasi pembeli (atau default Jakarta jika GPS ditolak)
  - Query penjual via geohash radius
  - Pin hijau: `status === "buka"` dan `lastUpdate < 12 jam`
  - Pin abu-abu: `status === "tutup"` dan `lastUpdate < 12 jam`
  - Tidak tampilkan: `lastUpdate > 12 jam`
  - Klik pin → popup ringkas → link ke detail
- **Tab List:**
  - Daftar kartu penjual (SellerCard)
  - Info: nama, jenis dagangan, mode, status badge, jarak, waktu update
  - Sort by jarak (terdekat dulu)
  - Klik kartu → navigasi ke detail

#### [NEW] `src/components/seller/SellerCard.jsx`
- Compact card: status dot (hijau/abu), nama, tipe dagangan, mode, jarak, waktu update
- Responsive, mobile-first design

---

### Fase 6 — Detail Penjual & Follow (EPIC-06)

#### [NEW] `src/pages/buyer/SellerDetail.jsx`
- Peta single-pin lokasi penjual
- Info: nama, jenis dagangan, mode, alat angkut, status, waktu update
- Jadwal deskriptif (list slot)
- Tombol **Ikuti/Batal Ikuti**:
  - Cek login → jika belum login, trigger Google Sign-In dulu
  - Create/delete doc di `follows` collection (`{buyerId}_{sellerId}`)
  - Simpan juga doc di `buyers` collection jika pertama kali
- Tombol **Petunjuk Arah**: deep link ke Google Maps (`https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`)

---

### Fase 7 — Push Notification (EPIC-04 & EPIC-07)

#### [NEW] `src/services/notificationService.js`
- Request notification permission di browser
- Dapatkan FCM token via `getToken()`
- Simpan token ke `sellers/{uid}.fcmTokens` atau `buyers/{uid}.fcmTokens`
- Handle token refresh

#### [NEW] `public/firebase-messaging-sw.js`
- Background message handler
- Show notification dengan title, body, icon

#### [NEW] `.github/workflows/seller-reminder.yml`
- Cron schedule (misal setiap 3 jam)
- Script Node.js:
  - Init Firebase Admin SDK (service account dari GitHub Secret)
  - Query sellers dengan `lastUpdate` > threshold (misal 6 jam)
  - Kirim FCM push: "Jangan lupa update status jualan kamu!"

#### Trigger notifikasi follow (saat toggle "Buka")
- Di DashboardPage, setelah berhasil toggle "Buka":
  - Query `follows` collection di mana `sellerId === uid`
  - Kumpulkan FCM tokens dari masing-masing buyer
  - **Limitation:** mengirim FCM dari client-side tidak dimungkinkan secara langsung (memerlukan server key)

> [!IMPORTANT]
> **Push notification untuk follower saat penjual toggle "Buka"** memerlukan server-side trigger karena FCM send membutuhkan server key yang tidak boleh di-expose ke client. Opsi:
> 1. **Firestore-triggered Cloud Function** (memerlukan Blaze plan)
> 2. **Tambahkan endpoint di GitHub Actions** yang di-trigger via webhook saat toggle Buka
> 3. **Gunakan Firestore listener di dedicated server** (perlu hosting tambahan)
> 4. **Tunda fitur ini** — simpan relasi follow dulu, push notification follower diimplementasi saat siap upgrade
>
> **Rekomendasi:** Implementasikan fitur follow (simpan relasi, UI toggle) sekarang. Untuk push notification follower, gunakan pendekatan hybrid: tulis data "pending notification" ke Firestore saat toggle Buka, lalu GitHub Actions cron (setiap 1-5 menit) mengecek dan mengirimkan notifikasi. Trade-off: delay 1-5 menit, tapi tetap di free tier.

---

### Fase 8 — Firestore Security Rules

#### [NEW] `firestore.rules`
```
sellers: read → semua (public), write → hanya owner (auth.uid == doc.id)
buyers: read/write → hanya owner
follows: read/write → hanya jika auth.uid == doc.buyerId
```

---

### Fase 9 — Design System & Polish

#### [NEW] `src/index.css`
- Design tokens: warna, spacing, typography (Google Fonts: Inter)
- Dark mode support
- Glassmorphism effects untuk cards
- Gradient backgrounds
- Micro-animations (hover, toggle, page transitions)
- Mobile-first responsive breakpoints

#### Visual Design Direction
- **Color palette:** Deep emerald green (#059669) sebagai primary (cocok dengan tema "jajan/makanan" dan "lokasi"), dark charcoal (#0f172a) untuk dark surfaces, warm amber (#f59e0b) untuk accent
- **Typography:** Inter (modern, clean, highly readable)
- **Style:** Modern, clean dengan glassmorphism cards, subtle gradients, rounded corners
- **Animations:** Smooth page transitions, toggle pulse effect, pin bounce pada peta, card hover lift

---

## Open Questions

> [!IMPORTANT]
> **Threshold reminder penjual:** Berapa jam setelah `lastUpdate` penjual harus dikirimi push reminder? PRD menyebut "beberapa jam" tapi belum menentukan angka pasti. Saya sarankan **6 jam** sebagai default. Setuju? Developer jawab setuju

> [!WARNING]
> **Push notification ke follower saat toggle Buka:** Seperti dijelaskan di Fase 7, ini memerlukan keputusan arsitektur. Pendekatan "cron tiap 1-5 menit cek pending notification" bisa bekerja di free tier tapi ada delay. Apakah trade-off ini bisa diterima, atau mau langsung upgrade ke Firebase Blaze agar bisa pakai Cloud Functions? developer jawab pakai pendekatan cron tiap 1-5 menit cek pending notification, tidak upgrade ke firebase blaze.

> [!NOTE]
> **Firebase project:** Apakah sudah ada project Firebase yang di-setup, atau saya perlu buat config placeholder yang nanti kamu isi sendiri dengan credentials-mu?

---

## Urutan Pengerjaan

| # | Fase | Epic | Estimasi |
|---|---|---|---|
| 1 | Project Bootstrap & PWA | EPIC-08 | Fondasi |
| 2 | Auth & Onboarding | EPIC-01 | Core |
| 3 | Status & Lokasi | EPIC-02 | Core |
| 4 | Profil & Jadwal | EPIC-03 | Core |
| 5 | Discovery (Peta & List) | EPIC-05 | Core |
| 6 | Detail & Follow | EPIC-06 | Core |
| 7 | Push Notification | EPIC-04, 07 | Enhancement |
| 8 | Security Rules | — | Security |
| 9 | Design Polish | — | Polish |

---

## Verification Plan

### Automated Tests
- `npm run build` — memastikan build berhasil tanpa error
- Lighthouse PWA audit — memastikan skor installability & offline capability

### Manual Verification
- Uji flow penjual: registrasi → dashboard → toggle Buka/Tutup → edit profil/jadwal
- Uji flow pembeli: browsing peta/list → filter → detail → follow
- Uji di mobile viewport (375px) — memastikan responsive design
- Uji offline behavior — app tetap bisa dibuka dari cache
- Uji GPS permission denied → fallback manual pin muncul
