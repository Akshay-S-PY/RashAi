// ============================================================
// RashAi, Kundali Matching Page (Ashtakoot Gun Milan)
// ============================================================

import { calculatePlanetaryPositions } from '../../engine/planets.js';
import { getNakshatra, getRashi } from '../../engine/rashi.js';
import { generateChart } from '../../engine/houses.js';
import { checkMangalDosha } from '../../engine/doshas.js';
import { POPULAR_CITIES, geocodePlace } from '../../utils/geocoding.js';
import {
  NAKSHATRA_GANA, NAKSHATRA_NADI, NAKSHATRA_YONI,
  NAKSHATRA_VARNA, RASHI_VASHYA, YONI_ENEMIES, RASHIS
} from '../../engine/constants.js';
import { t } from '../../engine/i18n.js';

let placeA = null;
let placeB = null;

export function renderMatching(container) {
  placeA = null;
  placeB = null;

  container.innerHTML = `
    <section class="matching-section">
      <div class="container">
        <div class="text-center mb-lg">
          <h1 class="section-title">${t('match.title')}</h1>
          <p class="section-subtitle">${t('match.subtitle')}</p>
        </div>

        <div class="matching-forms">
          <!-- Bride -->
          <div class="card">
            <h3 class="card-title text-gold" style="margin-bottom: 20px;">${t('match.bride')}</h3>
            ${renderPersonForm('a')}
          </div>

          <div class="matching-divider">&amp;</div>

          <!-- Groom -->
          <div class="card">
            <h3 class="card-title text-gold" style="margin-bottom: 20px;">${t('match.groom')}</h3>
            ${renderPersonForm('b')}
          </div>
        </div>

        <div class="text-center">
          <button class="btn btn-primary" id="match-btn" style="padding: 16px 48px; font-size: 1.1rem;">
            ${t('match.submit')}
          </button>
        </div>

        <div id="matching-result" class="mt-xl"></div>
      </div>
    </section>
  `;

  setupMatchingListeners();
}

