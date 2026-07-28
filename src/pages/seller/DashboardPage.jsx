import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateSellerStatus, createPendingNotification } from '../../services/sellerService';
import { useGeolocation } from '../../hooks/useGeolocation';
import { SinglePinMap } from '../../components/map/MapView';
import MapPicker from '../../components/map/MapPicker';
import StatusBadge from '../../components/seller/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { STATUS, VEHICLE_TYPES } from '../../utils/constants';
import { timeAgo } from '../../utils/timeAgo';
import { useNavigate } from 'react-router-dom';
import { registerForNotifications } from '../../services/notificationService';
import './DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, userProfile, refreshSellerProfile, loading: authLoading } = useAuth();
  const { getCurrentPosition, loading: geoLoading, error: geoError, isGPSFailed } = useGeolocation();

  const [showGuard, setShowGuard] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    // Register for push notifications on mount
    if (user) {
      registerForNotifications(user.uid, 'sellers').catch(() => {});
    }
  }, [user]);

  if (authLoading) {
    return <LoadingSpinner fullScreen text="Memuat dashboard..." />;
  }

  if (!user || !userProfile) {
    return <LoadingSpinner fullScreen text="Memuat profil..." />;
  }

  const isOpen = userProfile.status === STATUS.OPEN;
  const vehicleInfo = VEHICLE_TYPES.find((v) => v.value === userProfile.vehicleType);

  const handleToggle = () => {
    if (isOpen) {
      // Close directly
      handleClose();
    } else {
      // Show guard modal before opening
      setShowGuard(true);
    }
  };

  const handleConfirmOpen = async () => {
    setShowGuard(false);
    setToggling(true);

    try {
      const coords = await getCurrentPosition();
      await updateSellerStatus(user.uid, STATUS.OPEN, coords, 'gps');
      // Create pending notification for followers
      await createPendingNotification(user.uid, userProfile.name);
      await refreshSellerProfile();
    } catch (error) {
      // GPS failed — show manual picker
      console.error('GPS error, showing manual picker:', error);
      setShowMapPicker(true);
    } finally {
      setToggling(false);
    }
  };

  const handleManualLocation = async (coords) => {
    setShowMapPicker(false);
    setToggling(true);
    try {
      await updateSellerStatus(user.uid, STATUS.OPEN, coords, 'manual');
      await createPendingNotification(user.uid, userProfile.name);
      await refreshSellerProfile();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setToggling(false);
    }
  };

  const handleClose = async () => {
    setToggling(true);
    try {
      await updateSellerStatus(user.uid, STATUS.CLOSED);
      await refreshSellerProfile();
    } catch (error) {
      console.error('Failed to close:', error);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="dashboard-page page-enter">
      <div className="container">
        {/* Greeting */}
        <div className="dashboard-greeting">
          <p className="dashboard-hello">Halo,</p>
          <h1 className="dashboard-name">{userProfile.name}</h1>
          <div className="dashboard-info">
            <span>{vehicleInfo?.icon} {userProfile.businessType}</span>
            <span>·</span>
            <span>{userProfile.mode === 'stay' ? 'Stay' : 'Keliling'}</span>
          </div>
        </div>

        {/* Toggle */}
        <div
          className={`dashboard-toggle ${isOpen ? 'is-open' : 'is-closed'}`}
          onClick={handleToggle}
          role="button"
          tabIndex={0}
        >
          {toggling ? (
            <LoadingSpinner size="md" />
          ) : (
            <>
              <div className="toggle-status">
                <StatusBadge status={userProfile.status} size="lg" />
              </div>
              <div className="toggle-hint">
                {isOpen
                  ? 'Tap untuk Tutup'
                  : 'Tap untuk Buka — lokasi diambil otomatis'}
              </div>
            </>
          )}
        </div>

        {/* Location info */}
        <div className="dashboard-location-info">
          {userProfile.location ? (
            <>
              <div className="dashboard-meta">
                📍 Lokasi terakhir: {userProfile.locationSource === 'manual' ? 'pin manual' : 'GPS otomatis'}
              </div>
              <div className="dashboard-meta">
                🕒 Terakhir update: {timeAgo(userProfile.lastUpdate)}
              </div>
            </>
          ) : (
            <div className="dashboard-meta">
              📍 Belum ada lokasi — tekan Buka untuk memulai
            </div>
          )}
        </div>

        {/* Map preview */}
        {userProfile.location && (
          <SinglePinMap
            location={userProfile.location}
            name={userProfile.name}
            status={userProfile.status}
          />
        )}

        {/* GPS fallback link */}
        {isGPSFailed && !isOpen && (
          <div className="dashboard-gps-fallback">
            {geoError && <p className="text-xs text-tertiary">{geoError.message}</p>}
            <Button
              variant="link"
              fullWidth
              onClick={() => setShowMapPicker(true)}
            >
              GPS gagal? Pilih lokasi manual
            </Button>
          </div>
        )}

        {/* Quick actions */}
        <div className="dashboard-actions">
          <Button
            variant="secondary"
            fullWidth
            icon="📅"
            onClick={() => navigate('/seller/edit-schedule')}
          >
            Edit jadwal & alamat
          </Button>
          <Button
            variant="secondary"
            fullWidth
            icon="👤"
            onClick={() => navigate('/seller/edit-profile')}
          >
            Edit profil
          </Button>
        </div>
      </div>

      {/* Guard Modal */}
      <Modal
        isOpen={showGuard}
        onClose={() => setShowGuard(false)}
        title="Buka Jualan"
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowGuard(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleConfirmOpen} loading={geoLoading}>
              Ya, Buka!
            </Button>
          </>
        }
      >
        <div className="guard-content">
          <span className="guard-icon">📍</span>
          <p>
            <strong>Pastikan kamu sudah berada di lokasi jualan.</strong>
          </p>
          <p>
            Lokasi GPS-mu akan diambil otomatis saat menekan "Ya, Buka!" dan ditampilkan ke pembeli.
          </p>
        </div>
      </Modal>

      {/* Manual Map Picker */}
      {showMapPicker && (
        <MapPicker
          onConfirm={handleManualLocation}
          onCancel={() => setShowMapPicker(false)}
          initialPosition={userProfile.location}
        />
      )}
    </div>
  );
}
