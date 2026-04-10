// ============================================================
// RashAi, Results Page (Kundali Display)
// ============================================================

import { calculatePlanetaryPositions } from '../../engine/planets.js';
import { generatePlanetaryReport, getMoonSign, getSunSign, getLagna, getBirthNakshatra } from '../../engine/rashi.js';
import { generateChart } from '../../engine/houses.js';
import { checkAllDoshas } from '../../engine/doshas.js';
import { renderSouthIndianChart } from '../components/chart-south.js';
import { renderNorthIndianChart } from '../components/chart-north.js';
import { renderNamesSection } from '../../engine/nakshatra-names.js';
import { calculateNavamsaChart, findVargottamaPlanets } from '../../engine/navamsa.js';
import { analyzeTransits, getUpcomingTransitEvents } from '../../engine/transit.js';
import { checkSadeSati, checkDhaiya } from '../../engine/sade-sati.js';
import { calculateShadbala } from '../../engine/shadbala.js';

export function renderResults(container) {
  const stored = sessionStorage.getItem('rashaiCurrentChart');

  if (!stored) {
    container.innerHTML = `
      <section class="hero" style="min-height: 80vh;">
        <h2 class="section-title">No Birth Data Found</h2>
        <p class="hero-subtitle">Please enter your birth details first to generate your Kundali.</p>
        <a href="#calculator" class="btn btn-primary">Enter Birth Details</a>
      </section>
    `;
    return;
  }

  container.innerHTML = `
    <div class="loading-overlay" id="results-loading">
      <div class="loading-spinner"></div>
      <p class="loading-text">Calculating planetary positions...</p>
    </div>
  `;

  setTimeout(() => {
    try {
      const birthData = JSON.parse(stored);
      const results = computeKundali(birthData);
      displayResults(container, results, birthData);
    } catch (err) {
      console.error('Calculation error:', err);
      container.innerHTML = `
        <section class="hero" style="min-height: 80vh;">
          <h2 class="section-title text-rose">Calculation Error</h2>
          <p class="hero-subtitle">${err.message}</p>
          <a href="#calculator" class="btn btn-primary">Try Again</a>
        </section>
      `;
    }
  }, 300);
}

function computeKundali(birthData) {
  const [year, month, day] = birthData.date.split('-').map(Number);
  const [hours, minutes] = birthData.time.split(':').map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes, 0);
  const utcDate = new Date(localDate.getTime() - birthData.timezone * 60 * 60 * 1000);

  const chartData = calculatePlanetaryPositions(utcDate, birthData.lat, birthData.lng);
  const chart = generateChart(chartData);
  const report = generatePlanetaryReport(chartData);
  const doshas = checkAllDoshas(chart);
  const moonSign = getMoonSign(chart.positions);
  const sunSign = getSunSign(chart.positions);
  const lagna = getLagna(chart.positions);
  const birthNakshatra = getBirthNakshatra(chart.positions);

  // New calculations
  const navamsa = calculateNavamsaChart(chart.positions);
  const vargottama = findVargottamaPlanets(chart.positions);
  const transitAnalysis = analyzeTransits(moonSign.id);
  const transitEvents = getUpcomingTransitEvents();
  const sadeSati = checkSadeSati(moonSign.id);
  const dhaiya = checkDhaiya(moonSign.id);
  const shadbala = calculateShadbala(chart, chart.positions);

  return { chart, report, doshas, moonSign, sunSign, lagna, birthNakshatra, navamsa, vargottama, transitAnalysis, transitEvents, sadeSati, dhaiya, shadbala };
}

