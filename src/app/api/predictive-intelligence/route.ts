import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

/* ─────────────────────────────────────────────
   Schemas
───────────────────────────────────────────── */

const HistoricalPointSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  value: z.number().finite(),
});

const ForecastPointSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  value: z.number().finite(),
});

const SeriesForecastSchema = z.object({
  country: z.string().min(1).max(100),
  indicator: z.string().min(1).max(100),
  unit: z.string().min(1).max(100),
  performance: z.enum([
    'higher_is_better',
    'lower_is_better',
    'neutral',
  ]),

  historical: z
    .array(HistoricalPointSchema)
    .min(2)
    .max(100),

  forecast: z
    .array(ForecastPointSchema)
    .min(1)
    .max(20),

  analysis: z.object({
    lastHistoricalYear: z.number().int(),
    lastHistoricalValue: z.number().finite(),
    forecastEndYear: z.number().int(),
    forecastEndValue: z.number().finite(),
    historicalAvgAnnualGrowthPercent: z
      .number()
      .finite()
      .nullable(),
    projectedChangePercent: z.number().finite().nullable(),
    direction: z.enum(['rising', 'stable', 'declining']),
    model: z.literal('linear_trend'),
  }),
});

const PredictivePayloadSchema = z.object({
  sector: z.string().min(1).max(100),
  historicalPeriod: z.string().min(1).max(50),
  forecastHorizonYears: z.number().int().min(1).max(10),
  countries: z.array(z.string().min(1).max(100)).min(1).max(50),
  variables: z.array(z.string().min(1).max(100)).min(1).max(50),

  series: z.array(SeriesForecastSchema).min(1).max(200),

  overall: z.object({
    direction: z.enum(['rising', 'stable', 'declining']),
    avgProjectedGrowthPercent: z.number().finite().nullable(),
    confidence: z.enum(['low', 'medium', 'medium_high', 'high']),
  }),

  /** UI language: en | fr | pt (also accepts en-US, fr-FR, etc.) */
  locale: z.string().min(2).max(10).optional().default('en'),
});

const AiForecastBriefingSchema = z.object({
  summary: z.string().min(1).max(2000),
  keySignals: z.array(z.string().min(1).max(500)).min(1).max(8),
  attention: z.string().min(1).max(1000),
  outlook: z.string().min(1).max(1000),
});

type PredictivePayload = z.infer<typeof PredictivePayloadSchema>;

/* ─────────────────────────────────────────────
   Language helpers
───────────────────────────────────────────── */

function normalizeLocale(locale: string): 'en' | 'fr' | 'pt' {
  const base = locale.toLowerCase().split('-')[0];
  if (base === 'fr' || base === 'pt') return base;
  return 'en';
}

function languageName(locale: 'en' | 'fr' | 'pt'): string {
  switch (locale) {
    case 'fr':
      return 'French';
    case 'pt':
      return 'Portuguese';
    default:
      return 'English';
  }
}

/* ─────────────────────────────────────────────
   Prompt
───────────────────────────────────────────── */

function buildPrompt(
  payload: PredictivePayload,
  responseLanguage: string
): string {
  const { locale: _locale, ...facts } = payload;

  return `
You are an agricultural sector forecasting analyst.

Your task is to interpret a structured forecast dataset (historical observations + model projections) and produce a concise, evidence-based predictive intelligence briefing for decision-makers.

LANGUAGE RULES (MANDATORY):

1. Write the ENTIRE briefing in ${responseLanguage}.
2. Every string in the JSON response (summary, keySignals items, attention, outlook) MUST be in ${responseLanguage}.
3. Do not mix languages. Do not respond in English unless ${responseLanguage} is English.
4. Keep country names as provided in the data. Translate indicator descriptions only if natural in ${responseLanguage}; otherwise keep the supplied indicator names.
5. Numbers, years, percentages and units may stay as numerals / symbols.

IMPORTANT DATA RULES:

1. Use ONLY the facts supplied in FACTS below.

2. Do not invent numbers, countries, indicators, years, trends, risks, or conclusions that are unsupported by the supplied data.

3. "historical" contains observed yearly values. "forecast" contains model projections only.

4. Clearly distinguish historical patterns from projected values. Never present a forecast value as an observed fact.

5. Use the supplied "analysis" fields rather than recalculating growth rates, directions, or projected changes.

6. The forecast model is a simple linear trend extension. Do not claim higher sophistication (e.g. machine learning, climate models, causal models).

7. Do not make causal claims. The data shows patterns and projections, not their causes.

8. Do not invent policy recommendations that are not grounded in the projected trajectory.

9. If confidence is low or medium, acknowledge uncertainty briefly.

10. For "higher_is_better" indicators, projected increases generally indicate improvement; decreases generally indicate deterioration — subject to indicator context.

11. For "lower_is_better" indicators, the opposite applies.

12. For "neutral" indicators, do not frame increases or decreases as inherently good or bad unless the data itself supports a clear signal.

13. Keep the briefing professional, concise, and decision-oriented.

INTERPRETATION PRIORITY:

- Overall projected direction across selected series
- Magnitude of projected change vs recent historical trend
- Countries or indicators with the strongest projected rise or decline
- Divergence between countries where visible in the data
- Practical monitoring implications over the forecast horizon

RETURN FORMAT:

Return JSON only. Do not use Markdown.

Use exactly this structure:

{
  "summary": "6-7 sentence overall predictive assessment in ${responseLanguage}",
  "keySignals": [
    "signal 1 in ${responseLanguage}",
    "signal 2 in ${responseLanguage}",
    "signal 3 in ${responseLanguage}"
  ],
  "attention": "who or what needs attention under the forecast and why (1-2 sentences) in ${responseLanguage}",
  "outlook": "what decision-makers should monitor over the forecast horizon (1-2 sentences) in ${responseLanguage}"
}

FACTS:

${JSON.stringify(facts, null, 2)}
`.trim();
}