function renderPersonForm(prefix) {
  const defaultGender = prefix === 'a' ? 'female' : 'male';
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">${t('match.name')}</label>
        <input type="text" class="form-input" id="${prefix}-name" placeholder="${t('match.name')}" />
      </div>
      <div class="form-group">
        <label class="form-label">${t('match.gender')}</label>
        <select class="form-select" id="${prefix}-gender">
          <option value="female" ${defaultGender === 'female' ? 'selected' : ''}>${t('common.female')}</option>
          <option value="male" ${defaultGender === 'male' ? 'selected' : ''}>${t('common.male')}</option>
          <option value="other">${t('common.other')}</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">${t('match.dob')}</label>
        <input type="date" class="form-input" id="${prefix}-date" required />
      </div>
      <div class="form-group">
        <label class="form-label">${t('match.tob')}</label>
        <input type="time" class="form-input" id="${prefix}-time" required />
      </div>
    </div>
    <div class="form-group" style="position: relative;">
      <label class="form-label">${t('match.pob')}</label>
      <input type="text" class="form-input" id="${prefix}-place" placeholder="${t('match.pob')}..." autocomplete="off" />
      <div id="${prefix}-suggestions" class="place-suggestions"></div>
    </div>
    <div class="form-group">
      <label class="form-label">${t('match.quickSelect')}</label>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${POPULAR_CITIES.slice(0, 8).map(city => `
          <button type="button" class="btn btn-sm btn-secondary quick-city-${prefix}" 
            data-lat="${city.lat}" data-lng="${city.lng}" data-name="${city.name}" 
            style="padding: 4px 10px; font-size: 0.75rem;">
            ${city.name}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function setupMatchingListeners() {
  // Geocoding for both forms
  setupPlaceAutocomplete('a');
  setupPlaceAutocomplete('b');

  // Quick city buttons
  document.querySelectorAll('.quick-city-a').forEach(btn => {
    btn.addEventListener('click', () => {
      placeA = { name: btn.dataset.name, lat: parseFloat(btn.dataset.lat), lng: parseFloat(btn.dataset.lng) };
      document.getElementById('a-place').value = btn.dataset.name;
    });
  });

  document.querySelectorAll('.quick-city-b').forEach(btn => {
    btn.addEventListener('click', () => {
      placeB = { name: btn.dataset.name, lat: parseFloat(btn.dataset.lat), lng: parseFloat(btn.dataset.lng) };
      document.getElementById('b-place').value = btn.dataset.name;
    });
  });

  // Match button
  document.getElementById('match-btn').addEventListener('click', handleMatch);
}

function setupPlaceAutocomplete(prefix) {
  let timer;
  const input = document.getElementById(`${prefix}-place`);
  const suggestions = document.getElementById(`${prefix}-suggestions`);

  input.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    if (q.length < 3) { suggestions.classList.remove('active'); return; }

    clearTimeout(timer);
    timer = setTimeout(async () => {
      const results = await geocodePlace(q);
      if (results.length > 0) {
        suggestions.innerHTML = results.map(r => `
          <div class="place-suggestion-item" data-lat="${r.lat}" data-lng="${r.lng}" data-name="${r.displayName}">
            ${r.displayName}
          </div>
        `).join('');
        suggestions.classList.add('active');

        suggestions.querySelectorAll('.place-suggestion-item').forEach(item => {
          item.addEventListener('click', () => {
            const lat = parseFloat(item.dataset.lat);
            const lng = parseFloat(item.dataset.lng);
            if (prefix === 'a') placeA = { name: item.dataset.name, lat, lng };
            else placeB = { name: item.dataset.name, lat, lng };
            input.value = item.dataset.name;
            suggestions.classList.remove('active');
          });
        });
      }
    }, 500);
  });
}

function handleMatch() {
  const dateA = document.getElementById('a-date').value;
  const timeA = document.getElementById('a-time').value;
  const dateB = document.getElementById('b-date').value;
  const timeB = document.getElementById('b-time').value;
  const nameA = document.getElementById('a-name').value || t('match.bride');
  const nameB = document.getElementById('b-name').value || t('match.groom');
  const genderA = document.getElementById('a-gender').value;
  const genderB = document.getElementById('b-gender').value;

  if (!dateA || !timeA || !placeA) {
    alert(t('match.fillBride'));
    return;
  }
  if (!dateB || !timeB || !placeB) {
    alert(t('match.fillGroom'));
    return;
  }

  // Calculate positions for both
  const chartA = calculateChart(dateA, timeA, placeA.lat, placeA.lng);
  const chartB = calculateChart(dateB, timeB, placeB.lat, placeB.lng);

  // Generate full charts (with houses) for Mangal Dosha
  const fullChartA = generateChart(chartA);
  const fullChartB = generateChart(chartB);

  // Check Mangal Dosha for both
  const mangalA = checkMangalDosha(fullChartA.positions, fullChartA.houses);
  const mangalB = checkMangalDosha(fullChartB.positions, fullChartB.houses);

  // Get Moon nakshatra and rashi for both
  const moonA = chartA.positions.Moon;
  const moonB = chartB.positions.Moon;

  const nakA = getNakshatra(moonA.longitude);
  const nakB = getNakshatra(moonB.longitude);

  const rashiA = getRashi(moonA.longitude);
  const rashiB = getRashi(moonB.longitude);

  // Calculate Ashtakoot
  const result = calculateAshtakoot(nakA, nakB, rashiA, rashiB);

  displayMatchingResult(result, nameA, nameB, genderA, genderB, nakA, nakB, rashiA, rashiB, mangalA, mangalB);
}

function calculateChart(date, time, lat, lng) {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  const localDate = new Date(y, m - 1, d, h, min, 0);
  const utcDate = new Date(localDate.getTime() - 5.5 * 60 * 60 * 1000); // Default IST
  return calculatePlanetaryPositions(utcDate, lat, lng);
}

function calculateAshtakoot(nakA, nakB, rashiA, rashiB) {
  const kootas = [];
  let totalScore = 0;

  // 1. Varna (1 point)
  const varnaOrder = { 'Brahmin': 4, 'Kshatriya': 3, 'Vaishya': 2, 'Shudra': 1 };
  const varnaA = NAKSHATRA_VARNA[nakA.id];
  const varnaB = NAKSHATRA_VARNA[nakB.id];
  const varnaScore = (varnaOrder[varnaA] >= varnaOrder[varnaB]) ? 1 : 0;
  kootas.push({ name: 'Varna', hindi: 'वर्ण', max: 1, score: varnaScore, detail: `${varnaA} ↔ ${varnaB}` });
  totalScore += varnaScore;

  // 2. Vashya (2 points)
  const vashyaA = RASHI_VASHYA[rashiA.id];
  const vashyaB = RASHI_VASHYA[rashiB.id];
  let vashyaScore = 0;
  if (vashyaA === vashyaB) vashyaScore = 2;
  else if (
    (vashyaA === 'Chatushpada' && vashyaB === 'Dwipada') ||
    (vashyaA === 'Dwipada' && vashyaB === 'Chatushpada')
  ) vashyaScore = 1;
  else vashyaScore = 0.5;
  kootas.push({ name: 'Vashya', hindi: 'वश्य', max: 2, score: vashyaScore, detail: `${vashyaA} ↔ ${vashyaB}` });
  totalScore += vashyaScore;

  // 3. Tara (3 points)
  const taraDiff = ((nakB.id - nakA.id + 27) % 27);
  const taraGroup = (taraDiff % 9);
  const badTaras = [2, 4, 6, 8]; // 3rd, 5th, 7th, 9th are considered moderate
  const taraScore = badTaras.includes(taraGroup) ? 0 : 3;
  kootas.push({ name: 'Tara', hindi: 'तारा', max: 3, score: taraScore, detail: `Difference: ${taraDiff + 1}th nakshatra` });
  totalScore += taraScore;

  // 4. Yoni (4 points)
  const yoniA = NAKSHATRA_YONI[nakA.id];
  const yoniB = NAKSHATRA_YONI[nakB.id];
  let yoniScore = 0;
  if (yoniA.animal === yoniB.animal) {
    yoniScore = yoniA.type !== yoniB.type ? 4 : 3;
  } else {
    const isEnemy = YONI_ENEMIES.some(([a, b]) =>
      (a === yoniA.animal && b === yoniB.animal) || (b === yoniA.animal && a === yoniB.animal)
    );
    yoniScore = isEnemy ? 0 : 2;
  }
  kootas.push({ name: 'Yoni', hindi: 'योनि', max: 4, score: yoniScore, detail: `${yoniA.animal} ↔ ${yoniB.animal}` });
  totalScore += yoniScore;

  // 5. Graha Maitri (5 points)
  const lordA = rashiA.lord;
  const lordB = rashiB.lord;
  const friendships = {
    'Sun': { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'], neutral: ['Mercury'] },
    'Moon': { friends: ['Sun', 'Mercury'], enemies: [], neutral: ['Mars', 'Jupiter', 'Venus', 'Saturn'] },
    'Mars': { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'], neutral: ['Venus', 'Saturn'] },
    'Mercury': { friends: ['Sun', 'Venus'], enemies: ['Moon'], neutral: ['Mars', 'Jupiter', 'Saturn'] },
    'Jupiter': { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'], neutral: ['Saturn'] },
    'Venus': { friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'], neutral: ['Mars', 'Jupiter'] },
    'Saturn': { friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'], neutral: ['Jupiter'] },
  };

  let maitriScore = 0;
  const relA = friendships[lordA];
  const relB = friendships[lordB];

  if (lordA === lordB) {
    maitriScore = 5;
  } else if (relA && relB) {
    const aToB = relA.friends.includes(lordB) ? 'friend' : relA.enemies.includes(lordB) ? 'enemy' : 'neutral';
    const bToA = relB.friends.includes(lordA) ? 'friend' : relB.enemies.includes(lordA) ? 'enemy' : 'neutral';

    if (aToB === 'friend' && bToA === 'friend') maitriScore = 5;
    else if (aToB === 'friend' || bToA === 'friend') maitriScore = 4;
    else if (aToB === 'neutral' && bToA === 'neutral') maitriScore = 3;
    else if (aToB === 'enemy' || bToA === 'enemy') maitriScore = 1;
    else maitriScore = 2;
  } else {
    maitriScore = 3;
  }

  kootas.push({ name: 'Graha Maitri', hindi: 'ग्रह मैत्री', max: 5, score: maitriScore, detail: `${lordA} ↔ ${lordB}` });
  totalScore += maitriScore;

  // 6. Gana (6 points)
  const ganaA = NAKSHATRA_GANA[nakA.id];
  const ganaB = NAKSHATRA_GANA[nakB.id];
  let ganaScore = 0;
  if (ganaA === ganaB) ganaScore = 6;
  else if (
    (ganaA === 'Deva' && ganaB === 'Manushya') ||
    (ganaA === 'Manushya' && ganaB === 'Deva')
  ) ganaScore = 5;
  else if (
    (ganaA === 'Manushya' && ganaB === 'Rakshasa') ||
    (ganaA === 'Rakshasa' && ganaB === 'Manushya')
  ) ganaScore = 1;
  else ganaScore = 0;
  kootas.push({ name: 'Gana', hindi: 'गण', max: 6, score: ganaScore, detail: `${ganaA} ↔ ${ganaB}` });
  totalScore += ganaScore;

  // 7. Bhakoot (7 points)
  const rashiDiff = ((rashiB.id - rashiA.id + 12) % 12) + 1;
  const badBhakoot = [6, 8, 2, 12]; // 2/12, 6/8 are inauspicious
  let bhakootScore = badBhakoot.includes(rashiDiff) ? 0 : 7;
  kootas.push({ name: 'Bhakoot', hindi: 'भकूट', max: 7, score: bhakootScore, detail: `${rashiA.name} ↔ ${rashiB.name} (${rashiDiff}/12)` });
  totalScore += bhakootScore;

  // 8. Nadi (8 points)
  const nadiA = NAKSHATRA_NADI[nakA.id];
  const nadiB = NAKSHATRA_NADI[nakB.id];
  const nadiScore = nadiA === nadiB ? 0 : 8; // Same Nadi = 0 (most feared)
  kootas.push({ name: 'Nadi', hindi: 'नाड़ी', max: 8, score: nadiScore, detail: `${nadiA} ↔ ${nadiB}${nadiA === nadiB ? ' - SAME NADI' : ''}` });
  totalScore += nadiScore;

  return {
    kootas,
    totalScore,
    maxScore: 36,
    verdict: getVerdict(totalScore),
  };
}

function getVerdict(score) {
  if (score >= 25) return { text: 'Excellent Match', color: 'var(--teal)', desc: 'Highly compatible. Traditional texts consider 25+ as very auspicious for marriage.' };
  if (score >= 18) return { text: 'Good Match', color: 'var(--amber)', desc: 'Above average compatibility. Most families consider 18+ as acceptable.' };
  if (score >= 12) return { text: 'Average Match', color: '#fb923c', desc: 'Moderate compatibility. Some doshas may need attention.' };
  return { text: 'Below Average', color: 'var(--rose)', desc: 'Low compatibility score. Consult with family about specific concerns.' };
}

function displayMatchingResult(result, nameA, nameB, genderA, genderB, nakA, nakB, rashiA, rashiB, mangalA, mangalB) {
  const resultDiv = document.getElementById('matching-result');

  resultDiv.innerHTML = `
    <div class="matching-result card fade-in-up">
      <div class="text-center mb-lg">
        <p class="text-secondary">${nameA} & ${nameB}</p>
        <div class="score-circle" style="border-color: ${result.verdict.color};">
          <span class="score-value">${result.totalScore}</span>
          <span class="score-label">out of ${result.maxScore}</span>
        </div>
        <p style="font-size: 1.3rem; font-weight: 700; color: ${result.verdict.color};">
          ${result.verdict.text}
        </p>
        <p class="text-secondary mt-sm" style="font-size: 0.9rem; max-width: 500px; margin: 8px auto 0;">
          ${result.verdict.desc}
        </p>
      </div>

      <h3 style="font-family: var(--font-display); margin-bottom: 16px; color: var(--gold);">
        Koota Breakdown (8 Kootas)
      </h3>

      ${result.kootas.map(k => `
        <div class="koota-bar">
          <div>
            <span class="koota-name">${k.name}</span>
            <span class="text-muted" style="font-size: 0.75rem; margin-left: 6px;">${k.hindi}</span>
            <br><span class="text-muted" style="font-size: 0.75rem;">${k.detail}</span>
          </div>
          <div class="koota-score">
            <div class="koota-dots">
              ${Array.from({ length: k.max }, (_, i) =>
                `<span class="koota-dot ${i < Math.floor(k.score) ? 'filled' : ''}"></span>`
              ).join('')}
            </div>
            <span class="koota-points">${k.score}/${k.max}</span>
          </div>
        </div>
      `).join('')}

      <div class="info-panel mt-lg">
        <div class="info-panel-title">Birth Details Summary</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px;">
          <div>
            <p class="text-muted" style="font-size: 0.8rem;">${nameA} <span style="opacity: 0.5;">• ${genderA === 'female' ? 'Bride' : genderA === 'male' ? 'Groom' : 'Partner'}</span></p>
            <p style="font-size: 0.9rem;">${rashiA.symbol} ${rashiA.name} • ${nakA.name}</p>
          </div>
          <div>
            <p class="text-muted" style="font-size: 0.8rem;">${nameB} <span style="opacity: 0.5;">• ${genderB === 'male' ? 'Groom' : genderB === 'female' ? 'Bride' : 'Partner'}</span></p>
            <p style="font-size: 0.9rem;">${rashiB.symbol} ${rashiB.name} • ${nakB.name}</p>
          </div>
        </div>
      </div>

      <!-- Mangal Dosha Comparison -->
      <div class="card" style="margin-top: 24px; border: 1px solid var(--border-subtle);">
        <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 12px; color: var(--gold);">
          Mangal Dosha Compatibility
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          ${renderMangalStatus(nameA, mangalA)}
          ${renderMangalStatus(nameB, mangalB)}
        </div>
        ${getMangalCompatibilityVerdict(mangalA, mangalB)}
      </div>

      <!-- AI Match Analysis -->
      <div class="card" style="margin-top: 24px; border: 1px solid var(--border-subtle);">
        <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 4px; color: var(--gold);">
          AI Match Analysis
        </h3>
        <p class="text-secondary" style="font-size: 0.8rem; margin-bottom: 14px;">
          Detailed Vedic interpretation of this compatibility. Emotional dynamics, strengths, and remedies.
        </p>
        <button class="btn btn-primary" id="ai-match-btn" style="width: 100%; justify-content: center;">
          Explain This Match
        </button>
        <div id="ai-match-output" style="margin-top: 16px;"></div>
      </div>
    </div>
  `;

  // AI match analysis button
  document.getElementById('ai-match-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('ai-match-btn');
    const output = document.getElementById('ai-match-output');
    btn.textContent = 'Analyzing compatibility...';
    btn.disabled = true;
    output.innerHTML = '<p class="text-muted" style="text-align:center; font-size:0.9rem;">Reading the stars for this match...</p>';

    // Build compact match data for the AI
    const matchData = {
      personA: { name: nameA, rashi: rashiA.name, nakshatra: nakA.name, lord: rashiA.lord },
      personB: { name: nameB, rashi: rashiB.name, nakshatra: nakB.name, lord: rashiB.lord },
      totalScore: result.totalScore,
      maxScore: result.maxScore,
      verdict: result.verdict.text,
      kootas: result.kootas.map(k => ({ name: k.name, score: k.score, max: k.max, detail: k.detail })),
    };

    try {
      const { generateMatchInsights } = await import('../../engine/ai-insights.js');
      const insights = await generateMatchInsights(matchData);
      output.innerHTML = renderMatchAIInsights(insights);
    } catch (err) {
      console.error('AI match error:', err);
      output.innerHTML = `<p class="text-rose" style="font-size:0.9rem;">${err.message}</p>`;
    } finally {
      btn.textContent = 'Explain This Match';
      btn.disabled = false;
    }
  });

  // Scroll to result
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderMangalStatus(name, mangal) {
  if (!mangal.isPresent) {
    return `
      <div style="padding: 12px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.15);">
        <p class="text-muted" style="font-size: 0.8rem; margin-bottom: 4px;">${name}</p>
        <p style="font-size: 0.95rem; color: var(--teal); font-weight: 600;">No Mangal Dosha</p>
        <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">Mars is well-placed</p>
      </div>
    `;
  }

  const severityColor = mangal.isCancelled ? 'var(--amber)' : mangal.severity === 'Severe' ? 'var(--rose)' : 'var(--amber)';
  const severityBg = mangal.isCancelled ? 'rgba(255, 215, 0, 0.06)' : mangal.severity === 'Severe' ? 'rgba(251, 113, 133, 0.06)' : 'rgba(255, 215, 0, 0.06)';
  const sources = [mangal.fromLagna && 'Lagna', mangal.fromMoon && 'Moon', mangal.fromVenus && 'Venus'].filter(Boolean);

  return `
    <div style="padding: 12px; border-radius: var(--radius-md); background: ${severityBg}; border: 1px solid ${severityColor}22;">
      <p class="text-muted" style="font-size: 0.8rem; margin-bottom: 4px;">${name}</p>
      <p style="font-size: 0.95rem; color: ${severityColor}; font-weight: 600;">
        Mangal Dosha (${mangal.severity})
      </p>
      <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">
        From: ${sources.join(', ')}
      </p>
      ${mangal.isCancelled ? `<p style="font-size: 0.75rem; color: var(--teal); margin-top: 4px;">Cancellation applies</p>` : ''}
    </div>
  `;
}

function getMangalCompatibilityVerdict(mangalA, mangalB) {
  const bothPresent = mangalA.isPresent && mangalB.isPresent;
  const neitherPresent = !mangalA.isPresent && !mangalB.isPresent;
  const oneCancelled = (mangalA.isPresent && mangalA.isCancelled) || (mangalB.isPresent && mangalB.isCancelled);

  let verdict, color, bg;

  if (neitherPresent) {
    verdict = 'Neither person has Mangal Dosha. No concerns for marital compatibility from Mars.';
    color = 'var(--teal)';
    bg = 'rgba(16, 185, 129, 0.06)';
  } else if (bothPresent) {
    verdict = 'Both persons have Mangal Dosha, which traditionally cancels out the negative effects. This is considered compatible.';
    color = 'var(--teal)';
    bg = 'rgba(16, 185, 129, 0.06)';
  } else if (oneCancelled) {
    verdict = 'One person has Mangal Dosha but with cancellation factors. The dosha is weakened and less concerning for compatibility.';
    color = 'var(--amber)';
    bg = 'rgba(255, 215, 0, 0.06)';
  } else {
    verdict = 'Only one person has Mangal Dosha. Traditional texts recommend matching with another Manglik or performing remedial measures.';
    color = 'var(--rose)';
    bg = 'rgba(251, 113, 133, 0.06)';
  }

  return `
    <div style="margin-top: 12px; padding: 10px 14px; border-radius: var(--radius-md); background: ${bg}; border: 1px solid ${color}22;">
      <p style="font-size: 0.8rem; color: ${color}; line-height: 1.6;">${verdict}</p>
    </div>
  `;
}

function renderMatchAIInsights(insights) {
  const sections = [
    { key: 'compatibility', label: 'Compatibility Overview', icon: '♀♂', color: 'var(--gold)' },
    { key: 'emotional', label: 'Emotional Dynamics', icon: '☽', color: 'var(--purple-light)' },
    { key: 'strengths', label: 'Strengths of This Match', icon: '♃', color: 'var(--teal)' },
    { key: 'guidance', label: 'Guidance & Remedies', icon: '♄', color: 'var(--amber)' },
  ];

  return sections
    .filter(s => insights[s.key])
    .map(s => `
      <div style="margin-bottom: 14px; padding: 14px; border-radius: var(--radius-md); background: var(--bg-glass); border: 1px solid var(--border-subtle);">
        <div style="font-weight: 600; font-size: 0.9rem; color: ${s.color}; margin-bottom: 6px;">
          ${s.icon} ${s.label}
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.7;">${insights[s.key]}</p>
      </div>
    `).join('');
}
