// ============================================================
// RashAi, Shadbala (Six-fold Planetary Strength)
// Simplified but accurate Vedic planetary strength scoring
// ============================================================

import { RASHIS, PLANETS } from './constants.js';

// Exaltation degrees (precise)
const EXALTATION_DEG = {
  Sun: 10,      // 10° Aries
  Moon: 33,     // 3° Taurus
  Mars: 298,    // 28° Capricorn
  Mercury: 165, // 15° Virgo
  Jupiter: 95,  // 5° Cancer
  Venus: 357,   // 27° Pisces
  Saturn: 200,  // 20° Libra
};

// Dig Bala (directional strength) — planets strong in certain houses
// Jupiter/Mercury: 1st house, Sun/Mars: 10th house, Moon/Venus: 4th, Saturn: 7th
const DIG_BALA_HOUSE = {
  Sun: 10, Moon: 4, Mars: 10, Mercury: 1, Jupiter: 1, Venus: 4, Saturn: 7,
};

// Naisargika Bala (natural strength) — fixed values in virupas
const NAISARGIKA_BALA = {
  Sun: 60, Moon: 51.43, Mars: 17.14, Mercury: 25.71, Jupiter: 34.29, Venus: 42.86, Saturn: 8.57,
};

// Day/Night rulers for Kala Bala
const DAY_STRONG = ['Sun', 'Jupiter', 'Venus'];   // Strong during day
const NIGHT_STRONG = ['Moon', 'Mars', 'Saturn'];   // Strong during night
// Mercury is always strong (day and night)

/**
 * Calculate Shadbala for all planets.
 * @param {object} chartData - Full chart data from generateChart
 * @param {object} positions - Planetary positions
 * @returns {object} { planets, strongest, weakest }
 */
export function calculateShadbala(chartData, positions) {
  const results = {};
  const mainPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  for (const planetId of mainPlanets) {
    const pos = positions[planetId];
    if (!pos) continue;

    const sthana = calculateSthanaBala(planetId, pos);
    const dig = calculateDigBala(planetId, pos.house || 1);
    const kala = calculateKalaBala(planetId, chartData.birthTime);
    const chesta = calculateChestaBala(planetId, pos);
    const naisargika = NAISARGIKA_BALA[planetId];
    const drik = calculateDrikBala(planetId, chartData);

    const total = sthana.total + dig + kala + chesta + naisargika + drik;

    // Required minimum for strength (in virupas)
    const required = getRequiredStrength(planetId);
    const ratio = total / required;
    const isStrong = ratio >= 1.0;

    results[planetId] = {
      planet: PLANETS.find(p => p.id === planetId),
      sthana,
      dig,
      kala,
      chesta,
      naisargika,
      drik,
      total: Math.round(total * 100) / 100,
      required,
      ratio: Math.round(ratio * 100) / 100,
      isStrong,
      grade: ratio >= 1.5 ? 'Excellent' : ratio >= 1.0 ? 'Good' : ratio >= 0.7 ? 'Average' : 'Weak',
    };
  }

  // Find strongest and weakest
  const sorted = Object.entries(results).sort((a, b) => b[1].total - a[1].total);

  return {
    planets: results,
    strongest: sorted[0]?.[0],
    weakest: sorted[sorted.length - 1]?.[0],
    ranking: sorted.map(([id, data]) => ({ planet: id, total: data.total, grade: data.grade })),
  };
}

/**
 * 1. Sthana Bala (Positional Strength)
 * - Uchcha Bala (exaltation)
 * - Saptavargaja Bala (sign dignity)
 * - Ojhayugmarashi Bala (odd/even sign)
 */
