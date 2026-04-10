// ============================================================
// RashAi, Vedic Astrology Constants
// ============================================================

export const RASHIS = [
  { id: 0,  name: 'Aries',       hindi: 'मेष',     lord: 'Mars',    element: 'Fire',  quality: 'Cardinal',  symbol: '♈' },
  { id: 1,  name: 'Taurus',      hindi: 'वृषभ',    lord: 'Venus',   element: 'Earth', quality: 'Fixed',     symbol: '♉' },
  { id: 2,  name: 'Gemini',      hindi: 'मिथुन',   lord: 'Mercury', element: 'Air',   quality: 'Mutable',   symbol: '♊' },
  { id: 3,  name: 'Cancer',      hindi: 'कर्क',    lord: 'Moon',    element: 'Water', quality: 'Cardinal',  symbol: '♋' },
  { id: 4,  name: 'Leo',         hindi: 'सिंह',    lord: 'Sun',     element: 'Fire',  quality: 'Fixed',     symbol: '♌' },
  { id: 5,  name: 'Virgo',       hindi: 'कन्या',   lord: 'Mercury', element: 'Earth', quality: 'Mutable',   symbol: '♍' },
  { id: 6,  name: 'Libra',       hindi: 'तुला',    lord: 'Venus',   element: 'Air',   quality: 'Cardinal',  symbol: '♎' },
  { id: 7,  name: 'Scorpio',     hindi: 'वृश्चिक', lord: 'Mars',    element: 'Water', quality: 'Fixed',     symbol: '♏' },
  { id: 8,  name: 'Sagittarius', hindi: 'धनु',     lord: 'Jupiter', element: 'Fire',  quality: 'Mutable',   symbol: '♐' },
  { id: 9,  name: 'Capricorn',   hindi: 'मकर',     lord: 'Saturn',  element: 'Earth', quality: 'Cardinal',  symbol: '♑' },
  { id: 10, name: 'Aquarius',    hindi: 'कुम्भ',   lord: 'Saturn',  element: 'Air',   quality: 'Fixed',     symbol: '♒' },
  { id: 11, name: 'Pisces',      hindi: 'मीन',     lord: 'Jupiter', element: 'Water', quality: 'Mutable',   symbol: '♓' },
];

