# Jajankuy — Task Tracker

> Update: task.md sebelumnya tidak sempat disinkronkan sebelum sesi sebelumnya kehabisan token — padahal sebagian besar kode Fase 1-8 sudah ditulis. Status di bawah sudah diverifikasi ulang (baca kode + `npm run build` + `npm run lint`), bukan cuma diasumsikan.

## Fase 1 — Project Bootstrap & PWA Foundation
- [x] Init Vite + React project
- [x] Install dependencies
- [x] Setup design system (index.css)
- [x] Setup Firebase config placeholder
- [x] Setup PWA manifest & vite-plugin-pwa — ikon 192x192, 512x512, 512x512 maskable, apple-touch-icon sudah digenerate otomatis
- [x] Setup router (App.jsx)
- [x] Setup layout components (Navbar, BottomNav)
- [x] Setup common components (Button, Input, Chip, Modal, LoadingSpinner) — *Card & ToggleSwitch tidak dibuat terpisah, fungsinya ada inline (class `glass-card`, toggle custom di DashboardPage). Tidak mengurangi fungsi.*

## Fase 2 — Autentikasi & Onboarding
- [x] AuthContext & useAuth hook — *digabung satu file (pola umum React), bukan file terpisah seperti rencana awal*
- [x] LandingPage
- [x] RegisterPage (seller onboarding form)
- [x] ScheduleEditor component

## Fase 3 — Status & Lokasi Penjual
- [x] DashboardPage (toggle Buka/Tutup)
- [x] useGeolocation hook
- [x] MapPicker (fallback manual)
- [x] Geohash service (geoService.js) — *implementasi manual (bukan library geofirestore-js), lihat pembahasan terpisah soal batasannya*

## Fase 4 — Manajemen Profil & Jadwal
- [x] EditProfilePage
- [x] EditSchedulePage

## Fase 5 — Discovery Pembeli (Peta & List)
- [x] HomePage with tab switcher
- [x] MapView with seller pins
- [x] SellerCard list view
- [x] Filter chips logic

## Fase 6 — Detail Penjual & Follow
- [x] SellerDetail page
- [x] Follow/Unfollow logic
- [x] Directions deep link

## Fase 7 — Push Notification
- [x] FCM token registration (notificationService)
- [x] firebase-messaging-sw.js
- [x] GitHub Actions cron workflow (seller reminder)
- [x] Pending notification system (follower alerts via cron)
- [ ] Uji end-to-end nyata (butuh VAPID key + FIREBASE_SERVICE_ACCOUNT secret asli di GitHub repo)

## Fase 8 — Firestore Security Rules
- [x] firestore.rules
- [x] firebase.json + firestore.indexes.json (composite index untuk query "penjual diikuti")

## Fase 9 — Design Polish
- [x] Micro-animations & transitions (sudah ada di index.css: page-enter, stagger-children, animate-slide-up, dll)
- [ ] Final responsive testing di device/browser asli
- [ ] Lighthouse PWA audit (butuh app ter-deploy atau dijalankan di browser asli)

## Belum bisa saya lakukan sendiri dari sandbox
- Isi `.env` dengan credentials Firebase asli
- Deploy ke Vercel + set environment variables di sana
- `firebase deploy --only firestore:rules,firestore:indexes`
- Tes push notification end-to-end (perlu device/browser asli + GitHub Secret asli)
- Lighthouse audit & tes manual di HP asli
