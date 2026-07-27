import { STATUS } from '../../utils/constants';
import './StatusBadge.css';

export default function StatusBadge({ status, showLabel = true, size = 'md' }) {
  const isOpen = status === STATUS.OPEN;

  return (
    <span className={`status-badge status-${isOpen ? 'open' : 'closed'} status-${size}`}>
      <span className="status-dot">
        {isOpen && <span className="status-ping" />}
      </span>
      {showLabel && (
        <span className="status-label">{isOpen ? 'Buka' : 'Tutup'}</span>
      )}
    </span>
  );
}
