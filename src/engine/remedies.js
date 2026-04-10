// ============================================================
// RashAi, Gemstone & Remedy Suggestions
// Based on planetary strength, afflictions, and birth chart
// ============================================================

import { RASHIS, PLANETS } from './constants.js';

// Planet-Gemstone mapping
const GEMSTONES = {
  Sun:     { gem: 'Ruby', hindi: 'माणिक्य', color: '#e11d48', finger: 'Ring finger', metal: 'Gold', day: 'Sunday', mantra: 'Om Suryaya Namah', weight: '3-5 carats' },
  Moon:    { gem: 'Pearl', hindi: 'मोती', color: '#f0f0f0', finger: 'Little finger', metal: 'Silver', day: 'Monday', mantra: 'Om Chandraya Namah', weight: '4-6 carats' },
  Mars:    { gem: 'Red Coral', hindi: 'मूंगा', color: '#dc2626', finger: 'Ring finger', metal: 'Gold/Copper', day: 'Tuesday', mantra: 'Om Mangalaya Namah', weight: '5-7 carats' },
  Mercury: { gem: 'Emerald', hindi: 'पन्ना', color: '#059669', finger: 'Little finger', metal: 'Gold', day: 'Wednesday', mantra: 'Om Budhaya Namah', weight: '3-5 carats' },
  Jupiter: { gem: 'Yellow Sapphire', hindi: 'पुखराज', color: '#eab308', finger: 'Index finger', metal: 'Gold', day: 'Thursday', mantra: 'Om Gurave Namah', weight: '3-5 carats' },
  Venus:   { gem: 'Diamond', hindi: 'हीरा', color: '#94a3b8', finger: 'Middle finger', metal: 'Platinum/Silver', day: 'Friday', mantra: 'Om Shukraya Namah', weight: '0.5-1 carat' },
  Saturn:  { gem: 'Blue Sapphire', hindi: 'नीलम', color: '#1e40af', finger: 'Middle finger', metal: 'Silver/Iron', day: 'Saturday', mantra: 'Om Shanaishcharaya Namah', weight: '3-5 carats' },
  Rahu:    { gem: 'Hessonite (Gomed)', hindi: 'गोमेद', color: '#92400e', finger: 'Middle finger', metal: 'Silver', day: 'Saturday', mantra: 'Om Rahave Namah', weight: '5-7 carats' },
  Ketu:    { gem: "Cat's Eye", hindi: 'लहसुनिया', color: '#65a30d', finger: 'Little finger', metal: 'Silver', day: 'Tuesday', mantra: 'Om Ketave Namah', weight: '3-5 carats' },
};

// Planet exaltation and debilitation signs
const DIGNITY = {
  Sun:     { exalted: 0, debilitated: 6, own: [4], mooltrikona: 4 },       // Aries/Libra/Leo
  Moon:    { exalted: 1, debilitated: 7, own: [3], mooltrikona: 1 },       // Taurus/Scorpio/Cancer
  Mars:    { exalted: 9, debilitated: 3, own: [0, 7], mooltrikona: 0 },    // Cap/Cancer/Aries,Scorpio
  Mercury: { exalted: 5, debilitated: 11, own: [2, 5], mooltrikona: 5 },   // Virgo/Pisces/Gemini,Virgo
  Jupiter: { exalted: 3, debilitated: 9, own: [8, 11], mooltrikona: 8 },   // Cancer/Cap/Sag,Pisces
  Venus:   { exalted: 11, debilitated: 5, own: [1, 6], mooltrikona: 6 },   // Pisces/Virgo/Taurus,Libra
  Saturn:  { exalted: 6, debilitated: 0, own: [9, 10], mooltrikona: 10 },  // Libra/Aries/Cap,Aquarius
};

