import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Don't show on landing
  if (location.pathname === '/welcome') return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome');
  };

  const showBack = location.pathname !== '/' && location.pathname !== '/seller/dashboard' && location.pathname !== '/menu';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          {showBack && (
            <button className="navbar-back" onClick={() => navigate(-1)} aria-label="Kembali">
              ←
            </button>
          )}
          <h1 className="navbar-brand" onClick={() => navigate(user ? '/menu' : '/')}>
            <span className="navbar-logo">🍢</span>
            Jajankuy
          </h1>
        </div>

        <div className="navbar-right">
          {user ? (
            <div className="navbar-user">
              {user.photoURL && (
                <img src={user.photoURL} alt="" className="navbar-avatar" referrerPolicy="no-referrer" />
              )}
              <button className="navbar-signout" onClick={handleSignOut} title="Keluar">
                ↗
              </button>
            </div>
          ) : (
            <button className="navbar-login" onClick={() => navigate('/welcome')}>
              Masuk
            </button>
          )}
        </div>
      </div>
    </header>
  );
}