export const NAKSHATRAS = [
  { id: 0,  name: 'Ashwini',        hindi: 'अश्विनी',       lord: 'Ketu',    startDeg: 0,          syllables: ['चू', 'चे', 'चो', 'ला'] },
  { id: 1,  name: 'Bharani',        hindi: 'भरणी',          lord: 'Venus',   startDeg: 13.3333,    syllables: ['ली', 'लू', 'ले', 'लो'] },
  { id: 2,  name: 'Krittika',       hindi: 'कृत्तिका',      lord: 'Sun',     startDeg: 26.6667,    syllables: ['अ', 'ई', 'उ', 'ए'] },
  { id: 3,  name: 'Rohini',         hindi: 'रोहिणी',        lord: 'Moon',    startDeg: 40,         syllables: ['ओ', 'वा', 'वी', 'वू'] },
  { id: 4,  name: 'Mrigashira',     hindi: 'मृगशिरा',       lord: 'Mars',    startDeg: 53.3333,    syllables: ['वे', 'वो', 'का', 'की'] },
  { id: 5,  name: 'Ardra',          hindi: 'आर्द्रा',       lord: 'Rahu',    startDeg: 66.6667,    syllables: ['कू', 'घ', 'ङ', 'छ'] },
  { id: 6,  name: 'Punarvasu',      hindi: 'पुनर्वसु',      lord: 'Jupiter', startDeg: 80,         syllables: ['के', 'को', 'हा', 'ही'] },
  { id: 7,  name: 'Pushya',         hindi: 'पुष्य',         lord: 'Saturn',  startDeg: 93.3333,    syllables: ['हू', 'हे', 'हो', 'डा'] },
  { id: 8,  name: 'Ashlesha',       hindi: 'आश्लेषा',       lord: 'Mercury', startDeg: 106.6667,   syllables: ['डी', 'डू', 'डे', 'डो'] },
  { id: 9,  name: 'Magha',          hindi: 'मघा',           lord: 'Ketu',    startDeg: 120,        syllables: ['मा', 'मी', 'मू', 'मे'] },
  { id: 10, name: 'Purva Phalguni', hindi: 'पूर्व फाल्गुनी', lord: 'Venus',   startDeg: 133.3333,   syllables: ['मो', 'टा', 'टी', 'टू'] },
  { id: 11, name: 'Uttara Phalguni',hindi: 'उत्तर फाल्गुनी', lord: 'Sun',     startDeg: 146.6667,   syllables: ['टे', 'टो', 'पा', 'पी'] },
  { id: 12, name: 'Hasta',          hindi: 'हस्त',          lord: 'Moon',    startDeg: 160,        syllables: ['पू', 'ष', 'ण', 'ठ'] },
  { id: 13, name: 'Chitra',         hindi: 'चित्रा',        lord: 'Mars',    startDeg: 173.3333,   syllables: ['पे', 'पो', 'रा', 'री'] },
  { id: 14, name: 'Swati',          hindi: 'स्वाति',        lord: 'Rahu',    startDeg: 186.6667,   syllables: ['रू', 'रे', 'रो', 'ता'] },
  { id: 15, name: 'Vishakha',       hindi: 'विशाखा',        lord: 'Jupiter', startDeg: 200,        syllables: ['ती', 'तू', 'ते', 'तो'] },
  { id: 16, name: 'Anuradha',       hindi: 'अनुराधा',       lord: 'Saturn',  startDeg: 213.3333,   syllables: ['ना', 'नी', 'नू', 'ने'] },
  { id: 17, name: 'Jyeshtha',       hindi: 'ज्येष्ठा',      lord: 'Mercury', startDeg: 226.6667,   syllables: ['नो', 'या', 'यी', 'यू'] },
  { id: 18, name: 'Mula',           hindi: 'मूल',           lord: 'Ketu',    startDeg: 240,        syllables: ['ये', 'यो', 'भा', 'भी'] },
  { id: 19, name: 'Purva Ashadha',  hindi: 'पूर्वाषाढ़ा',    lord: 'Venus',   startDeg: 253.3333,   syllables: ['भू', 'धा', 'फा', 'ढा'] },
  { id: 20, name: 'Uttara Ashadha', hindi: 'उत्तराषाढ़ा',    lord: 'Saturn',  startDeg: 266.6667,   syllables: ['भे', 'भो', 'जा', 'जी'] },
  { id: 21, name: 'Shravana',       hindi: 'श्रवण',         lord: 'Moon',    startDeg: 280,        syllables: ['खी', 'खू', 'खे', 'खो'] },
  { id: 22, name: 'Dhanishta',      hindi: 'धनिष्ठा',       lord: 'Mars',    startDeg: 293.3333,   syllables: ['गा', 'गी', 'गू', 'गे'] },
  { id: 23, name: 'Shatabhisha',    hindi: 'शतभिषा',        lord: 'Rahu',    startDeg: 306.6667,   syllables: ['गो', 'सा', 'सी', 'सू'] },
  { id: 24, name: 'Purva Bhadrapada', hindi: 'पूर्व भाद्रपद', lord: 'Jupiter', startDeg: 320,       syllables: ['से', 'सो', 'दा', 'दी'] },
  { id: 25, name: 'Uttara Bhadrapada', hindi: 'उत्तर भाद्रपद', lord: 'Saturn', startDeg: 333.3333,  syllables: ['दू', 'थ', 'झ', 'ञ'] },
  { id: 26, name: 'Revati',         hindi: 'रेवती',         lord: 'Mercury', startDeg: 346.6667,   syllables: ['दे', 'दो', 'चा', 'ची'] },
];

export const PLANETS = [
  { id: 'Sun',     name: 'Sun',     hindi: 'सूर्य',  symbol: '☉', abbr: 'Su', nature: 'Malefic' },
  { id: 'Moon',    name: 'Moon',    hindi: 'चन्द्र', symbol: '☽', abbr: 'Mo', nature: 'Benefic' },
  { id: 'Mars',    name: 'Mars',    hindi: 'मंगल',   symbol: '♂', abbr: 'Ma', nature: 'Malefic' },
  { id: 'Mercury', name: 'Mercury', hindi: 'बुध',    symbol: '☿', abbr: 'Me', nature: 'Neutral' },
  { id: 'Jupiter', name: 'Jupiter', hindi: 'गुरु',   symbol: '♃', abbr: 'Ju', nature: 'Benefic' },
  { id: 'Venus',   name: 'Venus',   hindi: 'शुक्र',  symbol: '♀', abbr: 'Ve', nature: 'Benefic' },
  { id: 'Saturn',  name: 'Saturn',  hindi: 'शनि',   symbol: '♄', abbr: 'Sa', nature: 'Malefic' },
  { id: 'Rahu',    name: 'Rahu',    hindi: 'राहु',   symbol: '☊', abbr: 'Ra', nature: 'Malefic' },
  { id: 'Ketu',    name: 'Ketu',    hindi: 'केतु',   symbol: '☋', abbr: 'Ke', nature: 'Malefic' },
];

