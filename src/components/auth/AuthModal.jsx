import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { getAuthErrorMessage } from '../../utils/authErrors';
import './AuthModal.css';

const MODES = {
  LOGIN: 'login',
  DAFTAR: 'daftar',
  RESET: 'reset',
};

/**
 * Modal login/daftar dengan email & password, plus opsi "Lanjutkan dengan Google".
 *
 * Props:
 * - isOpen, onClose: kontrol tampil/tutup modal
 * - onSuccess(firebaseUser): dipanggil setelah login/daftar email berhasil
 *   (dipanggil sinkron dengan user yang baru, karena email/password gak lewat redirect
 *   seperti Google — beda dengan signInWithGoogle yang membawa halaman pergi dulu).
 * - initialMode: 'login' (default) atau 'daftar'
 * - showGoogleOption: tampilkan tombol Google di dalam modal (default true)
 * - onBeforeGoogleRedirect: dipanggil tepat sebelum redirect ke Google, dipakai
 *   untuk menyimpan intent (mis. pending follow) ke sessionStorage sebelum halaman pergi.
 */
export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = MODES.LOGIN,
  showGoogleOption = true,
  onBeforeGoogleRedirect,
}) {
  const { signInWithEmail, signUpWithEmail, resetPassword, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setResetSent(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setResetSent(false);
  };

  const handleClose = () => {
    resetForm();
    setMode(initialMode);
    onClose();
  };

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      newErrors.email = 'Format email tidak valid';
    }

    if (mode !== MODES.RESET) {
      if (!password) {
        newErrors.password = 'Password wajib diisi';
      } else if (password.length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }
    }

    if (mode === MODES.DAFTAR) {
      if (!name.trim()) newErrors.name = 'Nama wajib diisi';
      if (confirmPassword !== password) {
        newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (mode === MODES.RESET) {
        await resetPassword(email.trim());
        setResetSent(true);
      } else if (mode === MODES.DAFTAR) {
        const newUser = await signUpWithEmail(email.trim(), password, name.trim());
        resetForm();
        onSuccess?.(newUser);
      } else {
        const newUser = await signInWithEmail(email.trim(), password);
        resetForm();
        onSuccess?.(newUser);
      }
    } catch (error) {
      setErrors({ submit: getAuthErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    setErrors({});
    try {
      onBeforeGoogleRedirect?.();
      await signInWithGoogle(); // halaman akan navigasi keluar ke Google di sini
    } catch (error) {
      setErrors({ submit: getAuthErrorMessage(error) });
      setSubmitting(false);
    }
  };

  const title =
    mode === MODES.RESET ? 'Reset Password' : mode === MODES.DAFTAR ? 'Daftar Akun' : 'Masuk';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className="auth-modal">
        {showGoogleOption && mode !== MODES.RESET && (
          <>
            <Button
              className="btn-google"
              size="lg"
              fullWidth
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              icon={
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt=""
                  width="18"
                  height="18"
                />
              }
            >
              Lanjutkan dengan Google
            </Button>
            <div className="auth-modal-divider">
              <span>atau pakai email</span>
            </div>
          </>
        )}

        {mode === MODES.RESET && resetSent ? (
          <div className="auth-modal-success">
            <p>
              Link reset password sudah dikirim ke <strong>{email}</strong>. Cek inbox (atau
              folder spam) kamu, lalu masuk lagi setelah passwordnya diganti.
            </p>
            <Button variant="secondary" fullWidth onClick={() => switchMode(MODES.LOGIN)}>
              Kembali ke Login
            </Button>
          </div>
        ) : (
          <form className="auth-modal-form" onSubmit={handleSubmit} noValidate>
            {mode === MODES.DAFTAR && (
              <Input
                label="Nama"
                placeholder="Nama kamu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              autoComplete="email"
            />

            {mode !== MODES.RESET && (
              <Input
                label="Password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
                autoComplete={mode === MODES.DAFTAR ? 'new-password' : 'current-password'}
              />
            )}

            {mode === MODES.DAFTAR && (
              <Input
                label="Konfirmasi Password"
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
              />
            )}

            {mode === MODES.LOGIN && (
              <button
                type="button"
                className="auth-modal-link"
                onClick={() => switchMode(MODES.RESET)}
              >
                Lupa password?
              </button>
            )}

            {errors.submit && <div className="auth-modal-error">{errors.submit}</div>}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
              {mode === MODES.RESET ? 'Kirim Link Reset' : mode === MODES.DAFTAR ? 'Daftar' : 'Masuk'}
            </Button>
          </form>
        )}

        {mode !== MODES.RESET && (
          <p className="auth-modal-switch">
            {mode === MODES.DAFTAR ? (
              <>
                Sudah punya akun?{' '}
                <button type="button" onClick={() => switchMode(MODES.LOGIN)}>
                  Masuk
                </button>
              </>
            ) : (
              <>
                Belum punya akun?{' '}
                <button type="button" onClick={() => switchMode(MODES.DAFTAR)}>
                  Daftar
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </Modal>
  );
}
