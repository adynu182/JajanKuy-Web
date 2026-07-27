/**
 * Simple geohash implementation for Firestore geo-queries.
 * Uses base32 encoding for coordinate hashing.
 */

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Encode latitude and longitude into a geohash string.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} precision - Number of characters (default 9)
 * @returns {string} Geohash string
 */
export function encodeGeohash(lat, lng, precision = 9) {
  let latRange = [-90, 90];
  let lngRange = [-180, 180];
  let hash = '';
  let bit = 0;
  let ch = 0;
  let isEven = true;

  while (hash.length < precision) {
    if (isEven) {
      const mid = (lngRange[0] + lngRange[1]) / 2;
      if (lng >= mid) {
        ch |= 1 << (4 - bit);
        lngRange[0] = mid;
      } else {
        lngRange[1] = mid;
      }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat >= mid) {
        ch |= 1 << (4 - bit);
        latRange[0] = mid;
      } else {
        latRange[1] = mid;
      }
    }

    isEven = !isEven;
    bit++;

    if (bit === 5) {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return hash;
}

/**
 * Get the bounding geohash range for a given center + radius query.
 * Returns an array of geohash prefixes that cover the area.
 * @param {number} lat - Center latitude
 * @param {number} lng - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {{ lower: string, upper: string }[]} Array of geohash ranges for Firestore queries
 */
export function getGeohashRange(lat, lng, radiusKm) {
  // Approximate degrees per km
  const latPerKm = 1 / 110.574;
  const lngPerKm = 1 / (111.320 * Math.cos((lat * Math.PI) / 180));

  const latDelta = radiusKm * latPerKm;
  const lngDelta = radiusKm * lngPerKm;

  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLng = lng - lngDelta;
  const maxLng = lng + lngDelta;

  // Use precision based on radius
  let precision;
  if (radiusKm <= 0.5) precision = 7;
  else if (radiusKm <= 2) precision = 6;
  else if (radiusKm <= 10) precision = 5;
  else if (radiusKm <= 50) precision = 4;
  else precision = 3;

  const lower = encodeGeohash(minLat, minLng, precision);
  const upper = encodeGeohash(maxLat, maxLng, precision);

  return { lower, upper, precision };
}

/**
 * Get geohash prefix for a precision level.
 */
export function getGeohashPrefix(geohash, precision) {
  return geohash.substring(0, precision);
}
