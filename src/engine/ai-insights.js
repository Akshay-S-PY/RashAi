// ============================================================
// RashAi, AI Insights (client-side, calls serverless proxy)
// API key is server-side only, never exposed to the browser
// ============================================================

/**
 * Build a minimal data payload for the AI (reduce token usage)
 */
function buildChartSummary(birthData, results) {
  const { report, doshas, moonSign, sunSign, lagna, birthNakshatra } = results;

  const planets = {};
  const planetOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  for (const id of planetOrder) {
    const r = report[id];
    if (!r) continue;
    planets[id] = {
      sign: r.rashi.name,
      house: r.house || null,
      nakshatra: r.nakshatra.name,
      retro: r.isRetrograde || false,
    };
  }

  return {
    lagna: lagna.name,
    moonSign: moonSign.name,
    sunSign: sunSign.name,
    nakshatra: birthNakshatra.name,
    pada: birthNakshatra.pada,
    planets,
    doshas: {
      mangal: {
        present: doshas.mangalDosha.isPresent,
        severity: doshas.mangalDosha.severity || 'None',
        cancelled: doshas.mangalDosha.cancellationReasons?.length > 0,
      },
      kaalSarp: {
        present: doshas.kaalSarpDosha.isPresent,
        type: doshas.kaalSarpDosha.type || null,
        partial: doshas.kaalSarpDosha.partialKaalSarp || false,
      },
      pitra: {
        present: doshas.pitraDosha.isPresent,
      },
    },
    gender: birthData.gender || 'unknown',
  };
}

/**
 * Parse the AI response into structured sections
 */
function parseInsights(text) {
  const sections = {
    personality: '',
    career: '',
    relationships: '',
    strengths: '',
    challenges: '',
  };

  const labels = ['PERSONALITY', 'CAREER', 'RELATIONSHIPS', 'STRENGTHS', 'CHALLENGES'];

  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const key = label.toLowerCase();
    const start = text.indexOf(`${label}:`);
    if (start === -1) continue;

    const contentStart = start + label.length + 1;
    let end = text.length;
    for (let j = i + 1; j < labels.length; j++) {
      const nextIdx = text.indexOf(`${labels[j]}:`, contentStart);
      if (nextIdx !== -1) {
        end = nextIdx;
        break;
      }
    }

    sections[key] = text.slice(contentStart, end).trim();
  }

  return sections;
}

/**
 * Parse match AI response into structured sections
 */
function parseMatchInsights(text) {
  const sections = {
    compatibility: '',
    emotional: '',
    strengths: '',
    guidance: '',
  };

  const labels = ['COMPATIBILITY', 'EMOTIONAL', 'STRENGTHS', 'GUIDANCE'];

  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const key = label.toLowerCase();
    const start = text.indexOf(`${label}:`);
    if (start === -1) continue;

    const contentStart = start + label.length + 1;
    let end = text.length;
    for (let j = i + 1; j < labels.length; j++) {
      const nextIdx = text.indexOf(`${labels[j]}:`, contentStart);
      if (nextIdx !== -1) {
        end = nextIdx;
        break;
      }
    }

    sections[key] = text.slice(contentStart, end).trim();
  }

  return sections;
}

/**
 * Generate AI insights by calling the serverless proxy
 */
export async function generateInsights(birthData, results) {
  const chartSummary = buildChartSummary(birthData, results);

  const response = await fetch('/api/ai-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chartSummary }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${response.status})`);
  }

  const data = await response.json();
  return parseInsights(data.text || '');
}

/**
 * Parse Sade Sati AI response into structured sections
 */
function parseSadeSatiInsights(text) {
  const sections = {
    impact: '',
    mental: '',
    career: '',
    remedies: '',
  };

  const labels = ['IMPACT', 'MENTAL', 'CAREER', 'REMEDIES'];

  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const key = label.toLowerCase();
    const start = text.indexOf(`${label}:`);
    if (start === -1) continue;

    const contentStart = start + label.length + 1;
    let end = text.length;
    for (let j = i + 1; j < labels.length; j++) {
      const nextIdx = text.indexOf(`${labels[j]}:`, contentStart);
      if (nextIdx !== -1) {
        end = nextIdx;
        break;
      }
    }

    sections[key] = text.slice(contentStart, end).trim();
  }

  return sections;
}

/**
 * Generate AI Sade Sati interpretation
 */
export async function generateSadeSatiInsights(sadeSatiData) {
  const response = await fetch('/api/ai-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'sadesati', sadeSatiData }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${response.status})`);
  }

  const data = await response.json();
  return parseSadeSatiInsights(data.text || '');
}

/**
 * Generate AI match analysis
 */
export async function generateMatchInsights(matchData) {
  const response = await fetch('/api/ai-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'match', matchData }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${response.status})`);
  }

  const data = await response.json();
  return parseMatchInsights(data.text || '');
}