function calculateSthanaBala(planetId, pos) {
  const lon = pos.longitude;
  const rashiIndex = pos.rashi;

  // Uchcha Bala: 60 virupas at exaltation, 0 at debilitation, linear between
  let uchchaBala = 0;
  if (EXALTATION_DEG[planetId] !== undefined) {
    const exaltDeg = EXALTATION_DEG[planetId];
    const debilDeg = (exaltDeg + 180) % 360;
    let diff = Math.abs(lon - exaltDeg);
    if (diff > 180) diff = 360 - diff;
    uchchaBala = (180 - diff) / 3; // 0-60 virupas
  }

  // Saptavargaja Bala (simplified): own sign=30, exalted=45, friendly=22.5, enemy=7.5
  let saptavargaja = 15; // neutral default
  const signLord = RASHIS[rashiIndex].lord;
  if (signLord === planetId) saptavargaja = 30;
  else if (rashiIndex === (EXALTATION_DEG[planetId] !== undefined ? Math.floor(EXALTATION_DEG[planetId] / 30) : -1)) saptavargaja = 45;
  else if (isFriendly(planetId, signLord)) saptavargaja = 22.5;
  else if (isEnemy(planetId, signLord)) saptavargaja = 7.5;

  // Ojhayugma Bala: Male planets strong in odd signs, female in even
  const isOddSign = rashiIndex % 2 === 0; // 0=Aries(odd), 1=Taurus(even)...
  const isMale = ['Sun', 'Mars', 'Jupiter'].includes(planetId);
  const isFemale = ['Moon', 'Venus'].includes(planetId);
  const ojhayugma = (isMale && isOddSign) || (isFemale && !isOddSign) ? 15 : 7.5;

  const total = uchchaBala + saptavargaja + ojhayugma;

  return {
    uchcha: Math.round(uchchaBala * 100) / 100,
    saptavargaja: Math.round(saptavargaja * 100) / 100,
    ojhayugma: Math.round(ojhayugma * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * 2. Dig Bala (Directional Strength)
 * Max 60 virupas when in the strongest house, 0 at opposite house.
 */
function calculateDigBala(planetId, house) {
  const strongHouse = DIG_BALA_HOUSE[planetId];
  if (!strongHouse) return 30; // Mercury neutral

  const distance = Math.abs(house - strongHouse);
  const effectiveDistance = Math.min(distance, 12 - distance);
  // Max at strongHouse (distance=0)=60, Min at opposite (distance=6)=0
  return Math.max(0, (6 - effectiveDistance) * 10);
}

/**
 * 3. Kala Bala (Temporal Strength)
 * Simplified: day/night, hora, weekday considerations.
 */
function calculateKalaBala(planetId, birthTime) {
  if (!birthTime) return 30;

  const hours = birthTime.getUTCHours();
  const isDaytime = hours >= 6 && hours < 18;

  let bala = 15; // base

  if (planetId === 'Mercury') {
    bala = 30; // Always strong
  } else if (isDaytime && DAY_STRONG.includes(planetId)) {
    bala = 45;
  } else if (!isDaytime && NIGHT_STRONG.includes(planetId)) {
    bala = 45;
  }

  // Hora lord bonus
  const horaLord = getHoraLord(birthTime);
  if (horaLord === planetId) bala += 15;

  return bala;
}

/**
 * 4. Chesta Bala (Motional Strength)
 * Retrograde planets get more strength (counterintuitive but traditional).
 */
function calculateChestaBala(planetId, pos) {
  if (planetId === 'Sun' || planetId === 'Moon') return 30; // Not applicable

  if (pos.isRetrograde) return 60; // Full strength when retrograde
  return 30; // Normal motion
}

/**
 * 6. Drik Bala (Aspectual Strength)
 * Based on benefic/malefic aspects received.
 */
function calculateDrikBala(planetId, chartData) {
  if (!chartData.aspects) return 15;

  const house = chartData.positions[planetId]?.house;
  if (!house) return 15;

  let bala = 15;
  for (const aspect of chartData.aspects) {
    if (aspect.toHouse === house && aspect.planet.id !== planetId) {
      const nature = aspect.planet.nature;
      if (nature === 'Benefic') bala += 7.5;
      else if (nature === 'Malefic') bala -= 5;
    }
  }

  return Math.max(0, Math.min(60, bala));
}

function getHoraLord(date) {
  const dayOfWeek = date.getUTCDay();
  const hour = date.getUTCHours();
  const horaSequence = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
  const dayStartPlanet = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const startIdx = horaSequence.indexOf(dayStartPlanet[dayOfWeek]);
  return horaSequence[(startIdx + hour) % 7];
}

function isFriendly(planet, lord) {
  const friends = {
    Sun: ['Moon', 'Mars', 'Jupiter'],
    Moon: ['Sun', 'Mercury'],
    Mars: ['Sun', 'Moon', 'Jupiter'],
    Mercury: ['Sun', 'Venus'],
    Jupiter: ['Sun', 'Moon', 'Mars'],
    Venus: ['Mercury', 'Saturn'],
    Saturn: ['Mercury', 'Venus'],
  };
  return friends[planet]?.includes(lord) || false;
}

function isEnemy(planet, lord) {
  const enemies = {
    Sun: ['Venus', 'Saturn'],
    Moon: [],
    Mars: ['Mercury'],
    Mercury: ['Moon'],
    Jupiter: ['Mercury', 'Venus'],
    Venus: ['Sun', 'Moon'],
    Saturn: ['Sun', 'Moon', 'Mars'],
  };
  return enemies[planet]?.includes(lord) || false;
}

function getRequiredStrength(planetId) {
  // Required Shadbala in virupas (traditional values)
  const required = {
    Sun: 390, Moon: 360, Mars: 300, Mercury: 420, Jupiter: 390, Venus: 330, Saturn: 300,
  };
  return required[planetId] || 350;
}