function extractJsonObject(text: string): string {
  const trimmed = text.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');

  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

/* ─────────────────────────────────────────────
   Route
───────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 400 }
      );
    }

    const parsedPayload = PredictivePayloadSchema.safeParse(body);

    if (!parsedPayload.success) {
      return NextResponse.json(
        {
          error: 'Invalid predictive intelligence payload.',
          details: parsedPayload.error.flatten(),
        },
        { status: 400 }
      );
    }

    const payload = parsedPayload.data;
    const locale = normalizeLocale(payload.locale ?? 'en');
    const responseLanguage = languageName(locale);

    const apiKey = process.env.OPENROUTER_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Missing OPENROUTER_API_KEY. Add it to .env.local and restart the dev server.',
        },
        { status: 500 }
      );
    }

    const model =
      process.env.INTELLIGENCE_MODEL?.trim() ||
      'nvidia/nemotron-3-super-120b-a12b:free';

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer':
            process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
          'X-Title':
            process.env.OPENROUTER_APP_NAME || 'AllSectorsWatch',
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content: `You generate structured agricultural predictive intelligence briefings. Respond with valid JSON only. Write all narrative text in ${responseLanguage}. Distinguish historical data from forecasts. Do not invent metrics, values, countries, years, or causes.`,
            },
            {
              role: 'user',
              content: buildPrompt(payload, responseLanguage),
            },
          ],
        }),
      }
    );

    const raw = await response.text();

    if (!response.ok) {
      let details = raw.slice(0, 800);

      try {
        const parsed: unknown = JSON.parse(raw);
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'error' in parsed
        ) {
          const errorValue = (parsed as { error: unknown }).error;
          if (
            typeof errorValue === 'object' &&
            errorValue !== null &&
            'message' in errorValue &&
            typeof (errorValue as { message: unknown }).message === 'string'
          ) {
            details = (errorValue as { message: string }).message;
          } else if (typeof errorValue === 'string') {
            details = errorValue;
          }
        }
      } catch {
        // keep raw excerpt
      }

      return NextResponse.json(
        {
          error: `OpenRouter request failed (${response.status}): ${details}`,
        },
        { status: 502 }
      );
    }

    let providerData: {
      choices?: Array<{ message?: { content?: string } }>;
    };

    try {
      providerData = JSON.parse(raw) as typeof providerData;
    } catch {
      return NextResponse.json(
        { error: 'OpenRouter returned non-JSON response.' },
        { status: 502 }
      );
    }

    const content = providerData?.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'OpenRouter returned an empty response.' },
        { status: 502 }
      );
    }

    let aiJson: unknown;

    try {
      aiJson = JSON.parse(extractJsonObject(content));
    } catch {
      return NextResponse.json(
        {
          error: 'OpenRouter returned invalid JSON content.',
          details: content.slice(0, 300),
        },
        { status: 502 }
      );
    }

    const parsedBriefing = AiForecastBriefingSchema.safeParse(aiJson);

    if (!parsedBriefing.success) {
      return NextResponse.json(
        {
          error:
            'AI response did not match the required briefing schema.',
          details: parsedBriefing.error.flatten(),
        },
        { status: 502 }
      );
    }

    const briefing = parsedBriefing.data;

    return NextResponse.json({
      summary: briefing.summary,
      keySignals: briefing.keySignals.slice(0, 6),
      attention: briefing.attention,
      outlook: briefing.outlook,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to generate predictive intelligence briefing.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}