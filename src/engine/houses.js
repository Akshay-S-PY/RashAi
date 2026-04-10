// ============================================================
// RashAi, House (Bhava) Calculator
// Equal house system based on Lagna (standard in Vedic astrology)
// ============================================================

import { RASHIS, PLANETS } from './constants.js';

/**
 * Calculate house cusps using Equal House system.
 * In Vedic astrology, each house spans exactly one rashi (30°).
 * House 1 starts at the Lagna sign.
 */
export function calculateHouses(positions) {
  const lagnaRashi = positions.Ascendant.rashi;
  const houses = [];

  for (let i = 0; i < 12; i++) {
    const rashiIndex = (lagnaRashi + i) % 12;
    const startDegree = rashiIndex * 30;
    const endDegree = startDegree + 30;

    houses.push({
      number: i + 1,
      rashi: RASHIS[rashiIndex],
      rashiIndex: rashiIndex,
      startDegree,
      endDegree,
      lord: RASHIS[rashiIndex].lord,
      planets: [],
    });
  }

  return houses;
}

/**
 * Place planets in houses based on their sidereal longitudes.
 * Returns houses with planets assigned.
 */
export function placePlanetsInHouses(positions) {
  const houses = calculateHouses(positions);
  const lagnaRashi = positions.Ascendant.rashi;

  // Place each planet
  for (const planet of PLANETS) {
    const pos = positions[planet.id];
    if (!pos) continue;

    const planetRashi = pos.rashi;
    // House number = (planet's rashi - lagna rashi + 12) % 12 + 1
    const houseNum = ((planetRashi - lagnaRashi + 12) % 12);

    houses[houseNum].planets.push({
      ...planet,
      longitude: pos.longitude,
      degree: pos.degree,
      isRetrograde: pos.isRetrograde || false,
    });

    // Store house number back on position
    pos.house = houseNum + 1;
  }

  return houses;
}

/**
 * Get the lord of each house
 */
export function getHouseLords(houses) {
  return houses.map(house => ({
    house: house.number,
    lord: house.lord,
    rashi: house.rashi.name,
  }));
}

/**
 * Determine planetary aspects (Vedic aspects / Drishti)
 * In Vedic astrology:
 * - All planets aspect the 7th house from them
 * - Mars also aspects 4th and 8th
 * - Jupiter also aspects 5th and 9th
 * - Saturn also aspects 3rd and 10th
 * - Rahu/Ketu aspect 5th, 7th, 9th
 */
export function calculateAspects(houses) {
  const aspects = [];

  for (const house of houses) {
    for (const planet of house.planets) {
      const fromHouse = house.number;

      // All planets aspect 7th from them
      const aspectHouses = [((fromHouse - 1 + 6) % 12) + 1];

      // Special aspects
      if (planet.id === 'Mars') {
        aspectHouses.push(((fromHouse - 1 + 3) % 12) + 1); // 4th
        aspectHouses.push(((fromHouse - 1 + 7) % 12) + 1); // 8th
      } else if (planet.id === 'Jupiter') {
        aspectHouses.push(((fromHouse - 1 + 4) % 12) + 1); // 5th
        aspectHouses.push(((fromHouse - 1 + 8) % 12) + 1); // 9th
      } else if (planet.id === 'Saturn') {
        aspectHouses.push(((fromHouse - 1 + 2) % 12) + 1); // 3rd
        aspectHouses.push(((fromHouse - 1 + 9) % 12) + 1); // 10th
      } else if (planet.id === 'Rahu' || planet.id === 'Ketu') {
        aspectHouses.push(((fromHouse - 1 + 4) % 12) + 1); // 5th
        aspectHouses.push(((fromHouse - 1 + 8) % 12) + 1); // 9th
      }

      for (const targetHouse of aspectHouses) {
        aspects.push({
          planet: planet,
          fromHouse,
          toHouse: targetHouse,
          type: targetHouse === ((fromHouse - 1 + 6) % 12) + 1 ? 'full' : 'special',
        });
      }
    }
  }

  return aspects;
}

/**
 * Generate a complete chart data structure
 */
export function generateChart(chartData) {
  const { positions } = chartData;
  const houses = placePlanetsInHouses(positions);
  const aspects = calculateAspects(houses);
  const houseLords = getHouseLords(houses);

  return {
    ...chartData,
    houses,
    aspects,
    houseLords,
    lagnaRashi: positions.Ascendant.rashi,
    lagnaLord: RASHIS[positions.Ascendant.rashi].lord,
  };
}
