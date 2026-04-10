// ============================================================
// RashAi, Sade Sati Calculator
// Saturn's 7.5-year transit over Moon sign
// ============================================================

import { RASHIS } from './constants.js';
import { getCurrentTransits } from './transit.js';

// Saturn's approximate sidereal period: ~29.46 years
// Each sign: ~2.5 years

const SADE_SATI_PHASES = {
  rising:  { name: 'Rising Phase', hindi: 'उदय चरण', description: 'Saturn transits 12th from Moon sign. Beginning of challenges: financial stress, health issues of elders, mental anxiety.' },
  peak:    { name: 'Peak Phase', hindi: 'शिखर चरण', description: 'Saturn transits over Moon sign. Most intense period: emotional turbulence, career changes, significant life events.' },
  setting: { name: 'Setting Phase', hindi: 'अस्त चरण', description: 'Saturn transits 2nd from Moon sign. Waning challenges: financial adjustments, speech-related issues, family concerns.' },
};

const REMEDIES = [
  { remedy: 'Chant Shani mantra: "Om Sham Shanaishcharaya Namah"', hindi: 'शनि मंत्र जाप: "ॐ शं शनैश्चराय नमः"', type: 'Mantra' },
  { remedy: 'Worship Lord Hanuman on Saturdays', hindi: 'शनिवार को हनुमान जी की पूजा', type: 'Worship' },
  { remedy: 'Donate black sesame seeds, mustard oil, or iron items on Saturdays', hindi: 'शनिवार को काले तिल, सरसों तेल या लोहा दान करें', type: 'Donation' },
  { remedy: 'Wear a Blue Sapphire (Neelam) after consultation', hindi: 'परामर्श के बाद नीलम रत्न धारण करें', type: 'Gemstone' },
  { remedy: 'Light a sesame oil lamp under a Peepal tree on Saturdays', hindi: 'शनिवार को पीपल के पेड़ के नीचे तिल के तेल का दीपक जलाएं', type: 'Ritual' },
  { remedy: 'Feed crows and black dogs on Saturdays', hindi: 'शनिवार को कौवे और काले कुत्तों को भोजन दें', type: 'Service' },
];

/**
 * Check if a person is currently in Sade Sati.
 * @param {number} moonRashiIndex - Birth Moon's rashi index (0-11)
 * @returns {object} Sade Sati status
 */
export function checkSadeSati(moonRashiIndex) {
  const transits = getCurrentTransits();
  const saturnTransit = transits.Saturn;
  if (!saturnTransit) {
    return { isActive: false, phase: null, message: 'Unable to determine Saturn position' };
  }

  const saturnRashi = saturnTransit.rashi.id;

  // Check 12th from Moon (Rising)
  const twelfthFromMoon = (moonRashiIndex + 11) % 12;
  // Moon sign itself (Peak)
  // 2nd from Moon (Setting)
  const secondFromMoon = (moonRashiIndex + 1) % 12;

  let phase = null;
  let isActive = false;

  if (saturnRashi === twelfthFromMoon) {
    phase = 'rising';
    isActive = true;
  } else if (saturnRashi === moonRashiIndex) {
    phase = 'peak';
    isActive = true;
  } else if (saturnRashi === secondFromMoon) {
    phase = 'setting';
    isActive = true;
  }

  // Calculate approximate timeline
  const timeline = calculateSadeSatiTimeline(moonRashiIndex, saturnTransit);

  return {
    isActive,
    phase,
    phaseInfo: phase ? SADE_SATI_PHASES[phase] : null,
    saturnSign: saturnTransit.rashi,
    moonSign: RASHIS[moonRashiIndex],
    saturnRetrograde: saturnTransit.isRetrograde,
    timeline,
    remedies: isActive ? REMEDIES : [],
    message: isActive
      ? `Sade Sati is active (${SADE_SATI_PHASES[phase].name}). Saturn is in ${saturnTransit.rashi.name}, ${phase === 'rising' ? '12th' : phase === 'peak' ? 'same as' : '2nd from'} your Moon sign ${RASHIS[moonRashiIndex].name}.`
      : `Sade Sati is not currently active. Saturn is in ${saturnTransit.rashi.name}, which is not adjacent to your Moon sign ${RASHIS[moonRashiIndex].name}.`,
  };
}

/**
 * Calculate approximate Sade Sati timeline.
 */
function calculateSadeSatiTimeline(moonRashiIndex, saturnTransit) {
  const saturnRashi = saturnTransit.rashi.id;
  const saturnDegree = saturnTransit.rashi.degreeInSign;

  // Saturn spends ~2.5 years per sign
  const YEARS_PER_SIGN = 2.458;
  const now = new Date();

  // Calculate distance from 12th-from-Moon sign
  const risingSign = (moonRashiIndex + 11) % 12;
  const settingSign = (moonRashiIndex + 1) % 12;

  const phases = [];

  // How many signs Saturn needs to travel to reach each phase
  for (const [phaseKey, targetRashi] of [['rising', risingSign], ['peak', moonRashiIndex], ['setting', settingSign]]) {
    const signsAway = ((targetRashi - saturnRashi + 12) % 12);
    const yearsAway = signsAway * YEARS_PER_SIGN - (saturnDegree / 30) * YEARS_PER_SIGN;

    const startDate = new Date(now);
    startDate.setFullYear(startDate.getFullYear() + Math.max(0, yearsAway));

    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + Math.round(YEARS_PER_SIGN));

    phases.push({
      phase: phaseKey,
      ...SADE_SATI_PHASES[phaseKey],
      sign: RASHIS[targetRashi].name,
      signHindi: RASHIS[targetRashi].hindi,
      approximateStart: signsAway === 0 ? 'Now' : formatFutureDate(startDate),
      approximateEnd: formatFutureDate(endDate),
      isCurrent: signsAway === 0,
    });
  }

  return phases;
}

/**
 * Check Small Panoti (Dhaiya) — Saturn in 4th or 8th from Moon.
 */
export function checkDhaiya(moonRashiIndex) {
  const transits = getCurrentTransits();
  const saturnTransit = transits.Saturn;
  if (!saturnTransit) return { isActive: false };

  const saturnRashi = saturnTransit.rashi.id;
  const fourthFromMoon = (moonRashiIndex + 3) % 12;
  const eighthFromMoon = (moonRashiIndex + 7) % 12;

  let type = null;
  if (saturnRashi === fourthFromMoon) type = '4th';
  else if (saturnRashi === eighthFromMoon) type = '8th';

  return {
    isActive: type !== null,
    type,
    saturnSign: saturnTransit.rashi,
    moonSign: RASHIS[moonRashiIndex],
    message: type
      ? `Small Panoti (Dhaiya) active. Saturn in ${type} house from your Moon sign.`
      : 'No Dhaiya (Small Panoti) currently active.',
  };
}

function formatFutureDate(date) {
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}
