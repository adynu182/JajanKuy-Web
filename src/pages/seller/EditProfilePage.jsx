import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateSellerProfile } from '../../services/sellerService';
import Input, { Select } from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BUSINESS_TYPES, VEHICLE_TYPES, SELLER_MODES } from '../../utils/constants';
import './EditProfilePage.css';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, userProfile, refreshSellerProfile, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    businessType: '',
    mode: 'stay',
    vehicleType: 'gerobak',
  });

  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || '',
        businessType: userProfile.businessType || '',
        mode: userProfile.mode || 'stay',
        vehicleType: userProfile.vehicleType || 'gerobak',
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    try {
      await updateSellerProfile(user.uid, form);
      await refreshSellerProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !userProfile) {
    return <LoadingSpinner fullScreen text="Memuat profil..." />;
  }

  return (
    <div className="edit-profile-page page-enter">
      <div className="container">
        <h1 className="edit-title">Edit Profil</h1>

        <form className="edit-form" onSubmit={handleSubmit}>
          <Input
            label="Nama penjual / warung"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <Select
            label="Jenis dagangan"
            value={form.businessType}
            onChange={(e) => setForm({ ...form, businessType: e.target.value })}
            options={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))}
            placeholder="Pilih jenis dagangan"
          />

          <div>
            <label className="input-label">Mode dagang</label>
            <div className="register-mode-toggle">
              {SELLER_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  className={`mode-option ${form.mode === mode.value ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, mode: mode.value })}
                >
                  <span className="mode-label">{mode.label}</span>
                  <span className="mode-desc">{mode.description}</span>
                </button>
              ))}
            </div>
          </div>

          <Select
            label="Alat angkut"
            value={form.vehicleType}
            onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
            options={VEHICLE_TYPES}
          />

          {success && (
            <div className="edit-success">✅ Profil berhasil diperbarui!</div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={saving}
          >
            Simpan Perubahan
          </Button>
        </form>
      </div>
    </div>
  );
}
