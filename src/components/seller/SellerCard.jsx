import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { timeAgo } from '../../utils/timeAgo';
import { formatDistance, haversineDistance } from '../../utils/distance';
import { VEHICLE_TYPES } from '../../utils/constants';
import './SellerCard.css';

export default function SellerCard({ seller, buyerLocation }) {
  const navigate = useNavigate();

  const vehicleInfo = VEHICLE_TYPES.find((v) => v.value === seller.vehicleType);
  const distance =
    buyerLocation && seller.location
      ? haversineDistance(
          buyerLocation.lat,
          buyerLocation.lng,
          seller.location.lat,
          seller.location.lng
        )
      : null;

  const handleClick = () => {
    navigate(`/seller/${seller.id}`);
  };

  return (
    <div className="seller-card glass-card" onClick={handleClick} role="button" tabIndex={0}>
      <div className="seller-card-icon">
        {vehicleInfo?.icon || '🍽️'}
      </div>
      <div className="seller-card-content">
        <div className="seller-card-header">
          <StatusBadge status={seller.status} size="sm" />
          <span className="seller-card-distance">
            {distance != null ? formatDistance(distance) : ''}
          </span>
        </div>
        <h3 className="seller-card-name">{seller.name}</h3>
        <div className="seller-card-meta">
          <span>{seller.businessType}</span>
          <span className="seller-card-dot">·</span>
          <span className="seller-card-mode">{seller.mode === 'stay' ? 'Stay' : 'Keliling'}</span>
        </div>
        <div className="seller-card-time">
          🕒 {seller.status === 'buka' ? '' : 'terakhir terlihat '}
          {timeAgo(seller.lastUpdate)}
        </div>
      </div>
      <div className="seller-card-arrow">›</div>
    </div>
  );
}
