import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateSellerSchedule } from '../../services/sellerService';
import ScheduleEditor from '../../components/seller/ScheduleEditor';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './EditProfilePage.css'; // Reuse same styles

export default function EditSchedulePage() {
  const { user, userProfile, refreshSellerProfile, loading: authLoading } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (userProfile?.schedule) {
      setSchedule(userProfile.schedule);
    }
  }, [userProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSellerSchedule(user.uid, schedule);
      await refreshSellerProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save schedule:', error);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !userProfile) {
    return <LoadingSpinner fullScreen text="Memuat jadwal..." />;
  }

  return (
    <div className="edit-schedule-page page-enter">
      <div className="container">
        <h1 className="edit-title">Edit Jadwal & Alamat</h1>
        <p className="text-secondary mb-lg">
          Jadwal ini membantu pembeli tahu kebiasaan lokasi jualan kamu. Ini bukan pengganti status Buka/Tutup.
        </p>

        <ScheduleEditor schedule={schedule} onChange={setSchedule} />

        {success && (
          <div className="edit-success mt-md">✅ Jadwal berhasil disimpan!</div>
        )}

        <div className="mt-lg">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSave}
            loading={saving}
          >
            Simpan Jadwal
          </Button>
        </div>
      </div>
    </div>
  );
}
