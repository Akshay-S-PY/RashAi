// ============================================================
// RashAi, North Indian Birth Chart SVG Renderer
// The diamond format used widely in North India
// ============================================================

import { RASHIS } from '../../engine/constants.js';

/**
 * Render a North Indian style birth chart as SVG.
 * 
 * The North Indian chart is a diamond layout where
 * houses (not rashis) are FIXED, and the Ascendant
 * always goes in the top center diamond.
 * 
 * Layout:
 *         ┌───────┐
 *        / 12 │ 1  \           (House 1 = top center)
 *       /─────┼─────\
 *      / 11   │   2  \
 *     │───────┼───────│
 *      \ 10   │   3  /
 *       \─────┼─────/
 *        \  9 │ 4  /
 *         └───────┘
 *        8  7  6  5
 */
export function renderNorthIndianChart(houses, lagnaRashi, containerId) {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const half = size / 2 - 10;

  let svg = `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="birth-chart north-indian">`;

  // Background
  svg += `<rect x="0" y="0" width="${size}" height="${size}" rx="8" fill="rgba(15,10,40,0.6)" stroke="rgba(255,215,0,0.3)" stroke-width="1.5"/>`;

  // Outer diamond
  const outer = [
    [cx, cy - half],       // top
    [cx + half, cy],       // right
    [cx, cy + half],       // bottom
    [cx - half, cy],       // left
  ];

  svg += `<polygon points="${outer.map(p => p.join(',')).join(' ')}" fill="none" stroke="rgba(255,215,0,0.5)" stroke-width="2"/>`;

  // Inner lines, connect midpoints
  // Horizontal and vertical center lines
  svg += `<line x1="${cx}" y1="${cy - half}" x2="${cx}" y2="${cy + half}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;
  svg += `<line x1="${cx - half}" y1="${cy}" x2="${cx + half}" y2="${cy}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;

  // Diagonal lines creating 12 houses
  const qh = half / 2; // quarter half

  // Top-left to bottom-right diagonal sections
  svg += `<line x1="${cx - qh}" y1="${cy - qh}" x2="${cx + qh}" y2="${cy + qh}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;
  svg += `<line x1="${cx + qh}" y1="${cy - qh}" x2="${cx - qh}" y2="${cy + qh}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;

  // Lines from corners to create inner diamond
  // Inner diamond (center box)
  const inner = [
    [cx, cy - qh],
    [cx + qh, cy],
    [cx, cy + qh],
    [cx - qh, cy],
  ];
  svg += `<polygon points="${inner.map(p => p.join(',')).join(' ')}" fill="rgba(15,10,40,0.8)" stroke="rgba(255,215,0,0.3)" stroke-width="1"/>`;

  // Connecting lines from outer to inner
  // Top: outer top to inner top-left and top-right
  svg += `<line x1="${outer[0][0]}" y1="${outer[0][1]}" x2="${cx - qh}" y2="${cy}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;
  svg += `<line x1="${outer[0][0]}" y1="${outer[0][1]}" x2="${cx + qh}" y2="${cy}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;

  // Bottom
  svg += `<line x1="${outer[2][0]}" y1="${outer[2][1]}" x2="${cx - qh}" y2="${cy}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;
  svg += `<line x1="${outer[2][0]}" y1="${outer[2][1]}" x2="${cx + qh}" y2="${cy}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;

  // Left
  svg += `<line x1="${outer[3][0]}" y1="${outer[3][1]}" x2="${cx}" y2="${cy - qh}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;
  svg += `<line x1="${outer[3][0]}" y1="${outer[3][1]}" x2="${cx}" y2="${cy + qh}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;

  // Right
  svg += `<line x1="${outer[1][0]}" y1="${outer[1][1]}" x2="${cx}" y2="${cy - qh}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;
  svg += `<line x1="${outer[1][0]}" y1="${outer[1][1]}" x2="${cx}" y2="${cy + qh}" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>`;

  // House positions for labels and planets
  // In North Indian chart, houses are fixed: House 1 at top
  const housePositions = [
    { x: cx,        y: cy - half * 0.65 },  // House 1, top center
    { x: cx - qh * 1.2,   y: cy - half * 0.42 },  // House 2, top-left upper
    { x: cx - half * 0.65, y: cy - qh * 0.3 },    // House 3, left upper
    { x: cx - half * 0.65, y: cy + qh * 0.3 },    // House 4, left center
    { x: cx - qh * 1.2,   y: cy + half * 0.42 },  // House 5, bottom-left upper
    { x: cx,        y: cy + half * 0.65 },  // House 6, bottom center
    { x: cx + qh * 1.2,   y: cy + half * 0.42 },  // House 7, bottom-right
    { x: cx + half * 0.65, y: cy + qh * 0.3 },    // House 8, right lower
    { x: cx + half * 0.65, y: cy - qh * 0.3 },    // House 9, right center
    { x: cx + qh * 1.2,   y: cy - half * 0.42 },  // House 10, top-right upper
    { x: cx + qh * 0.4,   y: cy - half * 0.2 },   // House 11, near top-right
    { x: cx - qh * 0.4,   y: cy - half * 0.2 },   // House 12, near top-left
  ];

  // Render houses with rashi signs and planets
  houses.forEach((house, idx) => {
    const pos = housePositions[idx];
    if (!pos) return;

    const rashi = RASHIS[house.rashiIndex];

    // Rashi abbreviation
    svg += `<text x="${pos.x}" y="${pos.y - 8}" text-anchor="middle" fill="rgba(200,180,255,0.6)" font-size="9" font-family="'Inter', sans-serif">${rashi.symbol}${rashi.hindi}</text>`;

    // Planets
    house.planets.forEach((planet, pIdx) => {
      const color = planet.isRetrograde ? '#ff6b6b' : '#e0d0ff';
      const retro = planet.isRetrograde ? 'ᴿ' : '';
      svg += `<text x="${pos.x}" y="${pos.y + 6 + pIdx * 14}" text-anchor="middle" fill="${color}" font-size="11" font-weight="500" font-family="'Inter', sans-serif">${planet.abbr}${retro}</text>`;
    });
  });

  // Center label
  svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="rgba(255,215,0,0.5)" font-size="12" font-family="'Inter', sans-serif" font-weight="600">रश AI</text>`;
  svg += `<text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="rgba(255,215,0,0.3)" font-size="9" font-family="'Inter', sans-serif">Kundali</text>`;

  svg += `</svg>`;
  return svg;
}
