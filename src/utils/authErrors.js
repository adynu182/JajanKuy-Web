const MESSAGES = {
  'auth/email-already-in-use': 'Email ini sudah terdaftar. Coba menu "Masuk" ya.',
  'auth/invalid-email': 'Format email tidak valid.',
  'auth/weak-password': 'Password minimal 6 karakter.',
  'auth/wrong-password': 'Email atau password salah.',
  'auth/user-not-found': 'Akun dengan email ini belum terdaftar. Coba menu "Daftar" ya.',
  'auth/invalid-credential': 'Email atau password salah.',
  'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.',
  'auth/popup-blocked': 'Login diblokir browser. Coba lagi.',
  'auth/popup-closed-by-user': 'Login dibatalkan.',
  'auth/unauthorized-domain': 'Domain ini belum diizinkan untuk login. Hubungi pengelola aplikasi.',
  'auth/network-request-failed': 'Koneksi internet bermasalah. Coba lagi.',
};

export function getAuthErrorMessage(error) {
  const code = error?.code || '';
  return MESSAGES[code] || error?.message || 'Terjadi kesalahan, coba lagi.';
}
