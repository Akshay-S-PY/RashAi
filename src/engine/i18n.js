// ============================================================
// RashAi, Internationalization (Hindi / English)
// ============================================================

const TRANSLATIONS = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.kundali': 'Kundali',
    'nav.matching': 'Matching',
    'nav.panchang': 'Panchang',
    'nav.muhurta': 'Muhurta',

    // Trust strip
    'trust.browser': '100% Browser-Side',
    'trust.noData': 'No Data Stored',
    'trust.precision': 'Astronomy Engine Precision',

    // Home - Hero
    'home.badge': 'Free \u2022 No Sign-up \u2022 100% Private',
    'home.title1': 'Your Stars,',
    'home.title2': 'Decoded by Science',
    'home.subtitle': 'Precise Vedic astrology calculations powered by astronomical data. No superstition, no middleman. Get your full Kundali, doshas, and compatibility scores instantly.',
    'home.cta.generate': 'Generate My Kundali',
    'home.cta.match': 'Match Kundalis',

    // Home - Stats
    'home.stat.planets': 'Planets Tracked',
    'home.stat.nakshatras': 'Nakshatras',
    'home.stat.gunMilan': 'Gun Milan Points',
    'home.stat.strength': 'Strength Factors',

    // Home - How It Works
    'home.howItWorks': 'How It Works',
    'home.howItWorks.subtitle': 'Three simple steps to your complete Vedic birth chart',
    'home.step1.title': 'Enter Birth Details',
    'home.step1.desc': 'Date, time, and place of birth. Our geocoding finds exact coordinates automatically.',
    'home.step2.title': 'We Calculate',
    'home.step2.desc': 'Swiss-ephemeris-grade calculations via Astronomy Engine. All 9 planets, 12 houses, precise to the arc-second.',
    'home.step3.title': 'Get Your Report',
    'home.step3.desc': 'Full Kundali chart, dosha analysis, AI insights, and a beautiful PDF export. All in seconds.',

    // Home - Features
    'home.features.title': 'What RashAi Can Do',
    'home.features.subtitle': 'Everything an astrologer charges \u20B92,000+ for: free, instant, and transparent.',

    // Features
    'feature.birthChart': 'Full Birth Chart',
    'feature.birthChart.desc': 'Complete Kundali with Navamsa D9, Shadbala strength, transit chart, Sade Sati check, Varshaphal & PDF export.',
    'feature.birthChart.link': 'Generate chart',
    'feature.doshas': 'Dosha Detection',
    'feature.doshas.desc': 'Mangal Dosha, Kaal Sarp Dosha, Pitra Dosha with severity levels, cancellation rules & explanations.',
    'feature.doshas.link': 'Check doshas',
    'feature.matching': 'Kundali Matching',
    'feature.matching.desc': '36-point Ashtakoot Gun Milan with all 8 kootas: Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot & Nadi.',
    'feature.matching.link': 'Match now',
    'feature.rashi': 'Rashi & Nakshatra',
    'feature.rashi.desc': 'Find your Moon sign, Sun sign, and birth Nakshatra instantly. Get naming syllables for newborns based on Nakshatra pada.',
    'feature.rashi.link': 'Find yours',
    'feature.dasha': 'Dasha Timeline',
    'feature.dasha.desc': 'Vimshottari Dasha & Antardasha periods. Know which planetary chapter of life you\'re currently in.',
    'feature.dasha.link': 'View timeline',
    'feature.ai': 'AI Insights',
    'feature.ai.desc': 'Personality analysis, career indicators & guidance, framed psychologically, not as fate. Powered by AI.',
    'feature.ai.link': 'Try AI reading',
    'feature.panchang': 'Daily Panchang',
    'feature.panchang.desc': 'Today\'s Tithi, Nakshatra, Yoga, Karana & Vara. Sunrise, sunset, and a 7-day weekly Panchang overview.',
    'feature.panchang.link': 'View Panchang',
    'feature.muhurta': 'Muhurta Finder',
    'feature.muhurta.desc': 'Find auspicious dates for weddings, travel, business, education & more based on Vedic Panchang analysis.',
    'feature.muhurta.link': 'Find dates',

    // Home - CTA
    'home.cta.ready': 'Ready to See Your Chart?',
    'home.cta.readyDesc': 'Enter your birth details and get your complete Vedic birth chart, dosha analysis, and planetary positions, in under 3 seconds.',
    'home.cta.generateNow': 'Generate Kundali Now',
    'home.cta.orMatch': 'Or Match Two Kundalis',

    // Calculator
    'calc.title': 'Generate Your Kundali',
    'calc.subtitle': 'Enter your birth details for a complete Vedic birth chart analysis',
    'calc.name': 'Full Name',
    'calc.dob': 'Date of Birth',
    'calc.tob': 'Time of Birth',
    'calc.pob': 'Place of Birth',
    'calc.gender': 'Gender',
    'calc.gender.male': 'Male',
    'calc.gender.female': 'Female',
    'calc.gender.other': 'Other',
    'calc.submit': 'Generate Kundali',
    'calc.quickSelect': 'Quick Select',

    // Results
    'results.moonSign': 'Moon Sign (Rashi)',
    'results.sunSign': 'Sun Sign',
    'results.ascendant': 'Ascendant (Lagna)',
    'results.nakshatra': 'Birth Nakshatra',
    'results.planets': 'Planetary Positions',
    'results.doshas': 'Dosha Analysis',
    'results.navamsa': 'Navamsa (D9) Chart',
    'results.transit': 'Current Transits',
    'results.shadbala': 'Planetary Strength',
    'results.varshaphal': 'Yearly Predictions',
    'results.sadeSati': 'Sade Sati Status',
    'results.exportPdf': 'Export PDF',
    'results.save': 'Save to Browser',
    'results.share': 'Copy Share Link',
    'results.aiReading': 'Generate AI Reading',

    // Matching
    'match.title': 'Kundali Matching',
    'match.subtitle': 'Ashtakoot Gun Milan, the traditional 36-point compatibility scoring used for marriage matching.',
    'match.bride': 'Bride (Kanya)',
    'match.groom': 'Groom (Var)',
    'match.name': 'Name',
    'match.gender': 'Gender',
    'match.dob': 'Date of Birth',
    'match.tob': 'Time of Birth',
    'match.pob': 'Place of Birth',
    'match.quickSelect': 'Quick Select',
    'match.submit': 'Match Kundalis',
    'match.score': 'Match Score',
    'match.outOf': 'out of 36',
    'match.fillBride': 'Please fill in all birth details for the Bride.',
    'match.fillGroom': 'Please fill in all birth details for the Groom.',

    // Panchang
    'panchang.title': 'Daily Panchang',
    'panchang.tithi': 'Tithi',
    'panchang.nakshatra': 'Nakshatra',
    'panchang.yoga': 'Yoga',
    'panchang.karana': 'Karana',
    'panchang.vara': 'Day',
    'panchang.sunrise': 'Sunrise',
    'panchang.sunset': 'Sunset',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.notPresent': 'Not Present',
    'common.present': 'Present',
    'common.good': 'Good',
    'common.bad': 'Challenging',
    'common.neutral': 'Neutral',
    'common.planet': 'Planet',
    'common.sign': 'Sign',
    'common.degree': 'Degree',
    'common.house': 'House',
    'common.lord': 'Lord',
    'common.female': 'Female',
    'common.male': 'Male',
    'common.other': 'Other',
  },

  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.kundali': 'कुंडली',
    'nav.matching': 'मिलान',
    'nav.panchang': 'पंचांग',
    'nav.muhurta': 'मुहूर्त',

    // Trust strip
    'trust.browser': '100% ब्राउज़र में',
    'trust.noData': 'कोई डेटा संग्रहित नहीं',
    'trust.precision': 'खगोलीय गणना',

    // Home - Hero
    'home.badge': 'मुफ़्त \u2022 कोई साइन-अप नहीं \u2022 100% निजी',
    'home.title1': 'आपके सितारे,',
    'home.title2': 'विज्ञान द्वारा',
    'home.subtitle': 'खगोलीय गणनाओं पर आधारित सटीक वैदिक ज्योतिष। कोई अंधविश्वास नहीं, कोई बिचौलिया नहीं। अपनी पूरी कुंडली, दोष और अनुकूलता अंक तुरंत प्राप्त करें।',
    'home.cta.generate': 'मेरी कुंडली बनाएं',
    'home.cta.match': 'कुंडली मिलान',

    // Home - Stats
    'home.stat.planets': 'ग्रह',
    'home.stat.nakshatras': 'नक्षत्र',
    'home.stat.gunMilan': 'गुण मिलान अंक',
    'home.stat.strength': 'बल कारक',

    // Home - How It Works
    'home.howItWorks': 'कैसे काम करता है',
    'home.howItWorks.subtitle': 'आपकी पूरी वैदिक जन्म कुंडली के लिए तीन सरल चरण',
    'home.step1.title': 'जन्म विवरण दर्ज करें',
    'home.step1.desc': 'जन्म तिथि, समय और स्थान। हमारी जियोकोडिंग स्वचालित रूप से सटीक निर्देशांक खोजती है।',
    'home.step2.title': 'हम गणना करते हैं',
    'home.step2.desc': 'एस्ट्रोनॉमी इंजन द्वारा सटीक गणना। सभी 9 ग्रह, 12 भाव, आर्क-सेकंड तक सटीक।',
    'home.step3.title': 'रिपोर्ट प्राप्त करें',
    'home.step3.desc': 'पूरी कुंडली, दोष विश्लेषण, AI अंतर्दृष्टि और PDF। सब कुछ सेकंडों में।',

    // Home - Features
    'home.features.title': 'RashAi क्या कर सकता है',
    'home.features.subtitle': 'जो एक ज्योतिषी \u20B92,000+ लेता है: मुफ़्त, तुरंत और पारदर्शी।',

    // Features
    'feature.birthChart': 'पूर्ण जन्म कुंडली',
    'feature.birthChart.desc': 'नवांश D9, षड्बल, गोचर चार्ट, साढ़े साती, वार्षफल और PDF के साथ पूरी कुंडली।',
    'feature.birthChart.link': 'चार्ट बनाएं',
    'feature.doshas': 'दोष विश्लेषण',
    'feature.doshas.desc': 'मंगल दोष, काल सर्प दोष, पितृ दोष। गंभीरता स्तर, निरस्तीकरण नियम और स्पष्टीकरण।',
    'feature.doshas.link': 'दोष जांचें',
    'feature.matching': 'कुंडली मिलान',
    'feature.matching.desc': '36 अंकों का अष्टकूट गुण मिलान: वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट और नाड़ी।',
    'feature.matching.link': 'मिलान करें',
    'feature.rashi': 'राशि और नक्षत्र',
    'feature.rashi.desc': 'अपनी चंद्र राशि, सूर्य राशि और जन्म नक्षत्र तुरंत जानें। नक्षत्र पद के आधार पर नामकरण अक्षर।',
    'feature.rashi.link': 'जानें',
    'feature.dasha': 'दशा समयरेखा',
    'feature.dasha.desc': 'विंशोत्तरी दशा और अंतर्दशा काल। जानें कि आप जीवन के किस ग्रह अध्याय में हैं।',
    'feature.dasha.link': 'समयरेखा देखें',
    'feature.ai': 'AI विश्लेषण',
    'feature.ai.desc': 'व्यक्तित्व विश्लेषण, करियर संकेत और मार्गदर्शन। मनोवैज्ञानिक दृष्टिकोण से, भाग्य के रूप में नहीं।',
    'feature.ai.link': 'AI रीडिंग',
    'feature.panchang': 'दैनिक पंचांग',
    'feature.panchang.desc': 'आज की तिथि, नक्षत्र, योग, करण और वार। सूर्योदय, सूर्यास्त और 7-दिन का साप्ताहिक पंचांग।',
    'feature.panchang.link': 'पंचांग देखें',
    'feature.muhurta': 'मुहूर्त खोजक',
    'feature.muhurta.desc': 'विवाह, यात्रा, व्यापार, शिक्षा आदि के लिए शुभ तिथियां। वैदिक पंचांग विश्लेषण पर आधारित।',
    'feature.muhurta.link': 'तिथियां खोजें',

    // Home - CTA
    'home.cta.ready': 'अपनी कुंडली देखने के लिए तैयार?',
    'home.cta.readyDesc': 'जन्म विवरण दर्ज करें और अपनी पूरी वैदिक जन्म कुंडली, दोष विश्लेषण और ग्रह स्थिति प्राप्त करें, 3 सेकंड में।',
    'home.cta.generateNow': 'अभी कुंडली बनाएं',
    'home.cta.orMatch': 'या दो कुंडलियां मिलाएं',

    // Calculator
    'calc.title': 'अपनी कुंडली बनाएं',
    'calc.subtitle': 'पूर्ण वैदिक जन्म कुंडली विश्लेषण के लिए जन्म विवरण दर्ज करें',
    'calc.name': 'पूरा नाम',
    'calc.dob': 'जन्म तिथि',
    'calc.tob': 'जन्म समय',
    'calc.pob': 'जन्म स्थान',
    'calc.gender': 'लिंग',
    'calc.gender.male': 'पुरुष',
    'calc.gender.female': 'स्त्री',
    'calc.gender.other': 'अन्य',
    'calc.submit': 'कुंडली बनाएं',
    'calc.quickSelect': 'शीघ्र चयन',

    // Results
    'results.moonSign': 'चन्द्र राशि',
    'results.sunSign': 'सूर्य राशि',
    'results.ascendant': 'लग्न',
    'results.nakshatra': 'जन्म नक्षत्र',
    'results.planets': 'ग्रह स्थिति',
    'results.doshas': 'दोष विश्लेषण',
    'results.navamsa': 'नवांश (D9) चार्ट',
    'results.transit': 'वर्तमान गोचर',
    'results.shadbala': 'षड्बल',
    'results.varshaphal': 'वार्षिक फल',
    'results.sadeSati': 'साढ़े साती स्थिति',
    'results.exportPdf': 'PDF डाउनलोड',
    'results.save': 'ब्राउज़र में सहेजें',
    'results.share': 'लिंक कॉपी करें',
    'results.aiReading': 'AI विश्लेषण',

    // Matching
    'match.title': 'कुंडली मिलान',
    'match.subtitle': 'अष्टकूट गुण मिलान, विवाह के लिए पारंपरिक 36 अंकों की अनुकूलता प्रणाली।',
    'match.bride': 'वधू (कन्या)',
    'match.groom': 'वर',
    'match.name': 'नाम',
    'match.gender': 'लिंग',
    'match.dob': 'जन्म तिथि',
    'match.tob': 'जन्म समय',
    'match.pob': 'जन्म स्थान',
    'match.quickSelect': 'शीघ्र चयन',
    'match.submit': 'कुंडली मिलान करें',
    'match.score': 'मिलान अंक',
    'match.outOf': '36 में से',
    'match.fillBride': 'कृपया वधू के सभी जन्म विवरण भरें।',
    'match.fillGroom': 'कृपया वर के सभी जन्म विवरण भरें।',

    // Panchang
    'panchang.title': 'दैनिक पंचांग',
    'panchang.tithi': 'तिथि',
    'panchang.nakshatra': 'नक्षत्र',
    'panchang.yoga': 'योग',
    'panchang.karana': 'करण',
    'panchang.vara': 'वार',
    'panchang.sunrise': 'सूर्योदय',
    'panchang.sunset': 'सूर्यास्त',

    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.notPresent': 'अनुपस्थित',
    'common.present': 'उपस्थित',
    'common.good': 'शुभ',
    'common.bad': 'अशुभ',
    'common.neutral': 'सामान्य',
    'common.planet': 'ग्रह',
    'common.sign': 'राशि',
    'common.degree': 'अंश',
    'common.house': 'भाव',
    'common.lord': 'स्वामी',
    'common.female': 'स्त्री',
    'common.male': 'पुरुष',
    'common.other': 'अन्य',
  },
};

let currentLang = localStorage.getItem('rashaiLang') || 'en';

/**
 * Get translation for a key.
 */
export function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || key;
}

/**
 * Get current language.
 */
export function getLang() {
  return currentLang;
}

/**
 * Set language and persist.
 */
export function setLang(lang) {
  if (TRANSLATIONS[lang]) {
    currentLang = lang;
    localStorage.setItem('rashaiLang', lang);
    // Dispatch event so UI can react
    window.dispatchEvent(new CustomEvent('rashai-lang-change', { detail: { lang } }));
  }
}

/**
 * Toggle between Hindi and English.
 */
export function toggleLang() {
  setLang(currentLang === 'en' ? 'hi' : 'en');
  return currentLang;
}

/**
 * Get available languages.
 */
export function getLanguages() {
  return [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  ];
}