// Planetary friendships
const FRIENDSHIPS = {
  Sun:     { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'], neutral: ['Mercury'] },
  Moon:    { friends: ['Sun', 'Mercury'], enemies: [], neutral: ['Mars', 'Jupiter', 'Venus', 'Saturn'] },
  Mars:    { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'], neutral: ['Venus', 'Saturn'] },
  Mercury: { friends: ['Sun', 'Venus'], enemies: ['Moon'], neutral: ['Mars', 'Jupiter', 'Saturn'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'], neutral: ['Saturn'] },
  Venus:   { friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'], neutral: ['Mars', 'Jupiter'] },
  Saturn:  { friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'], neutral: ['Jupiter'] },
};

/**
 * Analyze planetary strength and suggest gemstones.
 * @param {object} positions - Planet positions
 * @param {object} report - Planetary report from generatePlanetaryReport
 * @param {number} lagnaRashi - Ascendant rashi index
 * @returns {object} { recommendations, planetaryAnalysis }
 */
export function suggestRemedies(positions, report, lagnaRashi) {
  const analysis = [];
  const recommendations = [];

  const lagnaLord = RASHIS[lagnaRashi].lord;
  const mainPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  for (const planetId of mainPlanets) {
    const pos = positions[planetId];
    const rep = report[planetId];
    if (!pos || !rep) continue;

    const rashiIndex = pos.rashi;
    const dignity = DIGNITY[planetId];
    const gemInfo = GEMSTONES[planetId];

    // Determine planet's state
    let state = 'neutral';
    let stateLabel = 'Neutral';
    let stateDesc = '';

    if (rashiIndex === dignity.exalted) {
      state = 'exalted'; stateLabel = 'Exalted';
      stateDesc = `${planetId} is exalted in ${RASHIS[rashiIndex].name}, very strong`;
    } else if (rashiIndex === dignity.debilitated) {
      state = 'debilitated'; stateLabel = 'Debilitated';
      stateDesc = `${planetId} is debilitated in ${RASHIS[rashiIndex].name}, weakened`;
    } else if (dignity.own.includes(rashiIndex)) {
      state = 'own'; stateLabel = 'Own Sign';
      stateDesc = `${planetId} is in own sign ${RASHIS[rashiIndex].name}, comfortable`;
    } else if (rashiIndex === dignity.mooltrikona) {
      state = 'mooltrikona'; stateLabel = 'Mooltrikona';
      stateDesc = `${planetId} is in Mooltrikona, strong`;
    } else {
      // Check if friendly or enemy sign
      const signLord = RASHIS[rashiIndex].lord;
      const friendInfo = FRIENDSHIPS[planetId];
      if (friendInfo?.friends.includes(signLord)) {
        state = 'friendly'; stateLabel = 'Friendly Sign';
        stateDesc = `${planetId} is in friendly sign ${RASHIS[rashiIndex].name}`;
      } else if (friendInfo?.enemies.includes(signLord)) {
        state = 'enemy'; stateLabel = 'Enemy Sign';
        stateDesc = `${planetId} is in enemy sign ${RASHIS[rashiIndex].name}, uncomfortable`;
      } else {
        stateDesc = `${planetId} is in neutral sign ${RASHIS[rashiIndex].name}`;
      }
    }

    const isRetro = pos.isRetrograde;
    const needsStrengthening = state === 'debilitated' || state === 'enemy' || isRetro;
    const isStrong = state === 'exalted' || state === 'own' || state === 'mooltrikona';

    // Priority: Lagna lord > Debilitated planets > Functional benefics
    let priority = 'low';
    if (planetId === lagnaLord) {
      priority = needsStrengthening ? 'high' : 'medium';
    } else if (state === 'debilitated') {
      priority = 'high';
    } else if (needsStrengthening) {
      priority = 'medium';
    }

    analysis.push({
      planet: planetId,
      planetInfo: PLANETS.find(p => p.id === planetId),
      sign: RASHIS[rashiIndex],
      house: pos.house,
      state,
      stateLabel,
      stateDesc,
      isRetrograde: isRetro,
      isLagnaLord: planetId === lagnaLord,
      needsStrengthening,
      isStrong,
    });

    // Build recommendation
    if (needsStrengthening || planetId === lagnaLord) {
      recommendations.push({
        planet: planetId,
        priority,
        gemstone: gemInfo,
        reason: planetId === lagnaLord
          ? `${planetId} is your Lagna lord. Strengthening it improves overall life quality.`
          : `${planetId} is ${stateLabel.toLowerCase()}${isRetro ? ' and retrograde' : ''}. Wearing ${gemInfo.gem} can help balance its energy.`,
        mantras: [
          { text: gemInfo.mantra, hindi: getHindiMantra(planetId), repetitions: 108 },
        ],
        rituals: getPlanetaryRituals(planetId),
      });
    }
  }

  // Sort: high priority first
  recommendations.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return { recommendations, analysis };
}

function getHindiMantra(planetId) {
  const mantras = {
    Sun: 'ॐ सूर्याय नमः',
    Moon: 'ॐ चन्द्राय नमः',
    Mars: 'ॐ मंगलाय नमः',
    Mercury: 'ॐ बुधाय नमः',
    Jupiter: 'ॐ गुरवे नमः',
    Venus: 'ॐ शुक्राय नमः',
    Saturn: 'ॐ शनैश्चराय नमः',
  };
  return mantras[planetId] || '';
}

function getPlanetaryRituals(planetId) {
  const rituals = {
    Sun: ['Offer water to rising Sun daily', 'Wear Ruby on Sunday morning', 'Donate wheat and jaggery on Sundays'],
    Moon: ['Wear white clothes on Mondays', 'Offer milk to Shiva Linga', 'Donate rice and silver on Mondays'],
    Mars: ['Recite Hanuman Chalisa on Tuesdays', 'Donate red lentils (masoor)', 'Wear red coral on Tuesday morning'],
    Mercury: ['Worship Lord Vishnu on Wednesdays', 'Donate green moong dal', 'Chant Vishnu Sahasranama'],
    Jupiter: ['Worship with yellow flowers on Thursdays', 'Donate turmeric and yellow cloth', 'Feed bananas to the needy'],
    Venus: ['Donate white items on Fridays', 'Worship Goddess Lakshmi', 'Offer white sweets at temple'],
    Saturn: ['Donate black sesame and mustard oil on Saturdays', 'Feed crows', 'Worship Lord Hanuman'],
  };
  return rituals[planetId] || [];
}

// Export gemstone data for UI
export { GEMSTONES, DIGNITY };
