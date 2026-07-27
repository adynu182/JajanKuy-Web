import './Modal.css';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-content modal-${size} animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button className="modal-close" onClick={onClose} aria-label="Tutup">
              ✕
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}
