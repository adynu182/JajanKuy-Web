import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './MenuPage.css';

export default function MenuPage() {
  const navigate = useNavigate();
  const { userRole, userProfile, signOut } = useAuth();
  const isSeller = userRole === 'seller';

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/welcome');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div className="menu-page page-enter">
      <div className="container">
        <div className="menu-header">
          <h1>Halo{isSeller && userProfile?.name ? `, ${userProfile.name}` : ''}! 👋</h1>
          <p className="text-secondary">Mau ngapain hari ini?</p>
        </div>

        <div className="menu-actions">
          <button className="menu-card glass-card" onClick={() => navigate('/')}>
            <span className="menu-card-icon">🗺️</span>
            <div className="menu-card-text">
              <h3>Lihat Pedagang Sekitar</h3>
              <p className="text-sm text-secondary">Jelajahi peta &amp; daftar penjual jajanan</p>
            </div>
          </button>

          {isSeller ? (
            <button className="menu-card glass-card" onClick={() => navigate('/seller/dashboard')}>
              <span className="menu-card-icon">🏪</span>
              <div className="menu-card-text">
                <h3>Dashboard Saya</h3>
                <p className="text-sm text-secondary">Kelola status &amp; dagangan kamu</p>
              </div>
            </button>
          ) : (
            <button className="menu-card glass-card" onClick={() => navigate('/seller/register')}>
              <span className="menu-card-icon">🍢</span>
              <div className="menu-card-text">
                <h3>Buat Dagangan</h3>
                <p className="text-sm text-secondary">Mulai jualan &amp; muncul di peta pembeli</p>
              </div>
            </button>
          )}
        </div>

        <button type="button" className="menu-signout" onClick={handleSignOut}>
          Keluar
        </button>
      </div>
    </div>
  );
}