function displayResults(container, results, birthData) {
  const { chart, report, doshas, moonSign, sunSign, lagna, birthNakshatra, navamsa, vargottama, transitAnalysis, transitEvents, sadeSati, dhaiya, shadbala } = results;

  const southChartSvg = renderSouthIndianChart(chart.houses, chart.lagnaRashi, 'south-chart');
  const northChartSvg = renderNorthIndianChart(chart.houses, chart.lagnaRashi, 'north-chart');

  // Navamsa chart reuses the South Indian renderer with navamsa houses
  const navamsaSvg = renderSouthIndianChart(navamsa.houses, navamsa.lagnaRashi, 'navamsa-chart');

  container.innerHTML = `
    <section class="results-page fade-in">
      <div class="container">
        <div class="results-header">
          <h1 class="section-title">
            ${birthData.name ? birthData.name + "'s " : ''}Kundali
          </h1>
          <p class="text-secondary">
            Born on ${formatDate(birthData.date)} at ${birthData.time}
            in ${birthData.place?.split(',')[0] || birthData.place}
          </p>
        </div>

        <!-- Key Info Panels -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 40px;">
          <div class="info-panel">
            <div class="info-panel-title">Moon Sign (Rashi)</div>
            <div class="info-panel-value">${moonSign.symbol} ${moonSign.name}</div>
            <div class="info-panel-detail">${moonSign.hindi} • Lord: ${moonSign.lord}</div>
          </div>
          <div class="info-panel">
            <div class="info-panel-title">Sun Sign</div>
            <div class="info-panel-value">${sunSign.symbol} ${sunSign.name}</div>
            <div class="info-panel-detail">${sunSign.hindi} • ${sunSign.element}</div>
          </div>
          <div class="info-panel">
            <div class="info-panel-title">Ascendant (Lagna)</div>
            <div class="info-panel-value">${lagna.symbol} ${lagna.name}</div>
            <div class="info-panel-detail">${lagna.hindi} • Lord: ${lagna.lord}</div>
          </div>
          <div class="info-panel">
            <div class="info-panel-title">Birth Nakshatra</div>
            <div class="info-panel-value">${birthNakshatra.name}</div>
            <div class="info-panel-detail">${birthNakshatra.hindi} • Pada ${birthNakshatra.pada} • Lord: ${birthNakshatra.lord}</div>
          </div>
        </div>

        <!-- Sade Sati / Dhaiya Alert -->
        ${sadeSati.isActive ? `
          <div class="card" style="border-color: var(--rose); margin-bottom: 24px; padding: 16px 20px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 1.5rem;">♄</span>
              <div>
                <h3 style="font-family: var(--font-display); font-size: 1rem; color: var(--rose); margin-bottom: 2px;">
                  Sade Sati Active: ${sadeSati.phaseInfo.name}
                </h3>
                <p class="text-secondary" style="font-size: 0.85rem;">${sadeSati.message}</p>
              </div>
            </div>
          </div>
        ` : dhaiya.isActive ? `
          <div class="card" style="border-color: var(--amber); margin-bottom: 24px; padding: 16px 20px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 1.5rem;">♄</span>
              <div>
                <h3 style="font-family: var(--font-display); font-size: 1rem; color: var(--amber); margin-bottom: 2px;">
                  Small Panoti (Dhaiya) Active
                </h3>
                <p class="text-secondary" style="font-size: 0.85rem;">${dhaiya.message}</p>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Baby Naming Guide -->
        ${renderNamesSection(birthNakshatra.id, birthNakshatra.pada)}

        <!-- Birth Charts (Rashi + Navamsa) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px;" id="charts-grid">
          <div class="card chart-container">
            <div class="chart-toggle" id="chart-toggle">
              <button class="chart-toggle-btn active" data-chart="south" id="toggle-south">South Indian</button>
              <button class="chart-toggle-btn" data-chart="north" id="toggle-north">North Indian</button>
            </div>
            <div id="chart-display">${southChartSvg}</div>
          </div>

          <div class="card chart-container">
            <div style="text-align: center; margin-bottom: 12px;">
              <span class="chart-toggle-btn active" style="cursor: default;">Navamsa (D9)</span>
            </div>
            <div>${navamsaSvg}</div>
            ${vargottama.length > 0 ? `
              <div style="margin-top: 12px; padding: 10px; background: var(--gold-glow); border-radius: var(--radius-sm);">
                <p style="font-size: 0.8rem; color: var(--gold); font-weight: 600; margin-bottom: 4px;">Vargottama Planets</p>
                ${vargottama.map(v => `<p style="font-size: 0.78rem; color: var(--text-secondary);">${v.planet} in ${v.sign}</p>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Planet Table -->
        <div class="card" style="overflow-x: auto; margin-bottom: 40px;">
          <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 16px; color: var(--gold);">
            Planetary Positions
          </h3>
          <table class="planet-table">
            <thead>
              <tr><th>Planet</th><th>Sign</th><th>Degree</th><th>Nakshatra</th><th>House</th></tr>
            </thead>
            <tbody>${generatePlanetTableRows(report)}</tbody>
          </table>
        </div>

        <!-- Shadbala (Planetary Strength) -->
        <div class="card" style="margin-bottom: 40px;">
          <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 4px; color: var(--gold);">
            Planetary Strength (Shadbala)
          </h3>
          <p class="text-secondary" style="font-size: 0.8rem; margin-bottom: 16px;">
            Six-fold strength analysis. Strongest: <span class="text-gold">${shadbala.strongest}</span>,
            weakest: <span class="text-rose">${shadbala.weakest}</span>
          </p>
          <div style="display: grid; gap: 8px;">
            ${shadbala.ranking.map(r => {
              const pct = Math.min(100, (shadbala.planets[r.planet].ratio) * 60);
              const color = r.grade === 'Excellent' ? 'var(--teal)' : r.grade === 'Good' ? 'var(--gold)' : r.grade === 'Average' ? 'var(--amber)' : 'var(--rose)';
              return `
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="width: 70px; font-size: 0.85rem; font-weight: 600;">${r.planet}</span>
                  <div style="flex: 1; height: 8px; background: var(--bg-glass); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 4px; transition: width 0.5s;"></div>
                  </div>
                  <span style="width: 65px; font-size: 0.75rem; font-weight: 600; color: ${color}; text-align: right;">${r.grade}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Current Transits (Gochar) -->
        <div class="card" style="margin-bottom: 40px;">
          <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 4px; color: var(--gold);">
            Current Transits (Gochar)
          </h3>
          <p class="text-secondary" style="font-size: 0.8rem; margin-bottom: 16px;">
            Where planets are today relative to your Moon sign ${moonSign.symbol} ${moonSign.name}
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
            ${transitAnalysis.map(t => {
              const borderColor = t.nature === 'good' ? 'rgba(16, 185, 129, 0.3)' : t.nature === 'bad' ? 'rgba(251, 113, 133, 0.2)' : 'var(--border-subtle)';
              const natureColor = t.nature === 'good' ? 'var(--teal)' : t.nature === 'bad' ? 'var(--rose)' : 'var(--amber)';
              const natureLabel = t.nature === 'good' ? 'Favorable' : t.nature === 'bad' ? 'Challenging' : 'Neutral';
              return `
                <div style="padding: 12px; border: 1px solid ${borderColor}; border-radius: var(--radius-md); background: var(--bg-glass);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-weight: 600; font-size: 0.88rem;">${t.planet.symbol} ${t.planet.name}</span>
                    <span style="font-size: 0.7rem; font-weight: 600; color: ${natureColor};">${natureLabel}</span>
                  </div>
                  <p style="font-size: 0.78rem; color: var(--text-secondary);">
                    In ${t.transitSign.symbol} ${t.transitSign.name} (${ordinal(t.houseFromMoon)} from Moon)${t.isRetrograde ? ' <span class="retro-badge">R</span>' : ''}
                  </p>
                  <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${t.effect}</p>
                </div>
              `;
            }).join('')}
          </div>
          ${transitEvents.length > 0 ? `
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
              <p style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Upcoming Sign Changes</p>
              ${transitEvents.slice(0, 4).map(e => `
                <p style="font-size: 0.78rem; color: var(--text-muted);">
                  ${e.planet}: ${e.currentSign} → ${e.nextSign} (~${e.daysRemaining} days)
                </p>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Doshas -->
        <div class="doshas-section">
          <h2 class="section-title" style="font-size: 1.8rem; margin-bottom: 24px;">Dosha Analysis</h2>
          ${renderDoshaCard('Mangal Dosha (Mars)', 'मंगल दोष', doshas.mangalDosha)}
          ${renderDoshaCard('Kaal Sarp Dosha', 'काल सर्प दोष', doshas.kaalSarpDosha)}
          ${renderDoshaCard('Pitra Dosha', 'पितृ दोष', doshas.pitraDosha)}
        </div>

        <!-- Sade Sati Detail -->
        ${renderSadeSatiSection(sadeSati)}

        <!-- AI Insights -->
        <div class="card" style="margin-top: 40px;" id="ai-insights-section">
          <h3 style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 4px; color: var(--gold);">
            AI Insights
          </h3>
          <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 16px;">
            Vedic interpretation of your chart powered by AI. Personality, career, relationships, strengths and remedies.
          </p>
          <button class="btn btn-primary" id="generate-ai-btn" style="width: 100%; justify-content: center;">
            Generate AI Reading
          </button>
          <div id="ai-insights-output" style="margin-top: 20px;"></div>
        </div>

        <!-- Varshaphal Button -->
        <div class="card" style="margin-top: 40px;" id="varshaphal-section">
          <h3 style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 4px; color: var(--gold);">
            Yearly Predictions (Varshaphal)
          </h3>
          <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 16px;">
            Solar return chart analysis for the current year. Muntha position, year lord, and key predictions.
          </p>
          <button class="btn btn-secondary" id="varshaphal-btn" style="width: 100%; justify-content: center;">
            Generate ${new Date().getFullYear()} Predictions
          </button>
          <div id="varshaphal-output" style="margin-top: 20px;"></div>
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 16px; justify-content: center; margin-top: 40px; flex-wrap: wrap;">
          <button class="btn btn-secondary" id="export-pdf-btn">Export PDF</button>
          <button class="btn btn-secondary" id="save-chart-btn">Save to Browser</button>
          <button class="btn btn-secondary" id="share-chart-btn">Copy Share Link</button>
          <a href="#matching" class="btn btn-primary">Match This Kundali</a>
          <a href="#calculator" class="btn btn-secondary">New Kundali</a>
        </div>
      </div>
    </section>
  `;

  // Chart toggle
  const chartDisplay = document.getElementById('chart-display');
  document.getElementById('toggle-south')?.addEventListener('click', () => {
    chartDisplay.innerHTML = southChartSvg;
    document.getElementById('toggle-south').classList.add('active');
    document.getElementById('toggle-north').classList.remove('active');
  });
  document.getElementById('toggle-north')?.addEventListener('click', () => {
    chartDisplay.innerHTML = northChartSvg;
    document.getElementById('toggle-north').classList.add('active');
    document.getElementById('toggle-south').classList.remove('active');
  });

  // Save
  document.getElementById('save-chart-btn')?.addEventListener('click', () => {
    const saved = JSON.parse(localStorage.getItem('rashaiSavedCharts') || '[]');
    saved.push({ ...birthData, id: Date.now(), savedAt: new Date().toISOString() });
    localStorage.setItem('rashaiSavedCharts', JSON.stringify(saved));
    alert(`Chart saved! You now have ${saved.length} chart(s) stored locally.`);
  });

  // Share
  document.getElementById('share-chart-btn')?.addEventListener('click', () => {
    const encoded = btoa(JSON.stringify(birthData));
    const shareUrl = `${window.location.origin}${window.location.pathname}#results?d=${encodeURIComponent(encoded)}`;
    navigator.clipboard.writeText(shareUrl).then(() => alert('Share link copied!')).catch(() => prompt('Copy this link:', shareUrl));
  });

  // PDF
  document.getElementById('export-pdf-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('export-pdf-btn');
    btn.textContent = 'Generating PDF...';
    btn.disabled = true;
    try {
      const { exportKundaliPDF } = await import('../components/pdf-export.js');
      await exportKundaliPDF(birthData, results);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      btn.textContent = 'Export PDF';
      btn.disabled = false;
    }
  });

  // AI Insights
  document.getElementById('generate-ai-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('generate-ai-btn');
    const output = document.getElementById('ai-insights-output');
    btn.textContent = 'Reading your chart...';
    btn.disabled = true;
    output.innerHTML = '<p class="text-muted" style="text-align:center; font-size:0.9rem;">Consulting the grahas...</p>';
    try {
      const { generateInsights } = await import('../../engine/ai-insights.js');
      const insights = await generateInsights(birthData, results);
      output.innerHTML = renderAIInsights(insights);
    } catch (err) {
      output.innerHTML = `<p class="text-rose" style="font-size:0.9rem;">${err.message}</p>`;
    } finally {
      btn.textContent = 'Generate AI Reading';
      btn.disabled = false;
    }
  });

  // Varshaphal
  document.getElementById('varshaphal-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('varshaphal-btn');
    const output = document.getElementById('varshaphal-output');
    btn.textContent = 'Calculating solar return...';
    btn.disabled = true;
    try {
      const { calculateVarshaphal } = await import('../../engine/varshaphal.js');
      const sunLon = results.chart.positions.Sun.longitude;
      const varsh = calculateVarshaphal(birthData, sunLon, new Date().getFullYear());
      output.innerHTML = renderVarshaphal(varsh);
    } catch (err) {
      output.innerHTML = `<p class="text-rose" style="font-size:0.9rem;">${err.message}</p>`;
    } finally {
      btn.textContent = `Generate ${new Date().getFullYear()} Predictions`;
      btn.disabled = false;
    }
  });

  // Sade Sati AI
  document.getElementById('ai-sadesati-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('ai-sadesati-btn');
    const output = document.getElementById('ai-sadesati-output');
    btn.textContent = 'Reading Saturn\'s transit...';
    btn.disabled = true;
    output.innerHTML = '<p class="text-muted" style="text-align:center; font-size:0.9rem;">Interpreting Saturn\'s influence...</p>';

    const sadeSatiData = {
      isActive: sadeSati.isActive || false,
      phase: sadeSati.phase,
      phaseName: sadeSati.phaseInfo?.name,
      phaseDescription: sadeSati.phaseInfo?.description,
      moonSign: { name: sadeSati.moonSign?.name, hindi: sadeSati.moonSign?.hindi },
      saturnSign: { name: sadeSati.saturnSign?.name },
      saturnRetrograde: sadeSati.saturnRetrograde || false,
      nakshatra: birthNakshatra.name,
      dhaiya: { isActive: dhaiya.isActive, type: dhaiya.type },
      timeline: (sadeSati.timeline || []).map(p => ({ name: p.name, sign: p.sign, approximateStart: p.approximateStart, approximateEnd: p.approximateEnd, isCurrent: p.isCurrent })),
    };

    try {
      const { generateSadeSatiInsights } = await import('../../engine/ai-insights.js');
      const insights = await generateSadeSatiInsights(sadeSatiData);
      output.innerHTML = renderSadeSatiAIInsights(insights);
    } catch (err) {
      console.error('AI Sade Sati error:', err);
      output.innerHTML = `<p class="text-rose" style="font-size:0.9rem;">${err.message}</p>`;
    } finally {
      btn.textContent = 'Explain My Sade Sati';
      btn.disabled = false;
    }
  });

  checkForSharedData();
}

function generatePlanetTableRows(report) {
  const planetOrder = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  return planetOrder.map(planetId => {
    const data = report[planetId];
    if (!data) return '';
    const retroBadge = data.isRetrograde ? `<span class="retro-badge">R</span>` : '';
    return `
      <tr>
        <td><span class="planet-name"><span class="planet-symbol">${data.planet.symbol || ''}</span>${data.planet.name}${retroBadge}</span></td>
        <td>${data.rashi.symbol} ${data.rashi.name}</td>
        <td>${data.degree?.toFixed(2) || data.rashi?.degreeInSign?.toFixed(2) || '—'}°</td>
        <td>${data.nakshatra.name} (P${data.nakshatra.pada})</td>
        <td>${data.house || '—'}</td>
      </tr>
    `;
  }).join('');
}

function renderDoshaCard(title, hindi, dosha) {
  const isPresent = dosha.isPresent || dosha.partialKaalSarp;
  const severityClass = !isPresent ? 'none' : dosha.severity?.toLowerCase().includes('severe') ? 'severe' : dosha.severity?.toLowerCase().includes('moderate') ? 'moderate' : 'mild';
  const badgeText = !isPresent ? 'Not Present' : dosha.severity || 'Present';
  return `
    <div class="card dosha-card">
      <div class="dosha-header">
        <div><span class="dosha-title">${title}</span><span class="text-muted" style="font-size: 0.85rem; margin-left: 8px;">${hindi}</span></div>
        <span class="dosha-badge ${severityClass}">${badgeText}</span>
      </div>
      <p class="dosha-description">${dosha.description}</p>
      ${dosha.cancellationReasons?.length > 0 ? `
        <div class="info-panel mt-md">
          <div class="info-panel-title">Cancellation Factors</div>
          <ul style="margin-top: 8px; padding-left: 20px; color: var(--text-secondary); font-size: 0.85rem;">
            ${dosha.cancellationReasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

function renderSadeSatiSection(sadeSati) {
  if (!sadeSati.isActive && !sadeSati.timeline?.length) return '';
  return `
    <div class="card" style="margin-top: 40px;">
      <h3 style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 4px; color: ${sadeSati.isActive ? 'var(--rose)' : 'var(--gold)'};">
        Sade Sati Timeline
      </h3>
      <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 16px;">
        Saturn's 7.5-year transit over your Moon sign ${sadeSati.moonSign.symbol} ${sadeSati.moonSign.name}
      </p>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        ${(sadeSati.timeline || []).map(phase => {
          const isActive = phase.isCurrent;
          const borderColor = isActive ? 'var(--rose)' : 'var(--border-subtle)';
          return `
            <div style="padding: 14px; border: 1px solid ${borderColor}; border-radius: var(--radius-md); background: ${isActive ? 'rgba(251, 113, 133, 0.06)' : 'var(--bg-glass)'};">
              <p style="font-weight: 700; font-size: 0.85rem; color: ${isActive ? 'var(--rose)' : 'var(--text-primary)'}; margin-bottom: 4px;">
                ${phase.name} ${isActive ? '(Active)' : ''}
              </p>
              <p style="font-size: 0.78rem; color: var(--text-secondary);">
                ${phase.sign} (${phase.signHindi})
              </p>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                ${phase.approximateStart} to ${phase.approximateEnd}
              </p>
            </div>
          `;
        }).join('')}
      </div>
      ${sadeSati.isActive && sadeSati.remedies?.length > 0 ? `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
          <p style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Recommended Remedies</p>
          ${sadeSati.remedies.slice(0, 4).map(r => `
            <div style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.82rem;">
              <span class="text-gold">${r.type}:</span>
              <span class="text-secondary">${r.remedy}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
        <p class="text-secondary" style="font-size: 0.8rem; margin-bottom: 10px;">
          Personalized AI interpretation of Saturn's influence on your chart.
        </p>
        <button class="btn btn-primary" id="ai-sadesati-btn" style="width: 100%; justify-content: center;">
          Explain My Sade Sati
        </button>
        <div id="ai-sadesati-output" style="margin-top: 16px;"></div>
      </div>
    </div>
  `;
}

function renderSadeSatiAIInsights(insights) {
  const sections = [
    { key: 'impact', label: 'Life Impact', icon: '♄', color: 'var(--rose)' },
    { key: 'mental', label: 'Mental & Emotional', icon: '☽', color: 'var(--purple-light)' },
    { key: 'career', label: 'Career & Finances', icon: '☉', color: 'var(--gold)' },
    { key: 'remedies', label: 'Remedies & Guidance', icon: '♃', color: 'var(--teal)' },
  ];
  return sections
    .filter(s => insights[s.key])
    .map(s => `
      <div style="margin-bottom: 14px; padding: 14px; border-radius: var(--radius-md); background: var(--bg-glass); border: 1px solid var(--border-subtle);">
        <div style="font-weight: 600; font-size: 0.9rem; color: ${s.color}; margin-bottom: 6px;">${s.icon} ${s.label}</div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.7;">${insights[s.key]}</p>
      </div>
    `).join('');
}

function renderVarshaphal(varsh) {
  return `
    <div class="fade-in">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div class="info-panel">
          <div class="info-panel-title">Solar Return</div>
          <div class="info-panel-value" style="font-size: 1rem;">${varsh.solarReturnDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
        <div class="info-panel">
          <div class="info-panel-title">Varsha Lagna</div>
          <div class="info-panel-value" style="font-size: 1rem;">${varsh.varshLagna.symbol} ${varsh.varshLagna.name}</div>
        </div>
        <div class="info-panel">
          <div class="info-panel-title">Year Lord</div>
          <div class="info-panel-value" style="font-size: 1rem;">${varsh.varshesh}</div>
        </div>
        <div class="info-panel">
          <div class="info-panel-title">Muntha</div>
          <div class="info-panel-value" style="font-size: 1rem;">${varsh.munthaSign.symbol} ${varsh.munthaSign.name}</div>
        </div>
      </div>
      <div style="display: grid; gap: 10px;">
        ${varsh.predictions.map(p => {
          const color = p.nature === 'good' ? 'var(--teal)' : p.nature === 'caution' ? 'var(--amber)' : 'var(--text-secondary)';
          return `
            <div style="padding: 12px; border-left: 3px solid ${color}; background: var(--bg-glass); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
              <p style="font-weight: 600; font-size: 0.88rem; color: ${color}; margin-bottom: 2px;">${p.title}</p>
              <p style="font-size: 0.82rem; color: var(--text-secondary);">${p.text}</p>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function renderAIInsights(insights) {
  const sections = [
    { key: 'personality', label: 'Personality', icon: '♈', color: 'var(--purple-light)' },
    { key: 'career', label: 'Career', icon: '☉', color: 'var(--gold)' },
    { key: 'relationships', label: 'Relationships', icon: '♀', color: 'var(--rose)' },
    { key: 'strengths', label: 'Strengths', icon: '♃', color: 'var(--teal)' },
    { key: 'challenges', label: 'Challenges & Remedies', icon: '♄', color: 'var(--amber)' },
  ];
  return sections
    .filter(s => insights[s.key])
    .map(s => `
      <div style="margin-bottom: 16px; padding: 14px; border-radius: var(--radius-md); background: var(--bg-glass); border: 1px solid var(--border-subtle);">
        <div style="font-weight: 600; font-size: 0.9rem; color: ${s.color}; margin-bottom: 6px;">${s.icon} ${s.label}</div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.7;">${insights[s.key]}</p>
      </div>
    `).join('');
}

function checkForSharedData() {
  const hash = window.location.hash;
  if (hash.includes('d=')) {
    try {
      const encoded = new URLSearchParams(hash.split('?')[1]).get('d');
      if (encoded) {
        const decoded = JSON.parse(atob(decodeURIComponent(encoded)));
        sessionStorage.setItem('rashaiCurrentChart', JSON.stringify(decoded));
      }
    } catch (e) { /* ignore */ }
  }
}