export const HOUSES = [
  { id: 1,  name: 'First House',    hindi: 'प्रथम भाव',     significance: 'Self, appearance, personality' },
  { id: 2,  name: 'Second House',   hindi: 'द्वितीय भाव',    significance: 'Wealth, family, speech' },
  { id: 3,  name: 'Third House',    hindi: 'तृतीय भाव',     significance: 'Siblings, courage, communication' },
  { id: 4,  name: 'Fourth House',   hindi: 'चतुर्थ भाव',    significance: 'Mother, home, happiness' },
  { id: 5,  name: 'Fifth House',    hindi: 'पंचम भाव',      significance: 'Children, education, creativity' },
  { id: 6,  name: 'Sixth House',    hindi: 'षष्ठ भाव',      significance: 'Enemies, disease, service' },
  { id: 7,  name: 'Seventh House',  hindi: 'सप्तम भाव',     significance: 'Marriage, partnerships' },
  { id: 8,  name: 'Eighth House',   hindi: 'अष्टम भाव',     significance: 'Longevity, transformation, occult' },
  { id: 9,  name: 'Ninth House',    hindi: 'नवम भाव',       significance: 'Fortune, dharma, father' },
  { id: 10, name: 'Tenth House',    hindi: 'दशम भाव',       significance: 'Career, status, karma' },
  { id: 11, name: 'Eleventh House', hindi: 'एकादश भाव',     significance: 'Gains, income, aspirations' },
  { id: 12, name: 'Twelfth House',  hindi: 'द्वादश भाव',    significance: 'Loss, liberation, foreign lands' },
];

// Vimshottari Dasha periods (years) for each nakshatra lord
export const DASHA_YEARS = {
  'Ketu':    7,
  'Venus':   20,
  'Sun':     6,
  'Moon':    10,
  'Mars':    7,
  'Rahu':    18,
  'Jupiter': 16,
  'Saturn':  19,
  'Mercury': 17,
};

// Dasha sequence
export const DASHA_SEQUENCE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

// Total Dasha cycle = 120 years

// Ashtakoot matching kootas
export const ASHTAKOOT = {
  VARNA:        { maxPoints: 1,  name: 'Varna',        hindi: 'वर्ण',      significance: 'Spiritual compatibility' },
  VASHYA:       { maxPoints: 2,  name: 'Vashya',       hindi: 'वश्य',      significance: 'Dominance/control' },
  TARA:         { maxPoints: 3,  name: 'Tara',         hindi: 'तारा',      significance: 'Destiny compatibility' },
  YONI:         { maxPoints: 4,  name: 'Yoni',         hindi: 'योनि',      significance: 'Physical compatibility' },
  GRAHA_MAITRI: { maxPoints: 5,  name: 'Graha Maitri', hindi: 'ग्रह मैत्री', significance: 'Mental compatibility' },
  GANA:         { maxPoints: 6,  name: 'Gana',         hindi: 'गण',       significance: 'Temperament' },
  BHAKOOT:      { maxPoints: 7,  name: 'Bhakoot',      hindi: 'भकूट',      significance: 'Emotional compatibility' },
  NADI:         { maxPoints: 8,  name: 'Nadi',         hindi: 'नाड़ी',     significance: 'Health & genes' },
};

// Nakshatra Gana classification
export const NAKSHATRA_GANA = {
  0: 'Deva', 1: 'Manushya', 2: 'Deva', 3: 'Manushya', 4: 'Deva',
  5: 'Manushya', 6: 'Deva', 7: 'Deva', 8: 'Rakshasa',
  9: 'Rakshasa', 10: 'Manushya', 11: 'Manushya', 12: 'Deva',
  13: 'Rakshasa', 14: 'Deva', 15: 'Rakshasa', 16: 'Deva',
  17: 'Rakshasa', 18: 'Rakshasa', 19: 'Manushya', 20: 'Manushya',
  21: 'Deva', 22: 'Rakshasa', 23: 'Rakshasa', 24: 'Manushya',
  25: 'Manushya', 26: 'Deva',
};

