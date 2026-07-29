import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { getAuthErrorMessage } from '../utils/authErrors';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, loading, authError } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // signInWithRedirect membawa halaman ini keluar ke Google lalu kembali lagi —
  // begitu context auth kedeteksi user, kita pindah ke halaman menu (hub),
  // supaya user bisa pilih mau lihat pedagang sekitar atau kelola dagangan.
  useEffect(() => {
    if (user) {
      navigate('/menu');
    }
  }, [user, navigate]);

  const handleSellerLogin = async () => {
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
      // useEffect di atas yang nangkep perubahan `user` bakal urus navigasinya
    } catch (error) {
      console.error('Email auth failed:', error);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      return;
    }
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

  const handleBuyerBrowse = () => {
    navigate('/');
  };

  return (
    <div className="landing-page">
      {/* Background decoration */}
      <div className="landing-bg">
        <div className="landing-bg-circle landing-bg-1" />
        <div className="landing-bg-circle landing-bg-2" />
        <div className="landing-bg-circle landing-bg-3" />
      </div>

      <div className="landing-content">
        {/* Hero */}
        <div className="landing-hero animate-slide-up">
          <div className="landing-logo">🍢</div>
          <h1 className="landing-title">Jajankuy</h1>
          <p className="landing-subtitle">
            Temukan penjual jajanan keliling favorit di sekitarmu — atau beri tahu pembeli bahwa kamu sedang buka!
          </p>
        </div>

        {/* Features */}
        <div className="landing-features stagger-children">
          <div className="landing-feature glass-card">
            <span className="landing-feature-icon">📍</span>
            <div>
              <h3>Cari Terdekat</h3>
              <p>Lihat penjual jajanan buka di sekitarmu lewat peta atau daftar</p>
            </div>
          </div>
          <div className="landing-feature glass-card">
            <span className="landing-feature-icon">🔔</span>
            <div>
              <h3>Ikuti Favorit</h3>
              <p>Dapat notifikasi saat penjual langgananmu mulai buka</p>
            </div>
          </div>
          <div className="landing-feature glass-card">
            <span className="landing-feature-icon">⚡</span>
            <div>
              <h3>Update Cepat</h3>
              <p>Penjual cukup tap satu tombol untuk memberi tahu pembeli</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="landing-actions animate-slide-up" style={{ animationDelay: '300ms' }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleBuyerBrowse}
            icon="🗺️"
          >
            Jelajahi Penjual
          </Button>

          <div className="landing-divider">
            <span>atau</span>
          </div>

          <Button
            className="btn-google"
            size="lg"
            fullWidth
            onClick={handleSellerLogin}
            loading={loggingIn || loading}
            icon={
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
                width="18"
                height="18"
              />
            }
          >
            Masuk
          </Button>

          {!showEmailForm ? (
            <button
              type="button"
              className="landing-email-toggle"
              onClick={() => setShowEmailForm(true)}
            >
              atau masuk/daftar pakai email
            </button>
          ) : (
            <form className="landing-email-form" onSubmit={handleEmailAuth}>
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
                  <p className="landing-note" style={{ color: 'var(--color-primary)' }}>
                    Link reset password sudah dikirim ke {email}, cek inbox/spam ya.
                  </p>
                ) : (
                  <button type="button" className="landing-mode-toggle" onClick={handleForgotPassword}>
                    Lupa password?
                  </button>
                )
              )}

              <button
                type="button"
                className="landing-mode-toggle"
                onClick={toggleAuthMode}
              >
                {authMode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
              </button>
            </form>
          )}

          {authError && (
            <p className="landing-note" style={{ color: 'var(--color-danger)' }}>
              {getAuthErrorMessage(authError)}
            </p>
          )}

          <p className="landing-note">
            Jelajahi tanpa login, atau Masuk buat follow penjual favorit &amp; buka dagangan sendiri.
          </p>
        </div>
      </div>
    </div>
  );
}