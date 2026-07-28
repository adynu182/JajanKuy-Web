// Terjemahan kode error Firebase Auth ke pesan Bahasa Indonesia yang ramah pengguna.
const MESSAGES = {
  'auth/email-already-in-use': 'Email ini sudah terdaftar. Coba masuk, atau pakai email lain.',
  'auth/invalid-email': 'Format email tidak valid.',
  'auth/missing-email': 'Email wajib diisi.',
  'auth/weak-password': 'Password terlalu lemah, minimal 6 karakter.',
  'auth/missing-password': 'Password wajib diisi.',
  'auth/user-not-found': 'Email belum terdaftar. Coba daftar dulu.',
  'auth/wrong-password': 'Email atau password salah.',
  'auth/invalid-credential': 'Email atau password salah.',
  'auth/invalid-login-credentials': 'Email atau password salah.',
  'auth/user-disabled': 'Akun ini telah dinonaktifkan.',
  'auth/too-many-requests': 'Terlalu banyak percobaan gagal. Coba lagi beberapa saat lagi.',
  'auth/network-request-failed': 'Gagal terhubung ke server. Periksa koneksi internet kamu.',
  'auth/popup-closed-by-user': 'Login dibatalkan.',
  'auth/cancelled-popup-request': 'Login dibatalkan.',
  'auth/account-exists-with-different-credential':
    'Email ini sudah terdaftar lewat metode login lain (mis. Google). Coba masuk dengan metode itu.',
};

export function getAuthErrorMessage(error) {
  if (!error) return 'Terjadi kesalahan. Coba lagi.';
  return MESSAGES[error.code] || error.message || 'Terjadi kesalahan. Coba lagi.';
}
