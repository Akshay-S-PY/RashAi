// ============================================================
// RashAi, Dosha Detection
// Mangal Dosha, Kaal Sarp Dosha, Pitra Dosha
// ============================================================

import { RASHIS } from './constants.js';

/**
 * Check Mangal Dosha (Mars Dosha / Kuja Dosha)
 * Mars in houses 1, 2, 4, 7, 8, 12 from Lagna, Moon, or Venus
 * causes Mangal Dosha. Various cancellation rules apply.
 */
export function checkMangalDosha(positions, houses) {
  const marsHouse = positions.Mars.house;
  const mangalDoshaHouses = [1, 2, 4, 7, 8, 12];

  const result = {
    isPresent: false,
    fromLagna: false,
    fromMoon: false,
    fromVenus: false,
    isCancelled: false,
    cancellationReasons: [],
    severity: 'None',
    description: '',
  };

  // Check from Lagna
  result.fromLagna = mangalDoshaHouses.includes(marsHouse);

  // Check from Moon sign
  const moonRashi = positions.Moon.rashi;
  const lagnaRashi = positions.Ascendant.rashi;
  const marsRashi = positions.Mars.rashi;

  const marsFromMoon = ((marsRashi - moonRashi + 12) % 12) + 1;
  result.fromMoon = mangalDoshaHouses.includes(marsFromMoon);

  // Check from Venus
  const venusRashi = positions.Venus.rashi;
  const marsFromVenus = ((marsRashi - venusRashi + 12) % 12) + 1;
  result.fromVenus = mangalDoshaHouses.includes(marsFromVenus);

  result.isPresent = result.fromLagna || result.fromMoon || result.fromVenus;

  // Check cancellation rules
  if (result.isPresent) {
    // Rule 1: Mars in own sign (Aries, Scorpio) or exalted (Capricorn)
    if ([0, 7, 9].includes(marsRashi)) {
      result.cancellationReasons.push('Mars is in own sign or exalted, dosha is weakened');
    }

    // Rule 2: Mars conjunct Jupiter or aspected by Jupiter
    const jupiterHouse = positions.Jupiter.house;
    if (marsHouse === jupiterHouse) {
      result.cancellationReasons.push('Mars is conjunct Jupiter, dosha is cancelled');
    }

    // Rule 3: Mars in 2nd house in Gemini or Virgo (Mercury signs)
    if (marsHouse === 2 && [2, 5].includes(marsRashi)) {
      result.cancellationReasons.push('Mars in 2nd house in Mercury sign, dosha is cancelled');
    }

    // Rule 4: Mars in 12th house in Taurus or Libra (Venus signs)
    if (marsHouse === 12 && [1, 6].includes(marsRashi)) {
      result.cancellationReasons.push('Mars in 12th house in Venus sign, dosha is cancelled');
    }

    // Rule 5: Mars in 7th house in Cancer or Capricorn
    if (marsHouse === 7 && [3, 9].includes(marsRashi)) {
      result.cancellationReasons.push('Mars in 7th house in Cancer/Capricorn, dosha is cancelled');
    }

    // Rule 6: Mars in 8th house in Sagittarius or Pisces (Jupiter signs)
    if (marsHouse === 8 && [8, 11].includes(marsRashi)) {
      result.cancellationReasons.push('Mars in 8th house in Jupiter sign, dosha is cancelled');
    }

    result.isCancelled = result.cancellationReasons.length > 0;

    // Determine severity
    const activeCount = [result.fromLagna, result.fromMoon, result.fromVenus].filter(Boolean).length;
    if (result.isCancelled) {
      result.severity = 'Mild (Cancelled)';
    } else if (activeCount >= 3) {
      result.severity = 'Severe';
    } else if (activeCount === 2) {
      result.severity = 'Moderate';
    } else {
      result.severity = 'Mild';
    }
  }

  result.description = generateMangalDescription(result);
  return result;
}

/**
 * Check Kaal Sarp Dosha
 * All 7 planets (Sun through Saturn) hemmed between Rahu and Ketu.
 * Various types based on axis of Rahu-Ketu in houses.
 */
export function checkKaalSarpDosha(positions) {
  const rahuLon = positions.Rahu.longitude;
  const ketuLon = positions.Ketu.longitude;

  const result = {
    isPresent: false,
    type: '',
    typeName: '',
    description: '',
    affectedPlanets: [],
    partialKaalSarp: false,
  };

  const planetsToCheck = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  // Check if all planets are between Rahu and Ketu
  let allBetween = true;
  let countBetween = 0;

  for (const planetName of planetsToCheck) {
    const planetLon = positions[planetName].longitude;
    const isBetween = isLongitudeBetween(planetLon, rahuLon, ketuLon);

    if (isBetween) {
      countBetween++;
      result.affectedPlanets.push(planetName);
    } else {
      allBetween = false;
    }
  }

  result.isPresent = allBetween;
  result.partialKaalSarp = !allBetween && countBetween >= 5;

  if (result.isPresent || result.partialKaalSarp) {
    // Determine type based on Rahu's house
    const rahuHouse = positions.Rahu.house;
    const kaalSarpTypes = {
      1: 'Anant',
      2: 'Kulik',
      3: 'Vasuki',
      4: 'Shankhpal',
      5: 'Padma',
      6: 'Mahapadma',
      7: 'Takshak',
      8: 'Karkotak',
      9: 'Shankhachur',
      10: 'Patak',
      11: 'Vishdhar',
      12: 'Sheshnag',
    };

    result.type = rahuHouse;
    result.typeName = kaalSarpTypes[rahuHouse] || 'Unknown';
  }

  result.description = generateKaalSarpDescription(result);
  return result;
}

