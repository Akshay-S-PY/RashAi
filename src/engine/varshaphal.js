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

  const munthaDetails = {
    1: 'Muntha in the 1st house brings personal confidence, good health, and new beginnings. You may take charge of your direction this year with renewed energy.',
    2: 'Muntha in the 2nd house favors accumulation of wealth, family bonding, and improved speech or communication. Financial prospects look positive.',
    3: 'Muntha in the 3rd house boosts courage, initiative, and short travels. Siblings may play an important role. Good for learning new skills.',
    4: 'Muntha in the 4th house can cause domestic unrest, emotional turbulence, or property-related concerns. Focus on inner peace and family harmony.',
    5: 'Muntha in the 5th house is excellent for creativity, children, education, and romance. Speculative ventures may yield positive returns.',
    6: 'Muntha in the 6th house warns of health issues, debts, or conflicts. However, it also indicates victory over enemies and competition.',
    7: 'Muntha in the 7th house brings mixed results in partnerships and marriage. Business partnerships need careful attention. Travel is likely.',
    8: 'Muntha in the 8th house is the most challenging placement. It calls for caution regarding health, finances, and sudden changes. Practice patience and spiritual discipline.',
    9: 'Muntha in the 9th house is highly auspicious. It favors fortune, spiritual growth, pilgrimages, and support from mentors or father figures.',
    10: 'Muntha in the 10th house brings professional advancement, recognition, and authority. A strong year for career ambitions and public image.',
    11: 'Muntha in the 11th house is very favorable for gains, wish fulfilment, and social connections. Income from multiple sources is possible.',
    12: 'Muntha in the 12th house indicates expenses, losses, or foreign connections. It is a year for spiritual reflection and letting go of attachments.',
  };

  predictions.push({
    title: 'Muntha Position',
    hindi: 'मुंथा स्थिति',
    text: `Muntha is in ${RASHIS[munthaRashi].name} (${RASHIS[munthaRashi].hindi}), placed in the ${ordinal(munthaHouse)} house from Varsha Lagna. ${munthaDetails[munthaHouse] || `This placement is ${munthaEffect} for the year.`}`,
    nature: munthaEffect === 'favorable' ? 'good' : 'caution',
  });

  // Varshesh (Year Lord) analysis
  const varsheshData = report[varshesh];
  if (varsheshData) {
    const house = varsheshData.house || '—';
    const varsheshRetro = varsheshData.isRetrograde ? ' (retrograde, causing delays and re-evaluation)' : '';
    const varsheshNak = varsheshData.nakshatra?.name ? ` in ${varsheshData.nakshatra.name} nakshatra` : '';

    const varsheshHouseDesc = {
      1: 'placed in the 1st house, giving you strong personal drive and self-reliance this year',
      2: 'placed in the 2nd house, emphasizing financial matters and family values',
      3: 'placed in the 3rd house, encouraging bold decisions, communication, and short journeys',
      4: 'placed in the 4th house, drawing focus toward home, property, and emotional security',
      5: 'placed in the 5th house, highlighting creativity, children, and intellectual pursuits',
      6: 'placed in the 6th house, indicating a year of overcoming obstacles through effort and service',
      7: 'placed in the 7th house, making partnerships and relationships a central theme',
      8: 'placed in the 8th house, bringing transformation and the need to manage shared resources carefully',
      9: 'placed in the 9th house, favoring spiritual growth, higher learning, and long-distance connections',
      10: 'placed in the 10th house, promising strong career momentum and public recognition',
      11: 'placed in the 11th house, indicating gains, fulfilled desires, and expanding social networks',
      12: 'placed in the 12th house, suggesting a year of spiritual seeking, foreign connections, and managing expenses',
    };

    const houseDesc = varsheshHouseDesc[house] || `placed in House ${house}`;

    predictions.push({
      title: 'Year Lord (Varshesh)',
      hindi: 'वर्षेश',
      text: `${varshesh} rules this year as Varshesh, ${houseDesc} in ${varsheshData.rashi.name}${varsheshNak}${varsheshRetro}. The strength and dignity of ${varshesh} shapes the overall tone, direction, and opportunities available throughout the year.`,
      nature: 'neutral',
    });
  }

  // Check key houses with detailed explanations
  const houseThemes = [
    {
      house: 1, theme: 'Health & Self', hindi: 'स्वास्थ्य',
      good: (planets) => `${planets.join(', ')} in the 1st house boosts physical vitality, personal magnetism, and self-confidence. You are likely to feel energized and motivated to pursue personal goals. Good health and a positive self-image are indicated.`,
      bad: (planets) => `${planets.join(', ')} in the 1st house may bring health fluctuations, restlessness, or challenges to your sense of self. Take extra care of your physical well-being and avoid impulsive decisions. Regular routines and discipline will help.`,
      mixed: (b, m) => `The 1st house has both benefic (${b.join(', ')}) and malefic (${m.join(', ')}) influences. While personal energy and drive are strong, some health vigilance is needed. Balance ambition with self-care.`,
    },
    {
      house: 2, theme: 'Wealth & Family', hindi: 'धन और परिवार',
      good: (planets) => `${planets.join(', ')} in the 2nd house promises financial growth, good savings, and harmonious family life. Your speech and communication are likely to be persuasive and pleasant. A good year for accumulating resources.`,
      bad: (planets) => `${planets.join(', ')} in the 2nd house can indicate financial pressures, harsh speech, or family disagreements. Budget carefully and choose words wisely. Avoid risky investments.`,
      mixed: (b, m) => `The 2nd house shows mixed financial trends with ${b.join(', ')} bringing gains but ${m.join(', ')} creating occasional expenses. Family dynamics may fluctuate. Save during favorable periods.`,
    },
    {
      house: 4, theme: 'Home & Peace of Mind', hindi: 'गृह सुख',
      good: (planets) => `${planets.join(', ')} in the 4th house brings domestic happiness, emotional contentment, and possible property gains. Your home environment is likely to be peaceful and nurturing.`,
      bad: (planets) => `${planets.join(', ')} in the 4th house may disturb mental peace, create domestic tensions, or bring property-related concerns. Focus on creating a calm home environment and managing emotional stress.`,
      mixed: (b, m) => `The 4th house receives both supportive (${b.join(', ')}) and challenging (${m.join(', ')}) influences. While property matters may progress, emotional peace needs conscious effort.`,
    },
    {
      house: 5, theme: 'Children & Creativity', hindi: 'संतान और रचनात्मकता',
      good: (planets) => `${planets.join(', ')} in the 5th house is excellent for creative pursuits, children's well-being, romance, and intellectual achievements. Students may excel. Good for speculative gains if done wisely.`,
      bad: (planets) => `${planets.join(', ')} in the 5th house may bring concerns about children, creative blocks, or losses through speculation. Avoid gambling or risky ventures. Focus on structured learning.`,
      mixed: (b, m) => `The 5th house has both ${b.join(', ')} (creative boost) and ${m.join(', ')} (caution needed). Children and education bring joy but speculation should be avoided.`,
    },
    {
      house: 7, theme: 'Relationships & Partnerships', hindi: 'साझेदारी',
      good: (planets) => `${planets.join(', ')} in the 7th house favors harmony in marriage, successful business partnerships, and positive social interactions. A good year for deepening committed relationships.`,
      bad: (planets) => `${planets.join(', ')} in the 7th house may create friction in relationships, misunderstandings with partners, or legal complications. Practice patience and clear communication in partnerships.`,
      mixed: (b, m) => `The 7th house has ${b.join(', ')} supporting harmony alongside ${m.join(', ')} creating occasional disagreements. Relationships grow through honest dialogue.`,
    },
    {
      house: 9, theme: 'Fortune & Dharma', hindi: 'भाग्य',
      good: (planets) => `${planets.join(', ')} in the 9th house is highly auspicious, indicating divine blessings, fortune, spiritual inclination, and support from elders or mentors. Long-distance travel and higher learning are favored.`,
      bad: (planets) => `${planets.join(', ')} in the 9th house may weaken luck, create philosophical conflicts, or strain relationships with father or guru figures. Stay true to your principles and seek guidance.`,
      mixed: (b, m) => `The 9th house has ${b.join(', ')} bringing blessings alongside ${m.join(', ')} testing your faith. Fortune comes through perseverance and righteous action.`,
    },
    {
      house: 10, theme: 'Career & Profession', hindi: 'करियर',
      good: (planets) => `${planets.join(', ')} in the 10th house indicates strong professional growth, recognition from superiors, and public success. You may receive promotions, awards, or new responsibilities. An excellent year for career ambitions.`,
      bad: (planets) => `${planets.join(', ')} in the 10th house can bring career obstacles, conflicts with authority, or professional setbacks. Stay focused, avoid confrontations with superiors, and let your work speak for itself.`,
      mixed: (b, m) => `The 10th house has ${b.join(', ')} supporting career growth but ${m.join(', ')} bringing occasional hurdles. Success comes through persistence despite challenges.`,
    },
    {
      house: 11, theme: 'Gains & Social Circle', hindi: 'लाभ',
      good: (planets) => `${planets.join(', ')} in the 11th house is very favorable for income, fulfilment of desires, and expanding your social network. Multiple sources of gain are possible. Friends and elder siblings may be supportive.`,
      bad: (planets) => `${planets.join(', ')} in the 11th house may limit gains, cause issues with friends, or bring unfulfilled hopes. Network wisely and keep expectations realistic.`,
      mixed: (b, m) => `The 11th house has ${b.join(', ')} attracting gains alongside ${m.join(', ')} causing some delays. Overall a net positive for income if managed well.`,
    },
  ];

  for (const ht of houseThemes) {
    const houseData = chart.houses[ht.house - 1];
    const benefics = houseData.planets.filter(p => ['Jupiter', 'Venus', 'Moon', 'Mercury'].includes(p.id)).map(p => p.id);
    const malefics = houseData.planets.filter(p => ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'].includes(p.id)).map(p => p.id);

    if (benefics.length > 0 && malefics.length > 0) {
      predictions.push({
        title: ht.theme,
        hindi: ht.hindi,
        text: ht.mixed(benefics, malefics),
        nature: 'neutral',
      });
    } else if (benefics.length > 0) {
      predictions.push({
        title: ht.theme,
        hindi: ht.hindi,
        text: ht.good(benefics),
        nature: 'good',
      });
    } else if (malefics.length > 0) {
      predictions.push({
        title: ht.theme,
        hindi: ht.hindi,
        text: ht.bad(malefics),
        nature: 'caution',
      });
    }
  }

  // Retrograde planets in the year chart
  const retroPlanets = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].filter(p => report[p]?.isRetrograde);
  if (retroPlanets.length > 0) {
    const retroDescs = {
      Mars: 'Mars retrograde delays action and reignites past conflicts. Channel energy inward through exercise and patience.',
      Mercury: 'Mercury retrograde disrupts communication, travel, and paperwork. Double-check contracts and back up data.',
      Jupiter: 'Jupiter retrograde turns wisdom inward. Spiritual growth is favored over material expansion.',
      Venus: 'Venus retrograde re-examines relationships and values. Old connections may resurface for resolution.',
      Saturn: 'Saturn retrograde revisits past karmic lessons. Pending responsibilities demand attention.',
    };
    const retroText = retroPlanets.map(p => retroDescs[p]).join(' ');
    predictions.push({
      title: 'Retrograde Influences',
      hindi: 'वक्री ग्रह',
      text: `${retroPlanets.join(', ')} ${retroPlanets.length > 1 ? 'are' : 'is'} retrograde in your annual chart. ${retroText}`,
      nature: 'caution',
    });
  }

  return predictions;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
