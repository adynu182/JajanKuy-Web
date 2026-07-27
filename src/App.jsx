import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/buyer/HomePage';
import SellerDetail from './pages/buyer/SellerDetail';
import FollowingList from './pages/buyer/FollowingList';
import RegisterPage from './pages/seller/RegisterPage';
import DashboardPage from './pages/seller/DashboardPage';
import EditProfilePage from './pages/seller/EditProfilePage';
import EditSchedulePage from './pages/seller/EditSchedulePage';

function SellerRoute({ children }) {
  const { user, userRole, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/welcome" replace />;
  if (userRole !== 'seller') return <Navigate to="/seller/register" replace />;
  return children;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat Jajankuy..." />;
  }

  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public */}
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/seller/:id" element={<SellerDetail />} />
          <Route path="/following" element={<FollowingList />} />

          {/* Seller auth required */}
          <Route path="/seller/register" element={<RegisterPage />} />
          <Route
            path="/seller/dashboard"
            element={
              <SellerRoute>
                <DashboardPage />
              </SellerRoute>
            }
          />
          <Route
            path="/seller/edit-profile"
            element={
              <SellerRoute>
                <EditProfilePage />
              </SellerRoute>
            }
          />
          <Route
            path="/seller/edit-schedule"
            element={
              <SellerRoute>
                <EditSchedulePage />
              </SellerRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
