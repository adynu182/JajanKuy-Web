import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAuthErrorMessage } from '../../utils/authErrors';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import './AuthModal.css';

/**
 * Modal login/daftar yang bisa dipanggil dari mana saja (mis. tombol Follow
 * di SellerDetail) — bukan cuma dari LandingPage. Berisi opsi Google +
 * email/password, sama seperti di LandingPage, supaya selalu ada jalur
 * alternatif kalau salah satu metode gagal.
 */
export default function AuthModal({ isOpen, onClose, title = 'Masuk untuk melanjutkan' }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, authError } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleGoogleLogin = async () => {
    setLoggingIn(true);
    try {
      await signInWithGoogle(); // halaman akan navigasi ke Google di sini
    } catch (error) {
      console.error('Login failed:', error);
      setLoggingIn(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      if (authMode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onClose();
    } catch (error) {
      console.error('Email auth failed:', error);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return;
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (error) {
      console.error('Reset password failed:', error);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setResetSent(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="auth-modal">
        <Button
          className="btn-google"
          size="lg"
          fullWidth
          onClick={handleGoogleLogin}
          loading={loggingIn}
          icon={
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              width="18"
              height="18"
            />
          }
        >
          Lanjut dengan Google
        </Button>

        {!showEmailForm ? (
          <button
            type="button"
            className="auth-modal-toggle"
            onClick={() => setShowEmailForm(true)}
          >
            atau masuk/daftar pakai email
          </button>
        ) : (
          <form className="auth-modal-form" onSubmit={handleEmailAuth}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="Password (min. 6 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
            />
            <Button type="submit" variant="secondary" fullWidth loading={emailLoading}>
              {authMode === 'login' ? 'Masuk' : 'Daftar Akun'}
            </Button>

            {authMode === 'login' && (
              resetSent ? (
                <p className="auth-modal-note" style={{ color: 'var(--color-primary)' }}>
                  Link reset password sudah dikirim ke {email}, cek inbox/spam ya.
                </p>
              ) : (
                <button type="button" className="auth-modal-mode-toggle" onClick={handleForgotPassword}>
                  Lupa password?
                </button>
              )
            )}

            <button type="button" className="auth-modal-mode-toggle" onClick={toggleAuthMode}>
              {authMode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
            </button>
          </form>
        )}

        {authError && (
          <p className="auth-modal-note" style={{ color: 'var(--color-danger)' }}>
            {getAuthErrorMessage(authError)}
          </p>
        )}
      </div>
    </Modal>
  );
}