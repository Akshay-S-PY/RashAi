// ============================================================
// RashAi, Planetary Position Calculator
// Uses astronomy-engine for precise ephemeris + Lahiri ayanamsa
// ============================================================

import * as Astronomy from 'astronomy-engine';

/**
 * Calculate Lahiri Ayanamsa for a given date.
 * Lahiri ayanamsa is the standard for Vedic astrology in India.
 * Based on the precession of equinoxes.
 * Reference: Ayanamsa on 1 Jan 2000 = 23°51'11" (23.8531°)
 */
export function getLahiriAyanamsa(date) {
  // Julian centuries from J2000.0
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0;

  // Lahiri ayanamsa calculation (Chitrapaksha)
  // Based on the position of Spica (Chitra) star
  const ayanamsa = 23.8531 + (0.0111 * (date.getFullYear() - 2000));

  return ayanamsa;
}

/**
 * Convert a Date to Julian Date
 */
function getJulianDate(date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24
    + date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400;

  let yr = y, mo = m;
  if (mo <= 2) { yr -= 1; mo += 12; }

  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);

  return Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + B - 1524.5;
}

/**
 * Get tropical longitude of a planet using astronomy-engine
 * @param {string} body - Planet name
 * @param {AstroTime} astroTime - Time object
 * @param {Observer} observer - Observer location
 */
function getTropicalLongitude(body, astroTime, observer) {
  try {
    const equ = Astronomy.Equator(body, astroTime, observer, true, true);
    const ecl = Astronomy.Ecliptic(equ.vec);
    let lon = ecl.elon;
    if (lon < 0) lon += 360;
    return lon;
  } catch (e) {
    console.warn(`Could not calculate position for ${body}:`, e);
    return 0;
  }
}

/**
 * Calculate the Ascendant (Lagna) for a given date/time/location.
 * Uses the Local Sidereal Time approach.
 */
export function calculateAscendant(date, lat, lng) {
  // Calculate Local Sidereal Time
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0;

  // Greenwich Mean Sidereal Time (in degrees)
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T - (T * T * T) / 38710000.0;
  gmst = ((gmst % 360) + 360) % 360;

  // Local Sidereal Time
  const lst = ((gmst + lng) % 360 + 360) % 360;

  // Obliquity of ecliptic
  const eps = 23.4393 - 0.0130 * T;
  const epsRad = eps * Math.PI / 180;
  const lstRad = lst * Math.PI / 180;
  const latRad = lat * Math.PI / 180;

  // Ascendant calculation
  let ascRad = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(lstRad))
  );

  let asc = (ascRad * 180 / Math.PI + 360) % 360;

  return asc;
}

/**
 * Calculate the Moon's True Node (Rahu) position
 */
function getMoonNodeLongitude(astroTime) {
  const jd = getJulianDate(astroTime.date);
  const T = (jd - 2451545.0) / 36525.0;

  // Mean longitude of ascending node (Rahu)
  let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000;
  omega = ((omega % 360) + 360) % 360;

  return omega;
}

/**
 * Calculate all planetary positions for a given birth time and location.
 * Returns sidereal (Vedic) longitudes after applying Lahiri ayanamsa.
 *
 * @param {Date} date - Birth date/time in UTC
 * @param {number} lat - Latitude of birth place
 * @param {number} lng - Longitude of birth place
 * @returns {Object} Planetary positions with sidereal longitudes
 */
export function calculatePlanetaryPositions(date, lat, lng) {
  const astroTime = Astronomy.MakeTime(date);
  const observer = new Astronomy.Observer(lat, lng, 0);
  const ayanamsa = getLahiriAyanamsa(date);

  // Map of astronomy-engine body names
  const bodies = {
    Sun: 'Sun',
    Moon: 'Moon',
    Mars: 'Mars',
    Mercury: 'Mercury',
    Jupiter: 'Jupiter',
    Venus: 'Venus',
    Saturn: 'Saturn',
  };

  const positions = {};

  // Calculate each planet's tropical position and convert to sidereal
  for (const [planetName, bodyName] of Object.entries(bodies)) {
    const tropicalLon = getTropicalLongitude(bodyName, astroTime, observer);
    let siderealLon = (tropicalLon - ayanamsa + 360) % 360;

    positions[planetName] = {
      longitude: siderealLon,
      rashi: Math.floor(siderealLon / 30),
      degree: siderealLon % 30,
      nakshatra: Math.floor(siderealLon / (360 / 27)),
      nakshatraPada: Math.floor((siderealLon % (360 / 27)) / (360 / 108)) + 1,
      isRetrograde: false,
    };
  }

  // Check retrograde status for applicable planets
  for (const planet of ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) {
    try {
      // A planet is retrograde when its ecliptic longitude is decreasing
      // We approximate by checking positions slightly apart
      const timeBefore = Astronomy.MakeTime(new Date(date.getTime() - 86400000));
      const lonBefore = getTropicalLongitude(planet, timeBefore, observer);
      const lonNow = getTropicalLongitude(planet, astroTime, observer);

      // Handle wrap-around at 0/360
      let diff = lonNow - lonBefore;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      positions[planet].isRetrograde = diff < 0;
    } catch (e) {
      // Default to non-retrograde
    }
  }

  // Rahu (Mean North Node of Moon)
  const rahuTropical = getMoonNodeLongitude(astroTime);
  const rahuSidereal = (rahuTropical - ayanamsa + 360) % 360;
  positions.Rahu = {
    longitude: rahuSidereal,
    rashi: Math.floor(rahuSidereal / 30),
    degree: rahuSidereal % 30,
    nakshatra: Math.floor(rahuSidereal / (360 / 27)),
    nakshatraPada: Math.floor((rahuSidereal % (360 / 27)) / (360 / 108)) + 1,
    isRetrograde: true, // Rahu is always retrograde
  };

  // Ketu (always 180° from Rahu)
  const ketuSidereal = (rahuSidereal + 180) % 360;
  positions.Ketu = {
    longitude: ketuSidereal,
    rashi: Math.floor(ketuSidereal / 30),
    degree: ketuSidereal % 30,
    nakshatra: Math.floor(ketuSidereal / (360 / 27)),
    nakshatraPada: Math.floor((ketuSidereal % (360 / 27)) / (360 / 108)) + 1,
    isRetrograde: true, // Ketu is always retrograde
  };

  // Calculate Ascendant (Lagna)
  const tropicalAsc = calculateAscendant(date, lat, lng);
  const siderealAsc = (tropicalAsc - ayanamsa + 360) % 360;
  positions.Ascendant = {
    longitude: siderealAsc,
    rashi: Math.floor(siderealAsc / 30),
    degree: siderealAsc % 30,
    nakshatra: Math.floor(siderealAsc / (360 / 27)),
    nakshatraPada: Math.floor((siderealAsc % (360 / 27)) / (360 / 108)) + 1,
  };

  return {
    positions,
    ayanamsa,
    birthTime: date,
    latitude: lat,
    longitude: lng,
  };
}
