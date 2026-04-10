// ============================================================
// RashAi, Calculator Page (Birth Details Input)
// ============================================================

import { geocodePlace, POPULAR_CITIES } from '../../utils/geocoding.js';
import { openMapPicker } from '../components/map-picker.js';
import { navigateTo } from '../app.js';

let selectedPlace = null;
let debounceTimer = null;

export function renderCalculator(container) {
  selectedPlace = null;

  container.innerHTML = `
    <section class="form-section">
      <div class="container">
        <div class="text-center mb-lg">
          <h1 class="section-title">Generate Your Kundali</h1>
          <p class="section-subtitle">
            Enter your birth details below. All calculations happen locally, 
            your data never leaves your browser.
          </p>
        </div>

        <div class="card form-card">
          <form id="birth-form">
            <div class="form-group">
              <label class="form-label" for="full-name">Full Name (Optional)</label>
              <input 
                type="text" 
                id="full-name" 
                class="form-input" 
                placeholder="Enter your name"
                autocomplete="name"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="birth-date">Date of Birth *</label>
                <input 
                  type="date" 
                  id="birth-date" 
                  class="form-input" 
                  required
                  max="${new Date().toISOString().split('T')[0]}"
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="birth-time">Time of Birth *</label>
                <input 
                  type="time" 
                  id="birth-time" 
                  class="form-input" 
                  required
                  step="60"
                />
                <span class="form-hint">Use 24-hour format. Accuracy matters for Lagna calculation.</span>
              </div>
            </div>

            <div class="form-group" style="position: relative;">
              <label class="form-label" for="birth-place">Place of Birth *</label>
              <input 
                type="text" 
                id="birth-place" 
                class="form-input" 
                placeholder="Start typing your city name..."
                required
                autocomplete="off"
              />
              <div id="place-suggestions" class="place-suggestions"></div>
              <span class="form-hint" id="place-coords"></span>
              <span class="map-picker-link" id="open-map-picker">Can't find your village? Pick it on a map</span>
            </div>

            <div class="form-group">
              <label class="form-label">Quick Select, Popular Cities</label>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${POPULAR_CITIES.slice(0, 12).map(city => `
                  <button type="button" class="btn btn-sm btn-secondary quick-city" 
                    data-lat="${city.lat}" data-lng="${city.lng}" data-name="${city.name}" data-tz="${city.tz}">
                    ${city.name}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="gender">Gender</label>
                <select id="gender" class="form-select">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="timezone">Timezone Offset (UTC)</label>
                <select id="timezone" class="form-select">
                  <option value="-12">UTC-12:00</option>
                  <option value="-11">UTC-11:00</option>
                  <option value="-10">UTC-10:00</option>
                  <option value="-9">UTC-09:00</option>
                  <option value="-8">UTC-08:00</option>
                  <option value="-7">UTC-07:00</option>
                  <option value="-6">UTC-06:00</option>
                  <option value="-5">UTC-05:00</option>
                  <option value="-4">UTC-04:00</option>
                  <option value="-3">UTC-03:00</option>
                  <option value="-2">UTC-02:00</option>
                  <option value="-1">UTC-01:00</option>
                  <option value="0">UTC+00:00</option>
                  <option value="1">UTC+01:00</option>
                  <option value="2">UTC+02:00</option>
                  <option value="3">UTC+03:00</option>
                  <option value="3.5">UTC+03:30</option>
                  <option value="4">UTC+04:00</option>
                  <option value="4.5">UTC+04:30</option>
                  <option value="5">UTC+05:00</option>
                  <option value="5.5" selected>UTC+05:30 (IST)</option>
                  <option value="5.75">UTC+05:45</option>
                  <option value="6">UTC+06:00</option>
                  <option value="6.5">UTC+06:30</option>
                  <option value="7">UTC+07:00</option>
                  <option value="8">UTC+08:00</option>
                  <option value="9">UTC+09:00</option>
                  <option value="9.5">UTC+09:30</option>
                  <option value="10">UTC+10:00</option>
                  <option value="11">UTC+11:00</option>
                  <option value="12">UTC+12:00</option>
                </select>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 8px;" id="generate-btn">
              ☉ Generate My Kundali
            </button>
          </form>
        </div>
      </div>
    </section>
  `;

  // Attach event listeners
  setupEventListeners();
}

function setupEventListeners() {
  const form = document.getElementById('birth-form');
  const placeInput = document.getElementById('birth-place');
  const suggestionsDiv = document.getElementById('place-suggestions');

  // Form submit
  form.addEventListener('submit', handleSubmit);

  // Place autocomplete
  placeInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length < 3) {
      suggestionsDiv.classList.remove('active');
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const results = await geocodePlace(query);
      if (results.length > 0) {
        suggestionsDiv.innerHTML = results.map((r, i) => `
          <div class="place-suggestion-item" data-index="${i}" 
            data-lat="${r.lat}" data-lng="${r.lng}" data-name="${r.displayName}">
            ${r.displayName}
          </div>
        `).join('');
        suggestionsDiv.classList.add('active');

        // Attach click handlers
        suggestionsDiv.querySelectorAll('.place-suggestion-item').forEach(item => {
          item.addEventListener('click', () => {
            const lat = parseFloat(item.dataset.lat);
            const lng = parseFloat(item.dataset.lng);
            selectPlace(item.dataset.name, lat, lng);
            suggestionsDiv.classList.remove('active');
          });
        });
      } else {
        suggestionsDiv.classList.remove('active');
      }
    }, 300); // Debounce 300ms, Photon is built for autocomplete
  });

  // Close suggestions on click outside
  document.addEventListener('click', (e) => {
    if (!placeInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
      suggestionsDiv.classList.remove('active');
    }
  });

  // Map picker fallback
  document.getElementById('open-map-picker').addEventListener('click', async () => {
    const result = await openMapPicker();
    if (result) {
      selectPlace(result.name, result.lat, result.lng);
    }
  });

  // Quick city buttons
  document.querySelectorAll('.quick-city').forEach(btn => {
    btn.addEventListener('click', () => {
      const lat = parseFloat(btn.dataset.lat);
      const lng = parseFloat(btn.dataset.lng);
      const name = btn.dataset.name;
      const tz = parseFloat(btn.dataset.tz);
      selectPlace(name, lat, lng, tz);
    });
  });
}

function selectPlace(name, lat, lng, tz = null) {
  selectedPlace = { name, lat, lng };
  const placeInput = document.getElementById('birth-place');
  const coordsSpan = document.getElementById('place-coords');

  placeInput.value = name;
  coordsSpan.textContent = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;

  if (tz !== null) {
    document.getElementById('timezone').value = tz.toString();
  }
}

function handleSubmit(e) {
  e.preventDefault();

  const birthDate = document.getElementById('birth-date').value;
  const birthTime = document.getElementById('birth-time').value;
  const fullName = document.getElementById('full-name').value;
  const gender = document.getElementById('gender').value;
  const timezone = parseFloat(document.getElementById('timezone').value);

  if (!birthDate || !birthTime) {
    alert('Please enter your date and time of birth.');
    return;
  }

  if (!selectedPlace) {
    alert('Please select your place of birth from the suggestions or quick city list.');
    return;
  }

  // Store in sessionStorage for the results page
  const birthData = {
    name: fullName,
    date: birthDate,
    time: birthTime,
    place: selectedPlace.name,
    lat: selectedPlace.lat,
    lng: selectedPlace.lng,
    gender,
    timezone,
  };

  sessionStorage.setItem('rashaiCurrentChart', JSON.stringify(birthData));
  window.location.hash = 'results';
}
