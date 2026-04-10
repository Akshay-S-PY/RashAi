// ============================================================
// RashAi, Map Picker (Leaflet + OpenStreetMap)
// For places too small to appear in any geocoding API.
// User zooms in and clicks to drop a pin, works anywhere on Earth.
// ============================================================

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path (broken by bundlers like Vite)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const PHOTON_REVERSE_URL = 'https://photon.komoot.io/reverse';

/**
 * Reverse geocode coordinates to a place name using Photon.
 */
async function reverseGeocode(lat, lng) {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      lang: 'en',
    });
    const res = await fetch(`${PHOTON_REVERSE_URL}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      const p = data.features[0].properties;
      return [p.name, p.county, p.state, p.country].filter(Boolean).join(', ');
    }
  } catch (e) {
    console.warn('Reverse geocode failed:', e);
  }
  return null;
}

/**
 * Open a fullscreen map picker modal.
 * Returns a Promise that resolves to { lat, lng, name } or null if cancelled.
 */
export function openMapPicker({ initialLat = 20.5, initialLng = 78.9, initialZoom = 5 } = {}) {
  return new Promise((resolve) => {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'map-picker-overlay';
    overlay.innerHTML = `
      <div class="map-picker-modal">
        <div class="map-picker-header">
          <h3>Pick your birthplace on the map</h3>
          <p>Zoom in and click/tap to drop a pin. Works for any village, hamlet, or location.</p>
        </div>
        <div class="map-picker-search-row">
          <input type="text" class="form-input map-picker-search" placeholder="Search a nearby town to zoom in..." />
        </div>
        <div id="map-picker-map" class="map-picker-map"></div>
        <div class="map-picker-coords" id="map-picker-coords">Click on the map to select a location</div>
        <div class="map-picker-actions">
          <button type="button" class="btn btn-secondary map-picker-cancel">Cancel</button>
          <button type="button" class="btn btn-primary map-picker-confirm" disabled>Confirm Location</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    let pickedLat = null;
    let pickedLng = null;
    let pickedName = null;
    let marker = null;

    // Init Leaflet map
    const map = L.map('map-picker-map', {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Force map to render correctly (modal timing issue)
    setTimeout(() => map.invalidateSize(), 100);

    const coordsDiv = overlay.querySelector('#map-picker-coords');
    const confirmBtn = overlay.querySelector('.map-picker-confirm');

    // Map click → drop pin
    map.on('click', async (e) => {
      pickedLat = e.latlng.lat;
      pickedLng = e.latlng.lng;

      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng, { draggable: true }).addTo(map);
        marker.on('dragend', async () => {
          const pos = marker.getLatLng();
          pickedLat = pos.lat;
          pickedLng = pos.lng;
          coordsDiv.textContent = `${pickedLat.toFixed(5)}, ${pickedLng.toFixed(5)}, resolving name...`;
          pickedName = await reverseGeocode(pickedLat, pickedLng);
          coordsDiv.textContent = pickedName
            ? `${pickedName} (${pickedLat.toFixed(5)}, ${pickedLng.toFixed(5)})`
            : `${pickedLat.toFixed(5)}, ${pickedLng.toFixed(5)}`;
        });
      }

      confirmBtn.disabled = false;
      coordsDiv.textContent = `${pickedLat.toFixed(5)}, ${pickedLng.toFixed(5)}, resolving name...`;

      // Reverse geocode for a display name
      pickedName = await reverseGeocode(pickedLat, pickedLng);
      coordsDiv.textContent = pickedName
        ? `${pickedName} (${pickedLat.toFixed(5)}, ${pickedLng.toFixed(5)})`
        : `${pickedLat.toFixed(5)}, ${pickedLng.toFixed(5)}`;
    });

    // Search box, zoom to a nearby town
    const searchInput = overlay.querySelector('.map-picker-search');
    let searchTimer = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      const q = searchInput.value.trim();
      if (q.length < 3) return;
      searchTimer = setTimeout(async () => {
        try {
          const params = new URLSearchParams({ q, limit: '1', lang: 'en' });
          const res = await fetch(`https://photon.komoot.io/api/?${params}`);
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            const [lon, lat] = data.features[0].geometry.coordinates;
            map.setView([lat, lon], 14);
          }
        } catch (e) { /* ignore */ }
      }, 400);
    });

    // Cancel
    overlay.querySelector('.map-picker-cancel').addEventListener('click', cleanup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup();
    });

    // Confirm
    confirmBtn.addEventListener('click', () => {
      cleanup({
        lat: pickedLat,
        lng: pickedLng,
        name: pickedName || `${pickedLat.toFixed(4)}, ${pickedLng.toFixed(4)}`,
      });
    });

    // ESC key
    const onKeydown = (e) => {
      if (e.key === 'Escape') cleanup();
    };
    document.addEventListener('keydown', onKeydown);

    function cleanup(result = null) {
      document.removeEventListener('keydown', onKeydown);
      document.body.style.overflow = '';
      map.remove();
      overlay.remove();
      resolve(result);
    }
  });
}
