// ============================================================
// RashAi, South Indian Birth Chart SVG Renderer
// The traditional square format used widely in South India
// ============================================================

import { RASHIS } from '../../engine/constants.js';

/**
 * Render a South Indian style birth chart as SVG
 * 
 * Layout (4x4 grid, corners unused):
 * ┌─────┬─────┬─────┬─────┐
 * │ Pi  │ Ar  │ Ta  │ Ge  │
 * ├─────┼─────┼─────┼─────┤
 * │ Aq  │                 │ Cn  │
 * ├─────┤     CENTER     ├─────┤
 * │ Cap │                 │ Le  │
 * ├─────┼─────┼─────┼─────┤
 * │ Sg  │ Sc  │ Li  │ Vi  │
 * └─────┴─────┴─────┴─────┘
 * 
 * Rashis are FIXED in South Indian chart.
 * Ascendant position is marked with a diagonal line.
 */
export function renderSouthIndianChart(houses, lagnaRashi, containerId) {
  const width = 420;
  const height = 420;
  const cellW = width / 4;
  const cellH = height / 4;
  const padding = 12;

  // Fixed rashi positions in South Indian chart (row, col)
  const rashiPositions = [
    { rashi: 11, row: 0, col: 0 },  // Pisces
    { rashi: 0,  row: 0, col: 1 },  // Aries
    { rashi: 1,  row: 0, col: 2 },  // Taurus
    { rashi: 2,  row: 0, col: 3 },  // Gemini
    { rashi: 10, row: 1, col: 0 },  // Aquarius
    { rashi: 3,  row: 1, col: 3 },  // Cancer
    { rashi: 9,  row: 2, col: 0 },  // Capricorn
    { rashi: 4,  row: 2, col: 3 },  // Leo
    { rashi: 8,  row: 3, col: 0 },  // Sagittarius
    { rashi: 7,  row: 3, col: 1 },  // Scorpio
    { rashi: 6,  row: 3, col: 2 },  // Libra
    { rashi: 5,  row: 3, col: 3 },  // Virgo
  ];

  let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="birth-chart south-indian">`;

  // Background
  svg += `<rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="rgba(15,10,40,0.6)" stroke="rgba(255,215,0,0.3)" stroke-width="1.5"/>`;

  // Draw grid lines
  for (let i = 1; i < 4; i++) {
    svg += `<line x1="${i * cellW}" y1="0" x2="${i * cellW}" y2="${height}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;
    svg += `<line x1="0" y1="${i * cellH}" x2="${width}" y2="${i * cellH}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;
  }

  // Outer border
  svg += `<rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="none" stroke="rgba(255,215,0,0.5)" stroke-width="2"/>`;

  // Center box border
  svg += `<rect x="${cellW}" y="${cellH}" width="${cellW * 2}" height="${cellH * 2}" fill="rgba(15,10,40,0.8)" stroke="rgba(255,215,0,0.3)" stroke-width="1"/>`;

  // Center label
  svg += `<text x="${width/2}" y="${height/2 - 10}" text-anchor="middle" fill="rgba(255,215,0,0.6)" font-size="14" font-family="'Inter', sans-serif" font-weight="600">रश AI</text>`;
  svg += `<text x="${width/2}" y="${height/2 + 12}" text-anchor="middle" fill="rgba(255,215,0,0.4)" font-size="10" font-family="'Inter', sans-serif">Birth Chart</text>`;

  // Build planet-per-rashi map from houses
  const planetsByRashi = {};
  for (const house of houses) {
    const rashiIdx = house.rashiIndex;
    if (!planetsByRashi[rashiIdx]) planetsByRashi[rashiIdx] = [];
    for (const planet of house.planets) {
      planetsByRashi[rashiIdx].push(planet);
    }
  }

  // Render each rashi cell
  for (const pos of rashiPositions) {
    const x = pos.col * cellW;
    const y = pos.row * cellH;
    const rashi = RASHIS[pos.rashi];

    // Rashi label (small, in corner of cell)
    svg += `<text x="${x + 6}" y="${y + 14}" fill="rgba(200,180,255,0.6)" font-size="9" font-family="'Inter', sans-serif">${rashi.symbol} ${rashi.hindi}</text>`;

    // Mark Ascendant with diagonal
    if (pos.rashi === lagnaRashi) {
      svg += `<line x1="${x}" y1="${y}" x2="${x + 18}" y2="${y + 18}" stroke="#FFD700" stroke-width="2"/>`;
    }

    // Render planets in this rashi
    const planets = planetsByRashi[pos.rashi] || [];
    planets.forEach((planet, idx) => {
      const px = x + padding;
      const py = y + 30 + (idx * 16);
      const color = planet.isRetrograde ? '#ff6b6b' : '#e0d0ff';
      const retroLabel = planet.isRetrograde ? '(R)' : '';

      svg += `<text x="${px}" y="${py}" fill="${color}" font-size="12" font-weight="500" font-family="'Inter', sans-serif">${planet.abbr} ${Math.floor(planet.degree)}° ${retroLabel}</text>`;
    });
  }

  svg += `</svg>`;
  return svg;
}
