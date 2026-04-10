// ============================================================
// RashAi, Transit (Gochar) Calculator
// Current planetary positions relative to birth Moon sign
// ============================================================

import { calculatePlanetaryPositions } from './planets.js';
import { getRashi, getNakshatra } from './rashi.js';
import { RASHIS, PLANETS } from './constants.js';

/**
 * Calculate current transit positions.
 * Uses a default location (doesn't affect slow-moving planets much).
 */
export function getCurrentTransits() {
  const now = new Date();
  // Use Delhi as default observer (transit positions are nearly the same everywhere)
  const positions = calculatePlanetaryPositions(now, 28.6139, 77.2090);
  const transits = {};

  for (const planet of PLANETS) {
    const pos = positions.positions[planet.id];
    if (!pos) continue;
    transits[planet.id] = {
      longitude: pos.longitude,
      rashi: getRashi(pos.longitude),
      nakshatra: getNakshatra(pos.longitude),
      isRetrograde: pos.isRetrograde || false,
    };
  }

  return transits;
}

/**
 * Vedic transit effects relative to birth Moon sign.
 * Returns an array of transit effects for each planet.
 */
const TRANSIT_EFFECTS = {
  Sun: {
    good: [3, 6, 10, 11],
    bad: [1, 5, 7, 8, 9, 12],
    neutral: [2, 4],
  },
  Moon: {
    good: [1, 3, 6, 7, 10, 11],
    bad: [2, 5, 8, 9, 12],
    neutral: [4],
  },
  Mars: {
    good: [3, 6, 11],
    bad: [1, 2, 4, 5, 7, 8, 9, 12],
    neutral: [10],
  },
  Mercury: {
    good: [2, 4, 6, 8, 10, 11],
    bad: [1, 3, 5, 7, 9, 12],
    neutral: [],
  },
  Jupiter: {
    good: [2, 5, 7, 9, 11],
    bad: [1, 3, 6, 8, 10, 12],
    neutral: [4],
  },
  Venus: {
    good: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    bad: [6, 7, 10],
    neutral: [],
  },
  Saturn: {
    good: [3, 6, 11],
    bad: [1, 2, 4, 5, 7, 8, 9, 10, 12],
    neutral: [],
  },
  Rahu: {
    good: [3, 6, 10, 11],
    bad: [1, 2, 4, 5, 7, 8, 9, 12],
    neutral: [],
  },
  Ketu: {
    good: [3, 6, 11],
    bad: [1, 2, 4, 5, 7, 8, 9, 10, 12],
    neutral: [],
  },
};

const TRANSIT_DESCRIPTIONS = {
  Sun:     { good: 'Recognition and vitality', bad: 'Health strain or ego conflicts', neutral: 'Steady energy' },
  Moon:    { good: 'Emotional peace and comfort', bad: 'Mood fluctuations', neutral: 'Normal emotional state' },
  Mars:    { good: 'Courage and victory over obstacles', bad: 'Conflicts, accidents, or anger', neutral: 'Balanced energy' },
  Mercury: { good: 'Business gains and communication', bad: 'Miscommunication or nervous tension', neutral: 'Normal thinking' },
  Jupiter: { good: 'Expansion, wisdom, and good fortune', bad: 'Overconfidence or missed opportunities', neutral: 'Stable growth' },
  Venus:   { good: 'Love, luxury, and harmony', bad: 'Relationship stress or excess', neutral: 'Normal pleasures' },
  Saturn:  { good: 'Discipline leads to rewards', bad: 'Delays, hard lessons, or restrictions', neutral: 'Steady responsibilities' },
  Rahu:    { good: 'Ambitious growth and innovation', bad: 'Confusion, obsession, or deception', neutral: 'Unusual experiences' },
  Ketu:    { good: 'Spiritual insight and liberation', bad: 'Detachment, loss, or isolation', neutral: 'Introspection' },
};

/**
 * Analyze transits relative to birth Moon sign.
 * @param {number} moonRashiIndex - Birth Moon's rashi index (0-11)
 * @returns {Array} Transit analysis for each planet
 */
export function analyzeTransits(moonRashiIndex) {
  const transits = getCurrentTransits();
  const analysis = [];

  for (const planet of PLANETS) {
    const transit = transits[planet.id];
    if (!transit) continue;

    const transitRashiIndex = transit.rashi.id;
    const houseFromMoon = ((transitRashiIndex - moonRashiIndex + 12) % 12) + 1;

    const effects = TRANSIT_EFFECTS[planet.id];
    let nature = 'neutral';
    if (effects.good.includes(houseFromMoon)) nature = 'good';
    else if (effects.bad.includes(houseFromMoon)) nature = 'bad';

    const desc = TRANSIT_DESCRIPTIONS[planet.id];

    analysis.push({
      planet: planet,
      transitSign: transit.rashi,
      transitNakshatra: transit.nakshatra,
      houseFromMoon,
      isRetrograde: transit.isRetrograde,
      nature,
      effect: desc[nature],
    });
  }

  return analysis;
}

/**
 * Get major upcoming transit events (slow planets changing signs).
 */
export function getUpcomingTransitEvents() {
  const transits = getCurrentTransits();
  const events = [];

  // For slow planets, estimate when they'll change signs
  const slowPlanets = ['Jupiter', 'Saturn', 'Rahu', 'Ketu'];

  for (const id of slowPlanets) {
    const transit = transits[id];
    if (!transit) continue;
    const degreeInSign = transit.rashi.degreeInSign;
    const remainingDegrees = 30 - degreeInSign;

    // Approximate daily motion
    const dailyMotion = {
      Jupiter: 0.083,  // ~12 years per cycle
      Saturn: 0.033,   // ~29.5 years per cycle
      Rahu: -0.053,    // ~18 years per cycle, retrograde
      Ketu: -0.053,
    };

    const motion = Math.abs(dailyMotion[id]);
    const daysRemaining = Math.round(remainingDegrees / motion);
    const changeDate = new Date();
    changeDate.setDate(changeDate.getDate() + daysRemaining);

    const nextSign = id === 'Rahu' || id === 'Ketu'
      ? RASHIS[(transit.rashi.id + 11) % 12] // Nodes move backward
      : RASHIS[(transit.rashi.id + 1) % 12];

    events.push({
      planet: id,
      currentSign: transit.rashi.name,
      nextSign: nextSign.name,
      approximateDate: changeDate,
      daysRemaining,
    });
  }

  return events.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