// Nakshatra Nadi classification
export const NAKSHATRA_NADI = {
  0: 'Vata', 1: 'Pitta', 2: 'Kapha', 3: 'Vata', 4: 'Pitta',
  5: 'Kapha', 6: 'Vata', 7: 'Pitta', 8: 'Kapha',
  9: 'Vata', 10: 'Pitta', 11: 'Kapha', 12: 'Vata',
  13: 'Pitta', 14: 'Kapha', 15: 'Vata', 16: 'Pitta',
  17: 'Kapha', 18: 'Vata', 19: 'Pitta', 20: 'Kapha',
  21: 'Vata', 22: 'Pitta', 23: 'Kapha', 24: 'Vata',
  25: 'Pitta', 26: 'Kapha',
};

// Nakshatra Yoni (animal) classifications
export const NAKSHATRA_YONI = {
  0: { animal: 'Horse', type: 'Male' },
  1: { animal: 'Elephant', type: 'Male' },
  2: { animal: 'Goat', type: 'Female' },
  3: { animal: 'Serpent', type: 'Male' },
  4: { animal: 'Serpent', type: 'Female' },
  5: { animal: 'Dog', type: 'Female' },
  6: { animal: 'Cat', type: 'Female' },
  7: { animal: 'Goat', type: 'Male' },
  8: { animal: 'Cat', type: 'Male' },
  9: { animal: 'Rat', type: 'Male' },
  10: { animal: 'Rat', type: 'Female' },
  11: { animal: 'Cow', type: 'Male' },
  12: { animal: 'Buffalo', type: 'Female' },
  13: { animal: 'Tiger', type: 'Female' },
  14: { animal: 'Buffalo', type: 'Male' },
  15: { animal: 'Tiger', type: 'Male' },
  16: { animal: 'Deer', type: 'Female' },
  17: { animal: 'Deer', type: 'Male' },
  18: { animal: 'Dog', type: 'Male' },
  19: { animal: 'Monkey', type: 'Male' },
  20: { animal: 'Mongoose', type: 'Male' },
  21: { animal: 'Monkey', type: 'Female' },
  22: { animal: 'Lion', type: 'Female' },
  23: { animal: 'Horse', type: 'Female' },
  24: { animal: 'Lion', type: 'Male' },
  25: { animal: 'Cow', type: 'Female' },
  26: { animal: 'Elephant', type: 'Female' },
};

// Varna mapping for nakshatras
export const NAKSHATRA_VARNA = {
  0: 'Vaishya', 1: 'Shudra', 2: 'Kshatriya', 3: 'Shudra', 4: 'Vaishya',
  5: 'Shudra', 6: 'Vaishya', 7: 'Kshatriya', 8: 'Shudra',
  9: 'Shudra', 10: 'Brahmin', 11: 'Kshatriya', 12: 'Vaishya',
  13: 'Shudra', 14: 'Shudra', 15: 'Brahmin', 16: 'Shudra',
  17: 'Vaishya', 18: 'Shudra', 19: 'Brahmin', 20: 'Kshatriya',
  21: 'Shudra', 22: 'Vaishya', 23: 'Shudra', 24: 'Brahmin',
  25: 'Kshatriya', 26: 'Shudra',
};

// Vashya mapping (by rashi)
export const RASHI_VASHYA = {
  0: 'Chatushpada',   // Aries
  1: 'Chatushpada',   // Taurus
  2: 'Dwipada',       // Gemini
  3: 'Keeta',         // Cancer
  4: 'Vanachara',     // Leo
  5: 'Dwipada',       // Virgo
  6: 'Dwipada',       // Libra
  7: 'Keeta',         // Scorpio
  8: 'Dwipada',       // Sagittarius (back half)
  9: 'Jalchar',       // Capricorn (front half)
  10: 'Jalchar',      // Aquarius
  11: 'Jalchar',      // Pisces
};

// Yoni animal enemy pairs
export const YONI_ENEMIES = [
  ['Horse', 'Buffalo'],
  ['Elephant', 'Lion'],
  ['Goat', 'Monkey'],
  ['Serpent', 'Mongoose'],
  ['Dog', 'Deer'],
  ['Cat', 'Rat'],
  ['Cow', 'Tiger'],
];
