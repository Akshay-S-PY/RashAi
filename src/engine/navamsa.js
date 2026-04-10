// ============================================================
// RashAi, Navamsa (D9) Divisional Chart Calculator
// Each sign divided into 9 parts of 3°20' each
// ============================================================

import { RASHIS } from './constants.js';

// Starting sign for Navamsa based on element of natal sign
const NAVAMSA_START = {
  Fire:  0,  // Aries
  Earth: 9,  // Capricorn
  Air:   6,  // Libra
  Water: 3,  // Cancer
};

/**
 * Calculate the Navamsa (D9) sign for a given sidereal longitude.
 * @param {number} longitude - Sidereal longitude (0-360)
 * @returns {object} { rashiIndex, rashi, navamsaNum, degree }
 */
export function getNavamsaSign(longitude) {
  const lon = ((longitude % 360) + 360) % 360;
  const rashiIndex = Math.floor(lon / 30);
  const degreeInSign = lon % 30;
  const navamsaNum = Math.floor(degreeInSign / (30 / 9)); // 0-8

  const element = RASHIS[rashiIndex].element;
  const startSign = NAVAMSA_START[element];
  const navamsaRashi = (startSign + navamsaNum) % 12;

  return {
    rashiIndex: navamsaRashi,
    rashi: RASHIS[navamsaRashi],
    navamsaNum: navamsaNum + 1,
    degree: (degreeInSign % (30 / 9)) * 9, // degree within navamsa sign
  };
}

/**
 * Generate full Navamsa chart data from planetary positions.
 * @param {object} positions - Planet positions from calculatePlanetaryPositions
 * @returns {object} { navamsaPositions, houses }
 */
export function calculateNavamsaChart(positions) {
  const navamsaPositions = {};

  const planetIds = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Ascendant'];

  for (const id of planetIds) {
    const pos = positions[id];
    if (!pos) continue;
    const navamsa = getNavamsaSign(pos.longitude);
    navamsaPositions[id] = {
      ...navamsa,
      isRetrograde: pos.isRetrograde || false,
      natalRashi: pos.rashi,
    };
  }

  // Build Navamsa houses (equal house from Navamsa lagna)
  const navLagnaRashi = navamsaPositions.Ascendant?.rashiIndex ?? 0;
  const houses = [];

  for (let i = 0; i < 12; i++) {
    const rashiIndex = (navLagnaRashi + i) % 12;
    houses.push({
      number: i + 1,
      rashi: RASHIS[rashiIndex],
      rashiIndex,
      planets: [],
    });
  }

  // Place planets in Navamsa houses
  for (const id of planetIds) {
    if (id === 'Ascendant') continue;
    const nav = navamsaPositions[id];
    if (!nav) continue;
    const houseIndex = ((nav.rashiIndex - navLagnaRashi + 12) % 12);
    houses[houseIndex].planets.push({
      id,
      ...nav,
    });
    nav.house = houseIndex + 1;
  }

  return { navamsaPositions, houses, lagnaRashi: navLagnaRashi };
}

/**
 * Analyze Navamsa chart for Vargottama planets.
 * A planet is Vargottama when it occupies the same sign in both Rashi and Navamsa.
 */
export function findVargottamaPlanets(positions) {
  const vargottama = [];
  const planetIds = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  for (const id of planetIds) {
    const pos = positions[id];
    if (!pos) continue;
    const navamsa = getNavamsaSign(pos.longitude);
    if (navamsa.rashiIndex === pos.rashi) {
      vargottama.push({
        planet: id,
        sign: RASHIS[pos.rashi].name,
        significance: `${id} is Vargottama in ${RASHIS[pos.rashi].name}, giving extra strength and auspiciousness`,
      });
    }
  }

  return vargottama;
}

/**
 * Analyze Navamsa for marriage/relationship indicators.
 */
export function analyzeNavamsaForRelationships(positions) {
  const nav = calculateNavamsaChart(positions);
  const insights = [];

  // Check 7th lord in Navamsa
  const seventhRashi = (nav.lagnaRashi + 6) % 12;
  const seventhLord = RASHIS[seventhRashi].lord;
  const lordNav = nav.navamsaPositions[seventhLord];
  if (lordNav) {
    insights.push({
      title: 'Navamsa 7th Lord',
      text: `7th lord ${seventhLord} is in ${lordNav.rashi.name} in Navamsa (House ${lordNav.house || '—'}).`,
    });
  }

  // Venus in Navamsa
  const venusNav = nav.navamsaPositions.Venus;
  if (venusNav) {
    const quality = venusNav.rashiIndex === 1 || venusNav.rashiIndex === 6 ? 'own sign' :
                    venusNav.rashiIndex === 11 ? 'exalted' :
                    venusNav.rashiIndex === 5 ? 'debilitated' : 'neutral';
    insights.push({
      title: 'Venus in Navamsa',
      text: `Venus is in ${venusNav.rashi.name} (${quality}) in Navamsa, indicating quality of marital life.`,
    });
  }

  // Jupiter in Navamsa (for female charts)
  const jupiterNav = nav.navamsaPositions.Jupiter;
  if (jupiterNav) {
    insights.push({
      title: 'Jupiter in Navamsa',
      text: `Jupiter is in ${jupiterNav.rashi.name} in Navamsa, karaka for husband and wisdom.`,
    });
  }

  return { chart: nav, insights };
}
