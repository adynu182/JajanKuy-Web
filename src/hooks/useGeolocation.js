import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for browser geolocation.
 * Returns current position, loading state, and error info.
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState(null); // 'granted' | 'denied' | 'prompt'

  // Check permission state
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state);
        result.onchange = () => setPermissionState(result.state);
      }).catch(() => {
        // Permissions API not supported for geolocation in some browsers
      });
    }
  }, []);

  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);

      if (!('geolocation' in navigator)) {
        const err = { code: 0, message: 'Geolocation tidak didukung browser ini' };
        setError(err);
        setLoading(false);
        reject(err);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setPosition(coords);
          setLoading(false);
          setPermissionState('granted');
          resolve(coords);
        },
        (err) => {
          let errorMsg = 'Gagal mendapatkan lokasi';
          switch (err.code) {
            case 1:
              errorMsg = 'Izin lokasi ditolak. Silakan aktifkan di pengaturan browser.';
              setPermissionState('denied');
              break;
            case 2:
              errorMsg = 'Lokasi tidak tersedia. Pastikan GPS aktif.';
              break;
            case 3:
              errorMsg = 'Waktu pencarian lokasi habis. Coba lagi.';
              break;
          }
          const errorObj = { code: err.code, message: errorMsg };
          setError(errorObj);
          setLoading(false);
          reject(errorObj);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  }, []);

  const isGPSFailed = error !== null || permissionState === 'denied';

  return {
    position,
    loading,
    error,
    permissionState,
    isGPSFailed,
    getCurrentPosition,
  };
}
