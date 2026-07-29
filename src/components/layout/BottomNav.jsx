import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './BottomNav.css';

const BUYER_TABS = [
  { path: '/', icon: '🗺️', label: 'Jelajahi' },
  { path: '/following', icon: '⭐', label: 'Diikuti' },
];

const SELLER_TABS = [
  { path: '/seller/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/seller/edit-schedule', icon: '📅', label: 'Jadwal' },
  { path: '/seller/edit-profile', icon: '👤', label: 'Profil' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAuth();

  const tabs = userRole === 'seller' ? SELLER_TABS : BUYER_TABS;

  // Don't show on landing/menu/register
  if (
    location.pathname === '/welcome' ||
    location.pathname === '/menu' ||
    location.pathname === '/seller/register'
  ) {
    return null;
  }

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="bottom-nav-icon">{tab.icon}</span>
            <span className="bottom-nav-label">{tab.label}</span>
            {isActive && <span className="bottom-nav-indicator" />}
          </button>
        );
      })}
    </nav>
  );
}