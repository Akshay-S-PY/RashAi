// ============================================================
// RashAi, Geocoding (dual-layer: Photon + GeoNames fallback)
// ============================================================
// Primary:  Photon (photon.komoot.io), free, no API key, built for autocomplete
// Fallback: GeoNames, free registration, imports Indian Census data (640k+ villages)
// ============================================================

const PHOTON_URL = 'https://photon.komoot.io/api/';
const GEONAMES_URL = 'https://secure.geonames.org/searchJSON';
const GEONAMES_USERNAME = 'rashai_app'; // Free registered username

// India center coords for location bias (results near India rank higher)
const INDIA_LAT = 22.5;
const INDIA_LNG = 78.5;

/**
 * Search for a place using Photon geocoder (primary).
 * Free, no key, designed for autocomplete, uses OSM data.
 */
async function searchPhoton(query) {
  const params = new URLSearchParams({
    q: query,
    limit: '7',
    lang: 'en',
    lat: INDIA_LAT.toString(),
    lon: INDIA_LNG.toString(),
    location_bias_scale: '0.2',
  });

  const response = await fetch(`${PHOTON_URL}?${params}`);
  if (!response.ok) throw new Error(`Photon error: ${response.status}`);

  const data = await response.json();
  return (data.features || [])
    .filter(f => {
      // Keep populated places, filter out roads, buildings, etc.
      const type = f.properties.type || '';
      const osmKey = f.properties.osm_key || '';
      return osmKey === 'place' || type === 'city' || type === 'town'
        || type === 'village' || type === 'hamlet' || type === 'suburb'
        || type === 'locality' || type === 'neighbourhood'
        || type === 'district' || type === 'county'
        || type === 'state' || type === 'municipality';
    })
    .map(f => {
      const p = f.properties;
      const [lon, lat] = f.geometry.coordinates;
      const parts = [p.name, p.county, p.state, p.country].filter(Boolean);
      return {
        displayName: parts.join(', '),
        lat,
        lng: lon,
        city: p.name || '',
        state: p.state || '',
        country: p.country || '',
        source: 'photon',
      };
    });
}

/**
 * Search for a place using GeoNames (fallback).
 * Free registration required. Has Indian Census village data.
 */
async function searchGeoNames(query) {
  const params = new URLSearchParams({
    q: query,
    maxRows: '7',
    featureClass: 'P', // Populated places only
    username: GEONAMES_USERNAME,
    style: 'MEDIUM',
  });

  const response = await fetch(`${GEONAMES_URL}?${params}`);
  if (!response.ok) throw new Error(`GeoNames error: ${response.status}`);

  const data = await response.json();
  return (data.geonames || []).map(g => {
    const parts = [g.name, g.adminName2, g.adminName1, g.countryName].filter(Boolean);
    return {
      displayName: parts.join(', '),
      lat: parseFloat(g.lat),
      lng: parseFloat(g.lng),
      city: g.name || '',
      state: g.adminName1 || '',
      country: g.countryName || '',
      source: 'geonames',
    };
  });
}

/**
 * Geocode a place name, tries Photon first, falls back to GeoNames.
 * Deduplicates results by name+state so you don't see double entries.
 */
export async function geocodePlace(query) {
  let results = [];

  // 1. Try Photon (primary)
  try {
    results = await searchPhoton(query);
  } catch (err) {
    console.warn('Photon geocoding failed, trying GeoNames fallback:', err);
  }

  // 2. If Photon gave < 3 results, supplement with GeoNames
  if (results.length < 3) {
    try {
      const geoResults = await searchGeoNames(query);
      const seen = new Set(results.map(r => `${r.city}|${r.state}`.toLowerCase()));
      for (const g of geoResults) {
        const key = `${g.city}|${g.state}`.toLowerCase();
        if (!seen.has(key)) {
          results.push(g);
          seen.add(key);
        }
      }
    } catch (err) {
      console.warn('GeoNames fallback also failed:', err);
    }
  }

  return results;
}

/**
 * Get timezone offset for a location and date.
 * Simplified estimation based on longitude.
 * For India it works well (IST = UTC+5:30).
 */
export function estimateTimezone(lng) {
  return Math.round(lng / 15 * 2) / 2;
}

/**
 * Common Indian cities for quick selection
 */
export const POPULAR_CITIES = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, tz: 5.5 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, tz: 5.5 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946, tz: 5.5 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, tz: 5.5 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, tz: 5.5 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, tz: 5.5 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, tz: 5.5 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, tz: 5.5 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, tz: 5.5 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462, tz: 5.5 },
  { name: 'Varanasi', lat: 25.3176, lng: 82.9739, tz: 5.5 },
  { name: 'Patna', lat: 25.6093, lng: 85.1376, tz: 5.5 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126, tz: 5.5 },
  { name: 'Indore', lat: 22.7196, lng: 75.8577, tz: 5.5 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, tz: 5.5 },
  { name: 'Surat', lat: 21.1702, lng: 72.8311, tz: 5.5 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882, tz: 5.5 },
  { name: 'Ujjain', lat: 23.1765, lng: 75.7885, tz: 5.5 },
  { name: 'Haridwar', lat: 29.9457, lng: 78.1642, tz: 5.5 },
  { name: 'Amritsar', lat: 31.6340, lng: 74.8723, tz: 5.5 },
];
