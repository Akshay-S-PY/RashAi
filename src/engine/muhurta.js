// ============================================================
// RashAi, Muhurta (Auspicious Timing) Calculator
// Find good dates for marriage, travel, business, etc.
// ============================================================

import { calculatePanchang } from './panchang.js';

// Activity types and their auspiciousness rules
const ACTIVITIES = {
  marriage: {
    name: 'Marriage / Wedding',
    hindi: 'विवाह',
    icon: '♀♂',
    goodNakshatras: [2, 3, 6, 7, 10, 11, 12, 13, 20, 21, 25, 26],
    goodTithis: [1, 2, 3, 5, 6, 7, 10, 11, 12, 13],
    avoidDays: [2, 6], // Tuesday, Saturday
    avoidYogas: [0, 5, 8, 9, 12, 16, 18, 26],
  },
  housewarming: {
    name: 'Housewarming / Griha Pravesh',
    hindi: 'गृह प्रवेश',
    icon: '⌂',
    goodNakshatras: [2, 3, 6, 7, 11, 12, 13, 20, 21, 25, 26],
    goodTithis: [1, 2, 3, 5, 6, 7, 10, 11, 12, 13],
    avoidDays: [2, 6],
    avoidYogas: [0, 5, 8, 9, 12, 16, 18, 26],
  },
  travel: {
    name: 'Travel / Journey',
    hindi: 'यात्रा',
    icon: '→',
    goodNakshatras: [0, 2, 4, 6, 7, 10, 11, 13, 14, 20, 21, 25, 26],
    goodTithis: [1, 2, 3, 5, 6, 7, 10, 11, 12, 13],
    avoidDays: [2, 6],
    avoidYogas: [0, 5, 8, 9, 16, 26],
  },
  business: {
    name: 'Business Start / Investment',
    hindi: 'व्यापार',
    icon: '₹',
    goodNakshatras: [0, 2, 3, 6, 7, 10, 11, 13, 14, 20, 21, 25, 26],
    goodTithis: [1, 2, 3, 5, 6, 7, 10, 11, 12, 13],
    avoidDays: [6],
    avoidYogas: [0, 5, 8, 9, 16, 26],
  },
  education: {
    name: 'Education / Learning Start',
    hindi: 'विद्यारम्भ',
    icon: 'A',
    goodNakshatras: [0, 2, 4, 6, 7, 8, 10, 11, 12, 13, 14, 20, 21, 25, 26],
    goodTithis: [1, 2, 3, 5, 6, 7, 10, 11, 12, 13],
    avoidDays: [2, 6],
    avoidYogas: [0, 5, 8, 9, 16, 26],
  },
  naming: {
    name: 'Baby Naming Ceremony',
    hindi: 'नामकरण',
    icon: '☆',
    goodNakshatras: [0, 2, 3, 6, 7, 10, 11, 12, 13, 21, 25, 26],
    goodTithis: [1, 2, 3, 5, 6, 7, 10, 11, 12, 13],
    avoidDays: [2, 6],
    avoidYogas: [0, 5, 8, 9, 12, 16, 18, 26],
  },
  vehicle: {
    name: 'Vehicle Purchase',
    hindi: 'वाहन खरीद',
    icon: '◎',
    goodNakshatras: [0, 2, 3, 6, 7, 10, 11, 13, 20, 21, 25, 26],
    goodTithis: [1, 2, 3, 5, 6, 7, 10, 11, 12, 13],
    avoidDays: [2, 6],
    avoidYogas: [0, 5, 8, 9, 16, 26],
  },
  property: {
    name: 'Property Purchase',
    hindi: 'भूमि खरीद',
    icon: '▣',
    goodNakshatras: [2, 3, 6, 7, 11, 12, 13, 20, 21, 25, 26],
    goodTithis: [1, 2, 3, 5, 6, 7, 10, 11, 12, 13],
    avoidDays: [2, 6],
    avoidYogas: [0, 5, 8, 9, 12, 16, 18, 26],
  },
};

/**
 * Get list of available activity types.
 */
export function getActivityTypes() {
  return Object.entries(ACTIVITIES).map(([key, val]) => ({
    id: key,
    name: val.name,
    hindi: val.hindi,
    icon: val.icon,
  }));
}

/**
 * Find auspicious dates for a given activity within a date range.
 * @param {string} activityId - Activity type key
 * @param {Date} startDate - Range start
 * @param {number} days - Number of days to search (default 30)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Array} Array of { date, panchang, score, reasons }
 */
export function findMuhurta(activityId, startDate, days = 30, lat = 28.6139, lng = 77.2090) {
  const activity = ACTIVITIES[activityId];
  if (!activity) return [];

  const results = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Skip past dates
    if (date < new Date(new Date().toDateString())) continue;

    const panchang = calculatePanchang(date, lat, lng);
    const evaluation = evaluateMuhurta(panchang, activity);

    if (evaluation.score >= 3) {
      results.push({
        date,
        panchang,
        ...evaluation,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Evaluate a single date for muhurta suitability.
 */
function evaluateMuhurta(panchang, activity) {
  let score = 0;
  const good = [];
  const bad = [];

  // Check Nakshatra
  if (activity.goodNakshatras.includes(panchang.nakshatra.id)) {
    score += 2;
    good.push(`Auspicious Nakshatra: ${panchang.nakshatra.name}`);
  } else {
    bad.push(`Nakshatra ${panchang.nakshatra.name} not ideal`);
  }

  // Check Tithi (use tithi number within paksha)
  const tithiNum = panchang.tithi.number;
  if (activity.goodTithis.includes(tithiNum)) {
    score += 2;
    good.push(`Good Tithi: ${panchang.tithi.paksha} ${panchang.tithi.name}`);
  } else {
    bad.push(`Tithi ${panchang.tithi.name} less favorable`);
  }

  // Check day of week
  const dayIndex = panchang.date.getDay();
  if (activity.avoidDays.includes(dayIndex)) {
    score -= 2;
    bad.push(`${panchang.vara.name} to be avoided`);
  } else if ([1, 3, 4, 5].includes(dayIndex)) {
    score += 1;
    good.push(`${panchang.vara.name} is favorable`);
  }

  // Check Yoga
  if (activity.avoidYogas.includes(panchang.yoga.index)) {
    score -= 1;
    bad.push(`Yoga ${panchang.yoga.name} unfavorable`);
  } else if (panchang.yoga.nature === 'good') {
    score += 1;
    good.push(`Auspicious Yoga: ${panchang.yoga.name}`);
  }

  // Check Karana
  if (panchang.karana.isBhadra) {
    score -= 2;
    bad.push('Bhadra (Vishti) Karana, inauspicious');
  }

  // Special days
  if (panchang.tithi.isEkadashi) {
    score += 1;
    good.push('Ekadashi, spiritually auspicious');
  }
  if (panchang.tithi.isAmavasya) {
    score -= 2;
    bad.push('Amavasya, generally avoided for new beginnings');
  }

  const rating = score >= 5 ? 'Excellent' : score >= 3 ? 'Good' : score >= 1 ? 'Average' : 'Avoid';

  return { score, rating, good, bad };
}

/**
 * Get the list of activities.
 */
export { ACTIVITIES };
