import { useState, useEffect, useMemo } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { getSellers } from '../../services/sellerService';
import MapView from '../../components/map/MapView';
import SellerCard from '../../components/seller/SellerCard';
import Chip from '../../components/common/Chip';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { STATUS } from '../../utils/constants';
import { haversineDistance } from '../../utils/distance';
import './HomePage.css';

const TABS = [
  { id: 'map', label: '🗺️ Peta' },
  { id: 'list', label: '📋 List' },
];

const FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'open', label: 'Buka sekarang' },
  { id: 'stay', label: 'Stay' },
  { id: 'keliling', label: 'Keliling' },
];

export default function HomePage() {
  const { position, getCurrentPosition } = useGeolocation();
  const [activeTab, setActiveTab] = useState('map');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user location on mount
  useEffect(() => {
    getCurrentPosition().catch(() => {
      // Silently fail — user can still browse without location
    });
  }, [getCurrentPosition]);

  // Fetch sellers
  useEffect(() => {
    const fetchSellers = async () => {
      setLoading(true);
      try {
        const data = await getSellers();
        setSellers(data);
      } catch (error) {
        console.error('Failed to fetch sellers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  // Apply filters
  const filteredSellers = useMemo(() => {
    let result = [...sellers];

    switch (activeFilter) {
      case 'open':
        result = result.filter((s) => s.status === STATUS.OPEN);
        break;
      case 'stay':
        result = result.filter((s) => s.mode === 'stay');
        break;
      case 'keliling':
        result = result.filter((s) => s.mode === 'keliling');
        break;
    }

    // Sort by distance if user location available
    if (position) {
      result.sort((a, b) => {
        if (!a.location) return 1;
        if (!b.location) return -1;
        const distA = haversineDistance(position.lat, position.lng, a.location.lat, a.location.lng);
        const distB = haversineDistance(position.lat, position.lng, b.location.lat, b.location.lng);
        return distA - distB;
      });
    }

    // Also sort: open sellers first
    result.sort((a, b) => {
      if (a.status === STATUS.OPEN && b.status !== STATUS.OPEN) return -1;
      if (a.status !== STATUS.OPEN && b.status === STATUS.OPEN) return 1;
      return 0;
    });

    return result;
  }, [sellers, activeFilter, position]);

  return (
    <div className="home-page page-enter">
      {/* Tabs */}
      <div className="home-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`home-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="home-filters">
        <div className="home-filters-scroll">
          {FILTERS.map((filter) => (
            <Chip
              key={filter.id}
              label={filter.label}
              active={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="home-content">
        {loading ? (
          <LoadingSpinner text="Mencari penjual di sekitarmu..." />
        ) : filteredSellers.length === 0 ? (
          <div className="home-empty">
            <span className="home-empty-icon">🍢</span>
            <h3>Belum ada penjual</h3>
            <p>
              {activeFilter !== 'all'
                ? 'Coba ubah filter untuk hasil lebih banyak'
                : 'Belum ada penjual terdaftar di sekitar sini'}
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'map' ? (
              <div className="home-map-container">
                <MapView
                  sellers={filteredSellers}
                  userLocation={position}
                />
                {/* Preview card below map */}
                <div className="home-map-preview stagger-children">
                  {filteredSellers.slice(0, 3).map((seller) => (
                    <SellerCard
                      key={seller.id}
                      seller={seller}
                      buyerLocation={position}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="home-list stagger-children">
                {filteredSellers.map((seller) => (
                  <SellerCard
                    key={seller.id}
                    seller={seller}
                    buyerLocation={position}
                  />
                ))}
              </div>
            )}
            <div className="home-count">
              {filteredSellers.length} penjual ditemukan
            </div>
          </>
        )}
      </div>
    </div>
  );
}
