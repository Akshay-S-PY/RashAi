// ============================================================
// Vercel Serverless Function, AI Insights Proxy
// Keeps the OpenAI API key server-side, never exposed to client
// Supports: chart readings, match analysis, and Sade Sati interpretation
// Rate limited: 20 requests per IP per hour
// ============================================================

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// Simple in-memory rate limiter (resets on cold start, good enough for free tier)
const rateMap = new Map();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: 1 });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

const CHART_PROMPT = `You are a Vedic astrologer providing chart readings. Rules:
- Speak in traditional Vedic astrology terms (grahas, bhavas, rashis, nakshatras, yogas)
- Never use em dashes. Use commas or periods instead.
- Be concise. Each section should be 2-3 sentences max.
- Do not predict death, serious illness, or catastrophic events.
- Frame everything as tendencies and influences, not certainties.
- Reference specific planetary placements to justify each point.
- Do not use markdown headers or bullet points. Write in plain flowing paragraphs.
- Separate sections with a blank line.

Respond with exactly these 5 sections, each labeled:

PERSONALITY: Core nature based on Lagna, Moon sign, and key planetary placements.

CAREER: Professional tendencies based on 10th house, its lord, and relevant planets.

RELATIONSHIPS: Relationship patterns from 7th house, Venus placement, and Moon nakshatra.

STRENGTHS: Natural advantages shown by benefic placements, exalted planets, or strong yogas.

CHALLENGES: Areas requiring awareness based on afflicted houses or dosha presence. Include traditional remedies (gemstones, mantras, fasting days) where relevant.`;

const MATCH_PROMPT = `You are a Vedic astrologer specializing in Kundali matching (Gun Milan). Rules:
- Speak in traditional Vedic astrology terms (rashis, nakshatras, kootas, doshas, gunas)
- Never use em dashes. Use commas or periods instead.
- Be warm, balanced, and constructive. Never be discouraging about any match.
- Frame everything as tendencies and influences, not certainties.
- Reference the specific koota scores and nakshatra/rashi combinations.
- Do not use markdown headers or bullet points. Write in plain flowing paragraphs.
- Separate sections with a blank line.
- If the match score is low, focus on remedies and positive aspects.

Respond with exactly these 4 sections, each labeled:

COMPATIBILITY: Overall compatibility assessment based on the total Ashtakoot score and the strongest/weakest kootas. Mention which kootas scored well and which need attention.

EMOTIONAL: Emotional and temperamental compatibility based on Gana, Nadi, and Moon sign analysis. How their natures complement or challenge each other.

STRENGTHS: What makes this pairing work well. Reference the high-scoring kootas and any natural harmony between their nakshatras or rashi lords.

GUIDANCE: Practical guidance and traditional remedies if any kootas scored zero. Suggest specific remedies (puja, gemstones, mantras) for Nadi dosha or other concerns. End on an encouraging note.`;

const SADESATI_PROMPT = `You are a Vedic astrologer interpreting Sade Sati (Saturn's 7.5-year transit over the Moon sign). Rules:
- Speak in traditional Vedic astrology terms (Shani, grahas, rashis, nakshatras)
- Never use em dashes. Use commas or periods instead.
- Be concise. Each section should be 2-3 sentences max.
- Do not predict catastrophic events. Frame as influences and tendencies.
- Reference the specific transit phase (rising/peak/setting), Saturn's current sign, and the person's Moon sign.
- Be reassuring. Sade Sati is a period of growth through challenges, not punishment.
- Do not use markdown headers or bullet points. Write in plain flowing paragraphs.
- Separate sections with a blank line.

Respond with exactly these 4 sections, each labeled:

IMPACT: Overall life impact of this Sade Sati phase. What areas of life are most affected based on Saturn's current transit sign relative to their Moon sign. Reference the specific phase (12th house transit, conjunction, or 2nd house transit).

MENTAL: Emotional and mental effects during this phase. How Saturn's energy affects their mindset, patience, and inner world. Connect to their Moon nakshatra if provided.

CAREER: Career and financial implications. How this transit may influence work life, responsibilities, and material concerns. Reference Saturn's nature as taskmaster and teacher.

REMEDIES: Specific traditional remedies tailored to their situation. Include mantras (with Sanskrit text), gemstones, fasting days, donations, and worship practices for Shani. Mention which remedies are most important for their specific phase.`;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait before trying again.' });
  }

  // Validate API key exists
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI service not configured.' });
  }

  const body = req.body || {};
  const type = body.type || 'chart';

  let systemPrompt, userContent, maxTokens;

  if (type === 'match') {
    const { matchData } = body;
    if (!matchData || !matchData.personA || !matchData.personB || !matchData.kootas) {
      return res.status(400).json({ error: 'Invalid match data.' });
    }
    systemPrompt = MATCH_PROMPT;
    userContent = `Analyze this Kundali match (Ashtakoot Gun Milan):\n${JSON.stringify(matchData)}`;
    maxTokens = 600;
  } else if (type === 'sadesati') {
    const { sadeSatiData } = body;
    if (!sadeSatiData || !sadeSatiData.phase || !sadeSatiData.moonSign) {
      return res.status(400).json({ error: 'Invalid Sade Sati data.' });
    }
    systemPrompt = SADESATI_PROMPT;
    userContent = `Interpret this person's Sade Sati:\n${JSON.stringify(sadeSatiData)}`;
    maxTokens = 600;
  } else {
    const { chartSummary } = body;
    if (!chartSummary || !chartSummary.lagna || !chartSummary.planets) {
      return res.status(400).json({ error: 'Invalid chart data.' });
    }
    systemPrompt = CHART_PROMPT;
    userContent = `Read this Vedic birth chart:\n${JSON.stringify(chartSummary)}`;
    maxTokens = 600;
  }

  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const msg = response.status === 429
        ? 'AI service is busy. Please try again in a moment.'
        : 'AI service temporarily unavailable.';
      return res.status(502).json({ error: msg });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return res.status(200).json({ text });
  } catch (err) {
    console.error('OpenAI proxy error:', err);
    return res.status(502).json({ error: 'Failed to reach AI service.' });
  }
}
