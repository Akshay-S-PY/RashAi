// ============================================================
// RashAi, Varshaphal (Yearly Predictions / Solar Return)
// Chart calculated when Sun returns to exact birth longitude
// ============================================================

import { calculatePlanetaryPositions } from './planets.js';
import { generateChart } from './houses.js';
import { generatePlanetaryReport, getMoonSign, getLagna, getRashi, getNakshatra } from './rashi.js';
import { RASHIS, PLANETS } from './constants.js';

/**
 * Find the exact date when the Sun returns to its birth longitude.
 * @param {number} birthSunLongitude - Sun's sidereal longitude at birth
 * @param {number} year - Year to calculate for
 * @param {number} lat - Birth latitude
 * @param {number} lng - Birth longitude
 * @returns {Date} Solar return date
 */
function findSolarReturn(birthSunLongitude, year, lat, lng) {
  // Start searching from the birthday month
  let searchDate = new Date(year, 3, 1); // Start from April (Sun is in Aries area)

  // Binary search for the exact return
  let low = new Date(year, 0, 1);
  let high = new Date(year, 11, 31);

  for (let i = 0; i < 30; i++) {
    const mid = new Date((low.getTime() + high.getTime()) / 2);
    const pos = calculatePlanetaryPositions(mid, lat, lng);
    const sunLon = pos.positions.Sun.longitude;

    let diff = sunLon - birthSunLongitude;
    // Normalize to -180 to 180
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < 0.001) break; // Close enough (~3.6 arc-seconds)

    if (diff > 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return new Date((low.getTime() + high.getTime()) / 2);
}

/**
 * Calculate Varshaphal (Solar Return) chart.
 * @param {object} birthData - { date, time, lat, lng, timezone }
 * @param {number} birthSunLongitude - Sun's sidereal longitude at birth
 * @param {number} year - Year to generate predictions for
 * @returns {object} Varshaphal data
 */
export function calculateVarshaphal(birthData, birthSunLongitude, year) {
  const lat = birthData.lat;
  const lng = birthData.lng;

  // Find solar return date
  const returnDate = findSolarReturn(birthSunLongitude, year, lat, lng);

  // Calculate full chart at solar return moment
  const chartData = calculatePlanetaryPositions(returnDate, lat, lng);
  const chart = generateChart(chartData);
  const report = generatePlanetaryReport(chartData);
  const moonSign = getMoonSign(chart.positions);
  const varshLagna = getLagna(chart.positions);

  // Muntha calculation: Muntha sign = (birth lagna + years elapsed) % 12
  const [birthYear] = birthData.date.split('-').map(Number);
  const yearsElapsed = year - birthYear;
  const birthLagnaRashi = Math.floor(
    calculatePlanetaryPositions(
      new Date(birthYear, 0, 15), lat, lng
    ).positions.Ascendant.longitude / 30
  );
  const munthaRashi = (birthLagnaRashi + yearsElapsed) % 12;

  // Year lord (Varshesh) — lord of the Varsha Lagna
  const varshesh = RASHIS[varshLagna.id].lord;

  // Analyze key aspects of the year
  const predictions = generateYearlyPredictions(chart, report, varshLagna, munthaRashi, varshesh);

  return {
    year,
    solarReturnDate: returnDate,
    varshLagna,
    moonSign,
    varshesh,
    munthaSign: RASHIS[munthaRashi],
    chart,
    report,
    predictions,
  };
}

/**
 * Generate predictions based on Varshaphal chart.
 */
function generateYearlyPredictions(chart, report, varshLagna, munthaRashi, varshesh) {
  const predictions = [];

  // Muntha position analysis
  const munthaHouse = ((munthaRashi - varshLagna.id + 12) % 12) + 1;
  const munthaGoodHouses = [1, 2, 3, 5, 9, 10, 11];
  const munthaEffect = munthaGoodHouses.includes(munthaHouse) ? 'favorable' : 'challenging';

  predictions.push({
    title: 'Muntha Position',
    hindi: 'मुंथा स्थिति',
    text: `Muntha is in ${RASHIS[munthaRashi].name} (${RASHIS[munthaRashi].hindi}), placed in the ${ordinal(munthaHouse)} house from Varsha Lagna. This is ${munthaEffect} for the year.`,
    nature: munthaEffect === 'favorable' ? 'good' : 'caution',
  });

  // Varshesh (Year Lord) analysis
  const varsheshData = report[varshesh];
  if (varsheshData) {
    const house = varsheshData.house || '—';
    predictions.push({
      title: 'Year Lord (Varshesh)',
      hindi: 'वर्षेश',
      text: `${varshesh} rules this year as Varshesh, placed in House ${house} in ${varsheshData.rashi.name}. The condition of ${varshesh} shapes the overall theme of the year.`,
      nature: 'neutral',
    });
  }

  // Check key houses
  const houseThemes = [
    { house: 1, theme: 'Health & Self', good: 'Strong vitality and personal growth', bad: 'Health concerns or identity challenges' },
    { house: 2, theme: 'Wealth & Family', good: 'Financial gains and family harmony', bad: 'Financial strain or family tensions' },
    { house: 5, theme: 'Children & Creativity', good: 'Creative success and happiness from children', bad: 'Challenges with children or speculation losses' },
    { house: 7, theme: 'Relationships', good: 'Harmony in partnerships and marriage', bad: 'Relationship stress or legal issues' },
    { house: 10, theme: 'Career', good: 'Professional success and recognition', bad: 'Career challenges or authority conflicts' },
  ];

  for (const ht of houseThemes) {
    const houseData = chart.houses[ht.house - 1];
    const hasBenefic = houseData.planets.some(p => ['Jupiter', 'Venus', 'Moon', 'Mercury'].includes(p.id));
    const hasMalefic = houseData.planets.some(p => ['Saturn', 'Mars', 'Rahu', 'Ketu'].includes(p.id));

    if (hasBenefic || hasMalefic) {
      predictions.push({
        title: ht.theme,
        hindi: '',
        text: hasBenefic ? ht.good : ht.bad,
        nature: hasBenefic ? 'good' : 'caution',
      });
    }
  }

  return predictions;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
