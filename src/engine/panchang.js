// ============================================================
// RashAi, Panchang (Hindu Calendar) Calculator
// Tithi, Nakshatra, Yoga, Karana, Vara for any date
// ============================================================

import { calculatePlanetaryPositions } from './planets.js';
import { getNakshatra, getRashi } from './rashi.js';

// 30 Tithis across Shukla (waxing) and Krishna (waning) Paksha
const TITHIS = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

const TITHI_HINDI = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा',
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'अमावस्या',
];

// 27 Yogas
const YOGAS = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti',
];

const YOGA_HINDI = [
  'विष्कम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन',
  'अतिगण्ड', 'सुकर्मा', 'धृति', 'शूल', 'गण्ड',
  'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र',
  'सिद्धि', 'व्यतिपात', 'वरीयान', 'परिघ', 'शिव',
  'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म',
  'इन्द्र', 'वैधृति',
];

// 11 Karanas (repeated to fill 60 half-tithis)
const KARANAS = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja',
  'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna',
];

const KARANA_HINDI = [
  'बव', 'बालव', 'कौलव', 'तैतिल', 'गरज',
  'वणिज', 'विष्टि', 'शकुनि', 'चतुष्पद', 'नाग', 'किंस्तुघ्न',
];

// Day names
const VARA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const VARA_HINDI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
const VARA_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// Auspiciousness of Yogas
const YOGA_NATURE = {
  0: 'bad', 1: 'good', 2: 'good', 3: 'good', 4: 'good',
  5: 'bad', 6: 'good', 7: 'good', 8: 'bad', 9: 'bad',
  10: 'good', 11: 'good', 12: 'bad', 13: 'good', 14: 'mixed',
  15: 'good', 16: 'bad', 17: 'good', 18: 'bad', 19: 'good',
  20: 'good', 21: 'good', 22: 'good', 23: 'good', 24: 'good',
  25: 'good', 26: 'bad',
};

/**
 * Calculate Panchang for a given date.
 * @param {Date} date - The date to calculate for (local time)
 * @param {number} [lat=28.6139] - Latitude (default: Delhi)
 * @param {number} [lng=77.2090] - Longitude (default: Delhi)
 * @returns {object} Panchang data
 */
export function calculatePanchang(date, lat = 28.6139, lng = 77.2090) {
  const positions = calculatePlanetaryPositions(date, lat, lng);
  const sunLon = positions.positions.Sun.longitude;
  const moonLon = positions.positions.Moon.longitude;

  // Tithi: based on Moon-Sun elongation (each tithi = 12°)
  let elongation = ((moonLon - sunLon) + 360) % 360;
  const tithiIndex = Math.floor(elongation / 12);
  const tithiProgress = (elongation % 12) / 12; // 0-1 progress within tithi

  const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
  const pakshaHindi = tithiIndex < 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
  const tithiInPaksha = (tithiIndex % 15) + 1;

  // Nakshatra of Moon
  const moonNakshatra = getNakshatra(moonLon);
  const moonRashi = getRashi(moonLon);

  // Yoga: (Sun longitude + Moon longitude) / (360/27)
  const yogaLongitude = ((sunLon + moonLon) % 360 + 360) % 360;
  const yogaIndex = Math.floor(yogaLongitude / (360 / 27));

  // Karana: half-tithi, each karana = 6° of elongation
  const karanaIndex = Math.floor(elongation / 6);
  let karanaName, karanaHindi;
  if (karanaIndex === 0) {
    karanaName = 'Kimstughna'; karanaHindi = 'किंस्तुघ्न';
  } else if (karanaIndex >= 57) {
    const fixed = ['Shakuni', 'Chatushpada', 'Naga'];
    const fixedHindi = ['शकुनि', 'चतुष्पद', 'नाग'];
    const fi = karanaIndex - 57;
    karanaName = fixed[fi] || 'Naga'; karanaHindi = fixedHindi[fi] || 'नाग';
  } else {
    const cycleIndex = ((karanaIndex - 1) % 7);
    karanaName = KARANAS[cycleIndex]; karanaHindi = KARANA_HINDI[cycleIndex];
  }

  // Vara (day of week)
  const dayIndex = date.getDay();

  // Sun sign (Masa / solar month)
  const sunRashi = getRashi(sunLon);

  return {
    date: date,
    tithi: {
      index: tithiIndex,
      name: TITHIS[tithiIndex],
      hindi: TITHI_HINDI[tithiIndex],
      number: tithiInPaksha,
      paksha,
      pakshaHindi,
      progress: tithiProgress,
      isEkadashi: tithiInPaksha === 11,
      isPurnima: tithiIndex === 14,
      isAmavasya: tithiIndex === 29,
    },
    nakshatra: {
      ...moonNakshatra,
      moonSign: moonRashi.name,
      moonSignHindi: moonRashi.hindi,
    },
    yoga: {
      index: yogaIndex,
      name: YOGAS[yogaIndex],
      hindi: YOGA_HINDI[yogaIndex],
      nature: YOGA_NATURE[yogaIndex],
    },
    karana: {
      name: karanaName,
      hindi: karanaHindi,
      isBhadra: karanaName === 'Vishti',
    },
    vara: {
      name: VARA[dayIndex],
      hindi: VARA_HINDI[dayIndex],
      lord: VARA_LORDS[dayIndex],
    },
    sunSign: sunRashi,
    moonSign: moonRashi,
    sunrise: getApproxSunrise(date, lat),
    sunset: getApproxSunset(date, lat),
  };
}

/**
 * Calculate Panchang for a range of dates (weekly view).
 */
export function calculateWeeklyPanchang(startDate, lat, lng) {
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    week.push(calculatePanchang(d, lat, lng));
  }
  return week;
}

/**
 * Approximate sunrise for a given date and latitude.
 */
function getApproxSunrise(date, lat) {
  const dayOfYear = getDayOfYear(date);
  const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
  const latRad = lat * Math.PI / 180;
  const decRad = declination * Math.PI / 180;
  const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(decRad));
  const sunrise = 12 - (hourAngle * 180 / Math.PI) / 15;
  const hours = Math.floor(sunrise);
  const minutes = Math.round((sunrise - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function getApproxSunset(date, lat) {
  const dayOfYear = getDayOfYear(date);
  const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
  const latRad = lat * Math.PI / 180;
  const decRad = declination * Math.PI / 180;
  const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(decRad));
  const sunset = 12 + (hourAngle * 180 / Math.PI) / 15;
  const hours = Math.floor(sunset);
  const minutes = Math.round((sunset - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}
