import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getSellerById } from '../../services/sellerService';
import { followSeller, unfollowSeller, isFollowing } from '../../services/followService';
import { registerForNotifications } from '../../services/notificationService';
import { SinglePinMap } from '../../components/map/MapView';
import StatusBadge from '../../components/seller/StatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AuthModal from '../../components/auth/AuthModal';
import { timeAgo } from '../../utils/timeAgo';
import { VEHICLE_TYPES } from '../../utils/constants';
import './SellerDetail.css';

export default function SellerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, ensureBuyerProfile } = useAuth();

  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const PENDING_FOLLOW_KEY = 'jajankuy_pending_follow';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getSellerById(id);
        setSeller(data);

        // Check follow status if logged in
        if (user) {
          const isFollow = await isFollowing(user.uid, id);
          setFollowing(isFollow);
        }
      } catch (error) {
        console.error('Failed to fetch seller:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const doFollowAction = async (currentUser) => {
    setFollowLoading(true);
    try {
      await ensureBuyerProfile();

      if (following) {
        await unfollowSeller(currentUser.uid, id);
        setFollowing(false);
      } else {
        await followSeller(currentUser.uid, id, seller.name);
        setFollowing(true);
        // Register for notifications
        await registerForNotifications(currentUser.uid, 'buyers');
      }
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  // signInWithRedirect membawa halaman ini keluar ke Google lalu kembali lagi,
  // jadi kita gak bisa lanjut follow di baris yang sama setelah await login.
  // Simpan dulu id penjual yang mau di-follow, lalu lanjutkan otomatis di sini
  // begitu halaman ini reload dan user sudah terautentikasi.
  useEffect(() => {
    const pendingId = sessionStorage.getItem(PENDING_FOLLOW_KEY);
    if (user && seller && pendingId === id) {
      sessionStorage.removeItem(PENDING_FOLLOW_KEY);
      doFollowAction(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, seller, id]);

  const handleFollow = async () => {
    // Belum login → buka modal auth (Google atau email, terserah user pilih apa).
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    await doFollowAction(user);
  };

  // Login email/daftar lewat modal selesai secara sinkron (beda dari Google yang
  // redirect), jadi begitu sukses kita bisa langsung lanjutkan aksi follow-nya.
  const handleAuthSuccess = (newUser) => {
    setShowAuthModal(false);
    doFollowAction(newUser);
  };

  const handleDirections = () => {
    if (!seller?.location) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${seller.location.lat},${seller.location.lng}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat detail penjual..." />;
  }

  if (!seller) {
    return (
      <div className="detail-empty">
        <h2>Penjual tidak ditemukan</h2>
        <Button variant="primary" onClick={() => navigate('/')}>
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  const vehicleInfo = VEHICLE_TYPES.find((v) => v.value === seller.vehicleType);

  return (
    <div className="detail-page page-enter">
      <div className="container">
        {/* Map */}
        <SinglePinMap
          location={seller.location}
          name={seller.name}
          status={seller.status}
        />

        {/* Status & Header */}
        <div className="detail-header">
          <div className="detail-status-row">
            <StatusBadge status={seller.status} size="md" />
            <span className="text-sm text-secondary">
              {seller.status === 'buka' ? 'update ' : 'terakhir terlihat '}
              {timeAgo(seller.lastUpdate)}
            </span>
          </div>
          <h1 className="detail-name">{seller.name}</h1>
        </div>

        {/* Info */}
        <div className="detail-info glass-card">
          <div className="detail-info-row">
            <span className="detail-info-label">Dagangan</span>
            <span className="detail-info-value">{seller.businessType}</span>
          </div>
          <div className="detail-info-row">
            <span className="detail-info-label">Mode</span>
            <span className="detail-info-value">
              {seller.mode === 'stay' ? 'Stay (tetap)' : 'Keliling'}
            </span>
          </div>
          <div className="detail-info-row">
            <span className="detail-info-label">Alat angkut</span>
            <span className="detail-info-value">
              {vehicleInfo?.icon} {vehicleInfo?.label || seller.vehicleType}
            </span>
          </div>
        </div>

        {/* Schedule */}
        {seller.schedule && seller.schedule.length > 0 && (
          <div className="detail-schedule glass-card">
            <h3 className="detail-section-title">📅 Jadwal biasa</h3>
            <div className="detail-schedule-list">
              {seller.schedule.map((slot, index) => (
                <div key={index} className="detail-schedule-item">
                  <span className="detail-schedule-label">{slot.label || `Slot ${index + 1}`}</span>
                  <span className="detail-schedule-time">{slot.time}</span>
                  <span className="detail-schedule-address">📍 {slot.address}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="detail-actions">
          <Button
            variant={following ? 'secondary' : 'ghost'}
            size="lg"
            icon={following ? '★' : '☆'}
            onClick={handleFollow}
            loading={followLoading}
          >
            {following ? 'Batal Ikuti' : 'Ikuti'}
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon="🧭"
            onClick={handleDirections}
            disabled={!seller.location}
          >
            Petunjuk Arah
          </Button>
        </div>

        {!user && (
          <p className="detail-login-hint">
            Login (Google atau email) untuk mengikuti penjual ini dan dapat notifikasi saat buka.
          </p>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        onBeforeGoogleRedirect={() => sessionStorage.setItem(PENDING_FOLLOW_KEY, id)}
      />
    </div>
  );
}
