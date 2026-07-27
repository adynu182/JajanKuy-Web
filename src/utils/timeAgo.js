/**
 * Format timestamp into "X menit/jam/hari lalu" relative string.
 */
export function timeAgo(timestamp) {
  if (!timestamp) return 'belum pernah update';

  const now = Date.now();
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((now - date.getTime()) / 1000);

  if (seconds < 60) return 'baru saja';
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins} menit lalu`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} jam lalu`;
  }
  const days = Math.floor(seconds / 86400);
  return `${days} hari lalu`;
}

/**
 * Check if a timestamp is within the last N hours.
 */
export function isWithinHours(timestamp, hours) {
  if (!timestamp) return false;
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = Date.now();
  const diff = now - date.getTime();
  return diff < hours * 60 * 60 * 1000;
}

/**
 * Format a Date object to locale time string.
 */
export function formatTime(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format a Date object to locale date+time string.
 */
export function formatDateTime(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
