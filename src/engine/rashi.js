// ============================================================
// RashAi, Rashi & Nakshatra Finder
// ============================================================

import { RASHIS, NAKSHATRAS, PLANETS } from './constants.js';

/**
 * Get Rashi details from sidereal longitude
 */
export function getRashi(longitude) {
  const rashiIndex = Math.floor(((longitude % 360) + 360) % 360 / 30);
  const degreeInRashi = ((longitude % 360) + 360) % 360 % 30;

  return {
    ...RASHIS[rashiIndex],
    degreeInSign: degreeInRashi,
    totalDegree: longitude,
  };
}

/**
 * Get Nakshatra details from sidereal longitude
 */
export function getNakshatra(longitude) {
  const totalDeg = ((longitude % 360) + 360) % 360;
  const nakshatraSpan = 360 / 27; // 13.3333°
  const padaSpan = nakshatraSpan / 4; // 3.3333°

  const nakshatraIndex = Math.floor(totalDeg / nakshatraSpan);
  const degreeInNakshatra = totalDeg % nakshatraSpan;
  const padaIndex = Math.floor(degreeInNakshatra / padaSpan);

  const nakshatra = NAKSHATRAS[nakshatraIndex];

  return {
    ...nakshatra,
    pada: padaIndex + 1,
    degreeInNakshatra,
    syllable: nakshatra.syllables[padaIndex],
  };
}

/**
 * Get the Moon sign (Rashi based on Moon's position)
 */
export function getMoonSign(positions) {
  const moonLon = positions.Moon.longitude;
  return getRashi(moonLon);
}

/**
 * Get the Sun sign (Rashi based on Sun's position)
 */
export function getSunSign(positions) {
  const sunLon = positions.Sun.longitude;
  return getRashi(sunLon);
}

/**
 * Get the Lagna (Ascendant) sign
 */
export function getLagna(positions) {
  const ascLon = positions.Ascendant.longitude;
  return getRashi(ascLon);
}

/**
 * Get the birth Nakshatra (based on Moon's position)
 */
export function getBirthNakshatra(positions) {
  const moonLon = positions.Moon.longitude;
  return getNakshatra(moonLon);
}

/**
 * Generate a comprehensive Rashi/Nakshatra report for all planets
 */
export function generatePlanetaryReport(chartData) {
  const { positions } = chartData;
  const report = {};

  // Get rashi and nakshatra for each planet
  for (const planet of PLANETS) {
    const pos = positions[planet.id];
    if (!pos) continue;

    report[planet.id] = {
      planet: planet,
      rashi: getRashi(pos.longitude),
      nakshatra: getNakshatra(pos.longitude),
      longitude: pos.longitude,
      degree: pos.degree,
      isRetrograde: pos.isRetrograde || false,
      house: pos.house || null,
    };
  }

  // Ascendant
  report.Ascendant = {
    planet: { id: 'Ascendant', name: 'Ascendant', hindi: 'लग्न', symbol: 'Asc', abbr: 'Asc' },
    rashi: getRashi(positions.Ascendant.longitude),
    nakshatra: getNakshatra(positions.Ascendant.longitude),
    longitude: positions.Ascendant.longitude,
    degree: positions.Ascendant.degree,
  };

  return report;
}
