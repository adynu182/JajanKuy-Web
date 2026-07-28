import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import { timeAgo } from '../../utils/timeAgo';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, STATUS } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createSellerIcon(status) {
  const color = status === STATUS.OPEN ? '#22c55e' : '#94a3b8';
  const glow = status === STATUS.OPEN ? 'drop-shadow(0 0 6px rgba(34,197,94,0.6))' : 'none';

  return L.divIcon({
    className: 'seller-marker',
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border: 3px solid #fff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        filter: ${glow};
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">🍽️</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function createUserIcon() {
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div style="
        width: 16px; height: 16px;
        background: #3b82f6;
        border: 3px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function MapView({ sellers = [], userLocation, center, zoom }) {
  const navigate = useNavigate();
  const mapCenter = center || (userLocation ? [userLocation.lat, userLocation.lng] : DEFAULT_MAP_CENTER);
  const mapZoom = zoom || DEFAULT_MAP_ZOOM;

  return (
    <div className="map-container">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="map-leaflet"
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={mapCenter} />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
          >
            <Popup>
              <div className="map-popup-user">📍 Lokasi kamu</div>
            </Popup>
          </Marker>
        )}

        {sellers.map((seller) => {
          if (!seller.location) return null;
          return (
            <Marker
              key={seller.id}
              position={[seller.location.lat, seller.location.lng]}
              icon={createSellerIcon(seller.status)}
              eventHandlers={{
                click: () => navigate(`/seller/${seller.id}`),
              }}
            >
              <Popup>
                <div className="map-popup">
                  <div className="map-popup-name">{seller.name}</div>
                  <div className="map-popup-type">{seller.businessType}</div>
                  <div className="map-popup-status">
                    <span className={`map-popup-dot ${seller.status === STATUS.OPEN ? 'open' : 'closed'}`} />
                    {seller.status === STATUS.OPEN ? 'Buka' : 'Tutup'} · {timeAgo(seller.lastUpdate)}
                  </div>
                  <button
                    className="map-popup-detail"
                    onClick={() => navigate(`/seller/${seller.id}`)}
                  >
                    Lihat Detail →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

/**
 * Single-pin map for seller detail page.
 */
export function SinglePinMap({ location, name, status }) {
  if (!location) return null;

  return (
    <div className="map-container map-single">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={16}
        className="map-leaflet"
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[location.lat, location.lng]}
          icon={createSellerIcon(status)}
        >
          <Popup>
            <div className="map-popup-name">{name}</div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
