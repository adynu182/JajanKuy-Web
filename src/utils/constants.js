export const BUSINESS_TYPES = [
  'Bakso', 'Mie Ayam', 'Sate', 'Nasi Goreng', 'Gorengan',
  'Es Cendol', 'Es Dawet', 'Es Teh', 'Es Jeruk', 'Cilok',
  'Siomay', 'Batagor', 'Soto', 'Bubur', 'Pecel',
  'Ketoprak', 'Lontong', 'Martabak', 'Roti Bakar', 'Seblak',
  'Tahu Bulat', 'Pisang Goreng', 'Klepon', 'Kue Cubit',
  'Kopi Keliling', 'Jus Buah', 'Lainnya',
];

export const VEHICLE_TYPES = [
  { value: 'gerobak', label: 'Gerobak', icon: '🛒' },
  { value: 'motor', label: 'Motor', icon: '🏍️' },
  { value: 'mobil', label: 'Mobil', icon: '🚗' },
  { value: 'panggul', label: 'Panggul', icon: '🧑‍🍳' },
  { value: 'toko', label: 'Toko', icon: '🏪' },
  { value: 'lainnya', label: 'Lainnya', icon: '📦' },
];

export const SELLER_MODES = [
  { value: 'stay', label: 'Stay', description: 'Jualan di lokasi tetap' },
  { value: 'keliling', label: 'Keliling', description: 'Berpindah-pindah lokasi' },
];

export const STATUS = {
  OPEN: 'buka',
  CLOSED: 'tutup',
};

export const AUTO_EXPIRE_HOURS = 12;
export const REMINDER_THRESHOLD_HOURS = 6;

export const DEFAULT_MAP_CENTER = [-6.2088, 106.8456]; // Jakarta
export const DEFAULT_MAP_ZOOM = 14;
export const SEARCH_RADIUS_KM = 5;

export const ROUTES = {
  HOME: '/',
  LANDING: '/welcome',
  MENU: '/menu',
  SELLER_REGISTER: '/seller/register',
  SELLER_DASHBOARD: '/seller/dashboard',
  SELLER_EDIT_PROFILE: '/seller/edit-profile',
  SELLER_EDIT_SCHEDULE: '/seller/edit-schedule',
  SELLER_DETAIL: '/seller/:id',
  FOLLOWING: '/following',
};
