import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createSellerProfile } from '../../services/sellerService';
import Input, { Select } from '../../components/common/Input';
import Button from '../../components/common/Button';
import ScheduleEditor from '../../components/seller/ScheduleEditor';
import { BUSINESS_TYPES, VEHICLE_TYPES, SELLER_MODES } from '../../utils/constants';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, refreshSellerProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '',
    businessType: '',
    mode: 'stay',
    vehicleType: 'gerobak',
    schedule: [],
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nama penjual wajib diisi';
    if (!form.businessType) newErrors.businessType = 'Pilih jenis dagangan';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await createSellerProfile(user.uid, {
        ...form,
        email: user.email,
        authProvider: user.providerData?.[0]?.providerId === 'password' ? 'email' : 'google',
      });
      await refreshSellerProfile();
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ submit: 'Gagal mendaftar. Coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/welcome');
    return null;
  }

  return (
    <div className="register-page page-enter">
      <div className="container">
        <div className="register-header">
          <h1>Daftar sebagai Penjual</h1>
          <p className="text-secondary">
            Lengkapi profil daganganmu agar pembeli bisa menemukanmu
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <Input
            label="Nama penjual / warung"
            placeholder="cth. Bakso Pak Slamet"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
            error={errors.name}
          />

          <Select
            label="Jenis dagangan"
            value={form.businessType}
            onChange={(e) => updateField('businessType', e.target.value)}
            options={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))}
            placeholder="Pilih jenis dagangan"
            required
            error={errors.businessType}
          />

          <div className="register-field">
            <label className="input-label">Mode dagang</label>
            <div className="register-mode-toggle">
              {SELLER_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  className={`mode-option ${form.mode === mode.value ? 'active' : ''}`}
                  onClick={() => updateField('mode', mode.value)}
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
            onChange={(e) => updateField('vehicleType', e.target.value)}
            options={VEHICLE_TYPES}
            placeholder="Pilih alat angkut"
          />

          <ScheduleEditor
            schedule={form.schedule}
            onChange={(schedule) => updateField('schedule', schedule)}
          />

          {errors.submit && (
            <div className="register-error">{errors.submit}</div>
          )}

          <div className="register-actions">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Daftar
            </Button>
            {form.schedule.length === 0 && (
              <p className="text-xs text-tertiary text-center">
                Jadwal bisa ditambahkan nanti lewat menu Edit Jadwal
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
