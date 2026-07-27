import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import './ScheduleEditor.css';

export default function ScheduleEditor({ schedule = [], onChange }) {
  const addSlot = () => {
    onChange([...schedule, { label: '', time: '', address: '' }]);
  };

  const updateSlot = (index, field, value) => {
    const updated = schedule.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    );
    onChange(updated);
  };

  const removeSlot = (index) => {
    onChange(schedule.filter((_, i) => i !== index));
  };

  return (
    <div className="schedule-editor">
      <label className="input-label">Jadwal (boleh lebih dari satu)</label>

      {schedule.length === 0 && (
        <div className="schedule-empty">
          <p>Belum ada jadwal. Tambahkan jadwal agar pembeli tahu kebiasaan lokasi kamu.</p>
        </div>
      )}

      <div className="schedule-slots">
        {schedule.map((slot, index) => (
          <div key={index} className="schedule-slot glass-card">
            <div className="schedule-slot-header">
              <span className="schedule-slot-number">Slot {index + 1}</span>
              <button
                type="button"
                className="schedule-slot-remove"
                onClick={() => removeSlot(index)}
                aria-label="Hapus slot"
              >
                ✕
              </button>
            </div>
            <Input
              label="Label waktu"
              placeholder="cth. Siang"
              value={slot.label}
              onChange={(e) => updateSlot(index, 'label', e.target.value)}
            />
            <Input
              label="Waktu"
              placeholder="cth. 10:00–15:00"
              value={slot.time}
              onChange={(e) => updateSlot(index, 'time', e.target.value)}
            />
            <Input
              label="Alamat / patokan"
              placeholder="cth. Depan Bank A"
              value={slot.address}
              onChange={(e) => updateSlot(index, 'address', e.target.value)}
            />
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        fullWidth
        icon="+"
        onClick={addSlot}
        type="button"
      >
        Tambah slot waktu
      </Button>
    </div>
  );
}
