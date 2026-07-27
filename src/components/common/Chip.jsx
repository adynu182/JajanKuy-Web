import './Chip.css';

export default function Chip({
  label,
  active = false,
  onClick,
  icon,
  className = '',
}) {
  return (
    <button
      className={`chip ${active ? 'chip-active' : ''} ${className}`}
      onClick={onClick}
      type="button"
    >
      {icon && <span className="chip-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
