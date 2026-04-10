// ============================================================
// RashAi, Baby Naming Guide by Nakshatra
// Shows the traditional first syllables derived from birth Nakshatra Pada
// ============================================================

import { NAKSHATRAS } from './constants.js';

/**
 * Get naming syllables for a given nakshatra and pada
 * @param {number} nakshatraId - Nakshatra index (0-26)
 * @param {number} pada - Pada number (1-4)
 * @returns {Object} Naming information
 */
export function getNameSuggestions(nakshatraId, pada) {
  const nakshatra = NAKSHATRAS[nakshatraId];
  if (!nakshatra) return null;

  const syllable = nakshatra.syllables[pada - 1];
  const allSyllables = nakshatra.syllables;

  const allPadaSuggestions = allSyllables.map((syl, idx) => ({
    pada: idx + 1,
    syllable: syl,
    isActive: idx === pada - 1,
  }));

  return {
    nakshatra: nakshatra.name,
    nakshatraHindi: nakshatra.hindi,
    lord: nakshatra.lord,
    pada,
    primarySyllable: syllable,
    allPadaSuggestions,
  };
}

/**
 * Render the baby names section HTML
 */
export function renderNamesSection(nakshatraId, pada) {
  const info = getNameSuggestions(nakshatraId, pada);
  if (!info) return '';

  return `
    <div class="card" id="names-section" style="margin-top: 24px;">
      <h3 style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 4px; color: var(--gold);">
        Baby Naming Guide
      </h3>
      <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 20px;">
        Based on <strong>${info.nakshatra}</strong> (${info.nakshatraHindi}) Nakshatra, Lord: ${info.lord}
      </p>

      <!-- All 4 Pada Syllables -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
        ${info.allPadaSuggestions.map(p => `
          <div style="
            text-align: center;
            padding: 16px 8px;
            border-radius: var(--radius-md);
            border: 1px solid ${p.isActive ? 'var(--gold)' : 'var(--border-subtle)'};
            background: ${p.isActive ? 'var(--gold-glow)' : 'transparent'};
            transition: all 0.2s ease;
          ">
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 4px;">Pada ${p.pada}</div>
            <div style="font-size: 1.8rem; font-weight: 700; color: ${p.isActive ? 'var(--gold)' : 'var(--text-primary)'};">
              ${p.syllable}
            </div>
            ${p.isActive ? '<div style="font-size: 0.65rem; color: var(--gold); margin-top: 4px;">Birth Pada</div>' : ''}
          </div>
        `).join('')}
      </div>

      <div style="
        text-align: center;
        padding: 20px;
        border-radius: var(--radius-md);
        background: var(--gold-glow);
        border: 1px solid var(--border-active);
        margin-bottom: 16px;
      ">
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 6px;">Name should start with</div>
        <div style="font-size: 2.5rem; font-weight: 800; color: var(--gold); font-family: var(--font-display);">
          ${info.primarySyllable}
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 6px;">
          Pada ${info.pada} of ${info.nakshatra}
        </div>
      </div>

      <div class="info-panel" style="background: rgba(255, 215, 0, 0.04); border-color: rgba(255, 215, 0, 0.1);">
        <div class="info-panel-title" style="color: var(--gold-dim);">Tradition</div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">
          In Hindu tradition, the first letter of a baby's name is derived from the Moon's Nakshatra at birth.
          Each Nakshatra has 4 padas, each with a specific syllable. Using these syllables is believed to
          bring harmony between the child's name and their cosmic vibration.
        </p>
      </div>
    </div>
  `;
}
