import { defineConfig, loadEnv } from 'vite';

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      {
        name: 'api-proxy',
        configureServer(server) {
          server.middlewares.use('/api/ai-insights', async (req, res) => {
            if (req.method === 'OPTIONS') {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
              res.statusCode = 200;
              res.end();
              return;
            }

            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }

            const apiKey = env.OPENAI_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'OPENAI_API_KEY not set in .env' }));
              return;
            }

            let body = '';
            for await (const chunk of req) body += chunk;

            let parsed;
            try {
              parsed = JSON.parse(body);
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
              return;
            }

            const type = parsed.type || 'chart';
            let systemPrompt, userContent;

            if (type === 'match') {
              const { matchData } = parsed;
              if (!matchData || !matchData.personA || !matchData.personB || !matchData.kootas) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid match data' }));
                return;
              }
              systemPrompt = MATCH_PROMPT;
              userContent = `Analyze this Kundali match (Ashtakoot Gun Milan):\n${JSON.stringify(matchData)}`;
            } else {
              const { chartSummary } = parsed;
              if (!chartSummary || !chartSummary.lagna || !chartSummary.planets) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid chart data' }));
                return;
              }
              systemPrompt = CHART_PROMPT;
              userContent = `Read this Vedic birth chart:\n${JSON.stringify(chartSummary)}`;
            }

            try {
              const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  max_tokens: 600,
                  temperature: 0.7,
                }),
              });

              if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.error?.message || `OpenAI error (${response.status})` }));
                return;
              }

              const data = await response.json();
              const text = data.choices?.[0]?.message?.content || '';

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text }));
            } catch {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to reach OpenAI' }));
            }
          });
        },
      },
    ],
  };
});
