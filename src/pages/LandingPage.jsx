import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { signInWithGoogle, loading } = useAuth();

  const handleSellerLogin = async () => {
    try {
      await signInWithGoogle();
      // AuthContext will detect role, App.jsx will redirect
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
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
            loading={loading}
            icon={
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
                width="18"
                height="18"
              />
            }
          >
            Masuk sebagai Penjual
          </Button>

          <p className="landing-note">
            Pembeli bisa langsung menjelajah tanpa login.
            <br />
            Login diperlukan untuk follow penjual favorit.
          </p>
        </div>
      </div>
    </div>
  );
}
