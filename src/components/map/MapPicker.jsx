import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Button from '../common/Button';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants';
import 'leaflet/dist/leaflet.css';
import './MapPicker.css';

function createPickerIcon() {
  return L.divIcon({
    className: 'picker-marker',
    html: `
      <div style="
        width: 36px; height: 36px;
        background: var(--color-primary, #059669);
        border: 3px solid #fff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 12px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">📍</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

function LocationPicker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  if (!position) return null;

  return (
    <Marker position={[position.lat, position.lng]} icon={createPickerIcon()} />
  );
}

export default function MapPicker({ onConfirm, onCancel, initialPosition }) {
  const [position, setPosition] = useState(initialPosition || null);

  const center = initialPosition
    ? [initialPosition.lat, initialPosition.lng]
    : DEFAULT_MAP_CENTER;

  const handleConfirm = () => {
    if (position) {
      onConfirm(position);
    }
  };

  return (
    <div className="map-picker-overlay">
      <div className="map-picker-content animate-slide-up">
        <div className="map-picker-header">
          <h3>Pilih Lokasi Manual</h3>
          <p className="text-secondary text-sm">
            Tap pada peta untuk menandai lokasi jualan kamu
          </p>
        </div>

        <div className="map-picker-map">
          <MapContainer
            center={center}
            zoom={DEFAULT_MAP_ZOOM}
            className="map-leaflet"
            style={{ height: '350px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker position={position} onPositionChange={setPosition} />
          </MapContainer>
        </div>

        {position && (
          <div className="map-picker-coords">
            📍 {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </div>
        )}

        <div className="map-picker-actions">
          <Button variant="secondary" onClick={onCancel} fullWidth>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            fullWidth
            disabled={!position}
          >
            Konfirmasi Lokasi
          </Button>
        </div>
      </div>
    </div>
  );
}