/**
 * Check Pitra Dosha
 * Sun conjunct/aspected by Rahu or Saturn in 9th house,
 * or 9th lord afflicted by Rahu/Saturn.
 */
export function checkPitraDosha(positions, houses) {
  const result = {
    isPresent: false,
    causes: [],
    severity: 'None',
    description: '',
  };

  const sunHouse = positions.Sun.house;
  const rahuHouse = positions.Rahu.house;
  const saturnHouse = positions.Saturn.house;

  // Check 1: Sun in 9th house with Rahu
  if (sunHouse === 9 && rahuHouse === 9) {
    result.isPresent = true;
    result.causes.push('Sun conjunct Rahu in the 9th house');
  }

  // Check 2: Sun in 9th house with Saturn
  if (sunHouse === 9 && saturnHouse === 9) {
    result.isPresent = true;
    result.causes.push('Sun conjunct Saturn in the 9th house');
  }

  // Check 3: 9th lord with Rahu or Saturn
  const ninthHouseLord = houses[8].lord;
  const ninthLordPlanet = ninthHouseLord;
  if (positions[ninthLordPlanet]) {
    const ninthLordHouse = positions[ninthLordPlanet].house;

    if (ninthLordHouse === rahuHouse) {
      result.isPresent = true;
      result.causes.push(`9th lord (${ninthLordPlanet}) conjunct Rahu`);
    }

    if (ninthLordHouse === saturnHouse && ninthLordPlanet !== 'Saturn') {
      result.isPresent = true;
      result.causes.push(`9th lord (${ninthLordPlanet}) conjunct Saturn`);
    }
  }

  // Check 4: Rahu in 9th house
  if (rahuHouse === 9) {
    result.isPresent = true;
    result.causes.push('Rahu placed in the 9th house');
  }

  // Check 5: Sun-Rahu conjunction in any house
  if (sunHouse === rahuHouse) {
    result.isPresent = true;
    result.causes.push(`Sun-Rahu conjunction in house ${sunHouse}`);
  }

  if (result.isPresent) {
    result.severity = result.causes.length >= 3 ? 'Severe' : result.causes.length >= 2 ? 'Moderate' : 'Mild';
  }

  result.description = generatePitraDescription(result);
  return result;
}

/**
 * Check if a longitude is between two other longitudes on a circle
 */
function isLongitudeBetween(lon, start, end) {
  lon = ((lon % 360) + 360) % 360;
  start = ((start % 360) + 360) % 360;
  end = ((end % 360) + 360) % 360;

  if (start < end) {
    return lon >= start && lon <= end;
  } else {
    return lon >= start || lon <= end;
  }
}

function generateMangalDescription(result) {
  if (!result.isPresent) {
    return 'No Mangal Dosha detected in your chart. Mars is placed in a favorable position for marital happiness.';
  }

  let desc = `Mangal Dosha is present in your chart (${result.severity}).`;

  const sources = [];
  if (result.fromLagna) sources.push('Lagna');
  if (result.fromMoon) sources.push('Moon');
  if (result.fromVenus) sources.push('Venus');
  desc += ` Detected from: ${sources.join(', ')}.`;

  if (result.isCancelled) {
    desc += ` However, the dosha is weakened or cancelled: ${result.cancellationReasons.join('; ')}.`;
  }

  return desc;
}

function generateKaalSarpDescription(result) {
  if (!result.isPresent && !result.partialKaalSarp) {
    return 'No Kaal Sarp Dosha detected. Planets are freely placed across the Rahu-Ketu axis.';
  }

  if (result.partialKaalSarp) {
    return `Partial Kaal Sarp Yoga detected. ${result.affectedPlanets.length} out of 7 planets are hemmed between Rahu and Ketu. This creates a milder form of the dosha.`;
  }

  return `Kaal Sarp Dosha (${result.typeName} type) is present. All seven planets are hemmed between Rahu and Ketu, with Rahu in house ${result.type}. This is a significant yoga that can create intense life experiences and spiritual growth.`;
}

function generatePitraDescription(result) {
  if (!result.isPresent) {
    return 'No Pitra Dosha detected. The 9th house and its lord are well-placed, indicating good ancestral blessings.';
  }

  return `Pitra Dosha detected (${result.severity}). Causes: ${result.causes.join('; ')}. This dosha relates to ancestral karmic debts and may be addressed through traditional remedies like Pitra Tarpan.`;
}

/**
 * Run all dosha checks and return a combined report
 */
export function checkAllDoshas(chartData) {
  const { positions, houses } = chartData;

  return {
    mangalDosha: checkMangalDosha(positions, houses),
    kaalSarpDosha: checkKaalSarpDosha(positions),
    pitraDosha: checkPitraDosha(positions, houses),
  };
}
