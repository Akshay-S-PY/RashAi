// ============================================================
// RashAi, Panchang (Daily Hindu Calendar) Page
// ============================================================

import { calculatePanchang, calculateWeeklyPanchang } from '../../engine/panchang.js';

export function renderPanchang(container) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  container.innerHTML = `
    <section class="form-section">
      <div class="container">
        <div class="results-header">
          <h1 class="section-title">Daily Panchang</h1>
          <p class="text-secondary">Hindu calendar elements for any date: Tithi, Nakshatra, Yoga, Karana & Vara</p>
        </div>

        <div class="card" style="max-width: 480px; margin: 0 auto 32px;">
          <div class="form-row">
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">Date</label>
              <input type="date" class="form-input" id="panchang-date" value="${todayStr}" />
            </div>
            <div style="display:flex; align-items:flex-end; padding-bottom:2px;">
              <button class="btn btn-primary" id="panchang-calc" style="width:100%">Show Panchang</button>
            </div>
          </div>
        </div>

        <div id="panchang-result"></div>
        <div id="panchang-week" style="margin-top: 40px;"></div>
      </div>
    </section>
  `;

  // Calculate for today on load
  showPanchang(today);
  showWeeklyPanchang(today);

  document.getElementById('panchang-calc')?.addEventListener('click', () => {
    const dateStr = document.getElementById('panchang-date').value;
    if (!dateStr) return;
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d, 6, 0, 0); // 6 AM local
    showPanchang(date);
    showWeeklyPanchang(date);
  });
}

function showPanchang(date) {
  const result = document.getElementById('panchang-result');
  try {
    const p = calculatePanchang(date);

    const tithiColor = p.tithi.isPurnima ? 'var(--gold)' : p.tithi.isAmavasya ? 'var(--purple-light)' : p.tithi.isEkadashi ? 'var(--teal)' : 'var(--text-primary)';
    const yogaNature = p.yoga.nature === 'good' ? 'var(--teal)' : p.yoga.nature === 'bad' ? 'var(--rose)' : 'var(--amber)';

    result.innerHTML = `
      <div class="card fade-in" style="max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="font-family: var(--font-display); font-size: 1.4rem; color: var(--gold);">
            ${p.vara.name} <span class="text-muted" style="font-size: 0.9rem;">(${p.vara.hindi})</span>
          </h2>
          <p class="text-secondary">${date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <!-- Tithi -->
          <div class="info-panel">
            <div class="info-panel-title">Tithi</div>
            <div class="info-panel-value" style="color: ${tithiColor}; font-size: 1.1rem;">
              ${p.tithi.paksha} ${p.tithi.name}
            </div>
            <div class="info-panel-detail">${p.tithi.pakshaHindi} ${p.tithi.hindi}</div>
            <div style="margin-top: 8px; height: 4px; border-radius: 2px; background: var(--bg-glass);">
              <div style="width: ${p.tithi.progress * 100}%; height: 100%; border-radius: 2px; background: var(--gradient-gold);"></div>
            </div>
          </div>

          <!-- Nakshatra -->
          <div class="info-panel">
            <div class="info-panel-title">Nakshatra</div>
            <div class="info-panel-value" style="font-size: 1.1rem;">${p.nakshatra.name}</div>
            <div class="info-panel-detail">${p.nakshatra.hindi} • Pada ${p.nakshatra.pada} • Lord: ${p.nakshatra.lord}</div>
          </div>

          <!-- Yoga -->
          <div class="info-panel">
            <div class="info-panel-title">Yoga</div>
            <div class="info-panel-value" style="color: ${yogaNature}; font-size: 1.1rem;">${p.yoga.name}</div>
            <div class="info-panel-detail">${p.yoga.hindi} • ${p.yoga.nature === 'good' ? 'Auspicious' : p.yoga.nature === 'bad' ? 'Inauspicious' : 'Mixed'}</div>
          </div>

          <!-- Karana -->
          <div class="info-panel">
            <div class="info-panel-title">Karana</div>
            <div class="info-panel-value" style="font-size: 1.1rem; ${p.karana.isBhadra ? 'color: var(--rose);' : ''}">${p.karana.name}</div>
            <div class="info-panel-detail">${p.karana.hindi}${p.karana.isBhadra ? ' • Bhadra (avoid new work)' : ''}</div>
          </div>

          <!-- Sunrise/Sunset -->
          <div class="info-panel">
            <div class="info-panel-title">Sunrise / Sunset</div>
            <div class="info-panel-value" style="font-size: 1.1rem;">${p.sunrise} / ${p.sunset}</div>
            <div class="info-panel-detail">Approximate times for Delhi (IST)</div>
          </div>

          <!-- Moon & Sun -->
          <div class="info-panel">
            <div class="info-panel-title">Moon Sign / Sun Sign</div>
            <div class="info-panel-value" style="font-size: 1.1rem;">${p.moonSign.symbol} ${p.moonSign.name} / ${p.sunSign.symbol} ${p.sunSign.name}</div>
            <div class="info-panel-detail">${p.moonSign.hindi} / ${p.sunSign.hindi}</div>
          </div>
        </div>

        ${p.tithi.isEkadashi ? '<div class="info-panel mt-lg" style="border-color: var(--teal); text-align: center;"><span style="color: var(--teal); font-weight: 600;">Today is Ekadashi, auspicious for fasting and worship</span></div>' : ''}
        ${p.tithi.isPurnima ? '<div class="info-panel mt-lg" style="border-color: var(--gold); text-align: center;"><span style="color: var(--gold); font-weight: 600;">Today is Purnima (Full Moon), auspicious for sattvic activities</span></div>' : ''}
        ${p.tithi.isAmavasya ? '<div class="info-panel mt-lg" style="border-color: var(--purple-light); text-align: center;"><span style="color: var(--purple-light); font-weight: 600;">Today is Amavasya (New Moon), good for Pitra Tarpan</span></div>' : ''}
      </div>
    `;
  } catch (err) {
    result.innerHTML = `<p class="text-rose text-center">${err.message}</p>`;
  }
}

function showWeeklyPanchang(startDate) {
  const weekDiv = document.getElementById('panchang-week');
  try {
    const week = calculateWeeklyPanchang(startDate);

    weekDiv.innerHTML = `
      <h3 style="font-family: var(--font-display); font-size: 1.2rem; text-align: center; margin-bottom: 16px; color: var(--gold);">7-Day Overview</h3>
      <div style="overflow-x: auto;">
        <table class="planet-table" style="min-width: 700px;">
          <thead>
            <tr>
              <th>Date</th>
              <th>Vara</th>
              <th>Tithi</th>
              <th>Nakshatra</th>
              <th>Yoga</th>
              <th>Karana</th>
            </tr>
          </thead>
          <tbody>
            ${week.map(p => {
              const yogaColor = p.yoga.nature === 'good' ? 'var(--teal)' : p.yoga.nature === 'bad' ? 'var(--rose)' : '';
              return `
                <tr>
                  <td>${p.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td>${p.vara.name}</td>
                  <td>${p.tithi.paksha} ${p.tithi.name}</td>
                  <td>${p.nakshatra.name} (P${p.nakshatra.pada})</td>
                  <td style="color: ${yogaColor}">${p.yoga.name}</td>
                  <td${p.karana.isBhadra ? ' style="color: var(--rose)"' : ''}>${p.karana.name}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    weekDiv.innerHTML = '';
  }
}
