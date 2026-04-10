// ============================================================
// RashAi, Muhurta (Auspicious Timing) Page
// ============================================================

import { getActivityTypes, findMuhurta } from '../../engine/muhurta.js';

export function renderMuhurta(container) {
  const activities = getActivityTypes();
  const todayStr = new Date().toISOString().split('T')[0];

  container.innerHTML = `
    <section class="form-section">
      <div class="container">
        <div class="results-header">
          <h1 class="section-title">Muhurta Finder</h1>
          <p class="text-secondary">Find auspicious dates for important life events based on Vedic Panchang</p>
        </div>

        <div class="card" style="max-width: 600px; margin: 0 auto 32px;">
          <div class="form-group">
            <label class="form-label">Activity Type</label>
            <select class="form-select" id="muhurta-activity">
              ${activities.map(a => `<option value="${a.id}">${a.icon} ${a.name} (${a.hindi})</option>`).join('')}
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Search From</label>
              <input type="date" class="form-input" id="muhurta-start" value="${todayStr}" />
            </div>
            <div class="form-group">
              <label class="form-label">Days to Search</label>
              <select class="form-select" id="muhurta-days">
                <option value="30">30 days</option>
                <option value="60" selected>60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary" id="muhurta-find" style="width: 100%; justify-content: center;">
            Find Auspicious Dates
          </button>
        </div>

        <div id="muhurta-results"></div>
      </div>
    </section>
  `;

  document.getElementById('muhurta-find')?.addEventListener('click', () => {
    const activityId = document.getElementById('muhurta-activity').value;
    const startStr = document.getElementById('muhurta-start').value;
    const days = parseInt(document.getElementById('muhurta-days').value);

    if (!startStr) return;
    const [y, m, d] = startStr.split('-').map(Number);
    const startDate = new Date(y, m - 1, d, 6, 0, 0);

    const btn = document.getElementById('muhurta-find');
    btn.textContent = 'Searching...';
    btn.disabled = true;

    setTimeout(() => {
      try {
        const results = findMuhurta(activityId, startDate, days);
        displayMuhurtaResults(activityId, results);
      } catch (err) {
        document.getElementById('muhurta-results').innerHTML = `<p class="text-rose text-center">${err.message}</p>`;
      } finally {
        btn.textContent = 'Find Auspicious Dates';
        btn.disabled = false;
      }
    }, 100);
  });
}

function displayMuhurtaResults(activityId, results) {
  const el = document.getElementById('muhurta-results');

  if (results.length === 0) {
    el.innerHTML = `
      <div class="card text-center" style="padding: 40px;">
        <p class="text-secondary">No auspicious dates found in the selected range. Try extending the search period.</p>
      </div>
    `;
    return;
  }

  const excellent = results.filter(r => r.rating === 'Excellent');
  const good = results.filter(r => r.rating === 'Good');

  el.innerHTML = `
    <div class="fade-in">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="hero-badge" style="font-size: 0.85rem;">
          Found ${results.length} auspicious date${results.length !== 1 ? 's' : ''}: ${excellent.length} excellent, ${good.length} good
        </span>
      </div>

      <div style="display: grid; gap: 16px; max-width: 800px; margin: 0 auto;">
        ${results.slice(0, 15).map(r => renderMuhurtaCard(r)).join('')}
      </div>

      ${results.length > 15 ? `<p class="text-muted text-center mt-lg">Showing top 15 of ${results.length} results</p>` : ''}
    </div>
  `;
}

function renderMuhurtaCard(r) {
  const dateStr = r.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const ratingColor = r.rating === 'Excellent' ? 'var(--teal)' : 'var(--gold)';
  const ratingBg = r.rating === 'Excellent' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 215, 0, 0.08)';

  return `
    <div class="card" style="padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <div>
          <h3 style="font-family: var(--font-display); font-size: 1rem; color: var(--text-primary); margin-bottom: 2px;">${dateStr}</h3>
          <span class="text-muted" style="font-size: 0.8rem;">
            ${r.panchang.tithi.paksha} ${r.panchang.tithi.name} • ${r.panchang.nakshatra.name} • ${r.panchang.yoga.name}
          </span>
        </div>
        <span style="background: ${ratingBg}; color: ${ratingColor}; padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 600; flex-shrink: 0;">
          ${r.rating}
        </span>
      </div>

      ${r.good.length > 0 ? `
        <div style="margin-bottom: 8px;">
          ${r.good.map(g => `<span style="display: inline-block; padding: 2px 8px; margin: 2px; border-radius: 4px; font-size: 0.75rem; background: rgba(16, 185, 129, 0.08); color: var(--teal);">${g}</span>`).join('')}
        </div>
      ` : ''}

      ${r.bad.length > 0 ? `
        <div>
          ${r.bad.map(b => `<span style="display: inline-block; padding: 2px 8px; margin: 2px; border-radius: 4px; font-size: 0.75rem; background: rgba(251, 113, 133, 0.08); color: var(--rose);">${b}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
}
