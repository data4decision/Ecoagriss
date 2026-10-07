import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const TimeSeriesPointSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  value: z.number().finite(),
});

const YearOverYearChangeSchema = z.object({
  fromYear: z.number().int().min(1900).max(2100),
  toYear: z.number().int().min(1900).max(2100),
  changePercent: z.number().finite().nullable(),
});

const TimeSeriesAnalysisSchema = z.object({
  startYear: z.number().int().min(1900).max(2100),
  endYear: z.number().int().min(1900).max(2100),

  startValue: z.number().finite(),
  endValue: z.number().finite(),

  changePercent: z.number().finite().nullable(),

  averageAnnualChangePercent: z.number().finite().nullable(),

  highestYear: z.number().int().min(1900).max(2100),
  highestValue: z.number().finite(),

  lowestYear: z.number().int().min(1900).max(2100),
  lowestValue: z.number().finite(),

  trend: z.enum([
    'increasing',
    'decreasing',
    'stable',
    'mixed',
  ]),

  volatilityPercent: z.number().finite().nullable(),

  acceleration: z.enum([
    'accelerating',
    'decelerating',
    'steady',
    'insufficient_data',
  ]),
});

const TimeSeriesIndicatorSchema = z.object({
  country: z.string().min(1).max(100),

  indicator: z.string().min(1).max(100),

  unit: z.string().min(1).max(100),

  performance: z.enum([
    'higher_is_better',
    'lower_is_better',
    'neutral',
  ]),

  series: z
    .array(TimeSeriesPointSchema)
    .min(1)
    .max(100),

  yearOverYearChanges: z
    .array(YearOverYearChangeSchema)
    .max(100),

  analysis: TimeSeriesAnalysisSchema,
});

const IntelligencePayloadSchema = z.object({
  sector: z.string().min(1).max(100),

  period: z.string().min(1).max(50),

  countries: z
    .array(z.string().min(1).max(100))
    .min(1)
    .max(50),

  variables: z
    .array(z.string().min(1).max(100))
    .min(1)
    .max(50),

  /*
   * Complete country × indicator × year data.
   *
   * Example:
   *
   * Nigeria
   *   Cereal Seeds
   *     2020
   *     2021
   *     2022
   *     2023
   *     2024
   *     2025
   */
  timeSeries: z
    .array(TimeSeriesIndicatorSchema)
    .min(1)
    .max(500),

  overall: z
    .object({
      strongest: z.object({
        country: z.string().min(1).max(100),
        score: z.number().min(0).max(100),
      }),

      weakest: z.object({
        country: z.string().min(1).max(100),
        score: z.number().min(0).max(100),
      }),
    })
    .nullable()
    .optional(),

  indicators: z
    .array(
      z.object({
        name: z.string().min(1).max(100),

        strongest: z.string().min(1).max(100),

        strongestChange: z.number().finite().nullable(),

        weakest: z.string().min(1).max(100),

        weakestChange: z.number().finite().nullable(),
      })
    )
    .max(50),

  signals: z
    .array(z.string().min(1).max(500))
    .max(20),
});

const AiBriefingSchema = z.object({
  summary: z.string().min(1).max(2000),

  keySignals: z
    .array(z.string().min(1).max(500))
    .min(1)
    .max(8),

  attention: z.string().min(1).max(1000),

  outlook: z.string().min(1).max(1000),
});

type IntelligencePayload = z.infer<
  typeof IntelligencePayloadSchema
>;

function buildPrompt(payload: IntelligencePayload): string {
  return `
You are an agricultural sector intelligence analyst.

Your task is to interpret a structured agricultural dataset and produce a concise, evidence-based intelligence briefing for decision-makers.

IMPORTANT DATA RULES:

1. Use ONLY the facts supplied in FACTS below.

2. Do not invent numbers, countries, indicators, years, trends, risks or conclusions that are unsupported by the supplied data.

3. The "timeSeries" field contains the complete yearly observations for the selected period.

4. When discussing a trend, consider the complete time series, not only the first and final year.

5. Do not ignore intermediate years.

6. Do not assume that a smooth trend exists if the yearly observations show increases and decreases.

7. Use the supplied "yearOverYearChanges" values rather than recalculating percentages.

8. Use the supplied "analysis" values rather than recalculating percentages, volatility, rankings or scores.

9. Do not recalculate performance scores.

10. Do not invent missing values. If a value is null or unavailable, acknowledge the limitation when it materially affects the interpretation.

11. Distinguish between:
    - increasing trends
    - decreasing trends
    - stable trends
    - mixed or fluctuating trends

12. If the data shows acceleration or deceleration, use the supplied acceleration field.

13. If volatility is supplied, use it only as evidence of variation. Do not describe a series as volatile without supporting evidence.

14. For "higher_is_better" indicators, increases generally indicate improvement and decreases generally indicate deterioration, subject to the context of the indicator.

15. For "lower_is_better" indicators, decreases generally indicate improvement and increases generally indicate deterioration.

16. For "neutral" indicators, do not describe an increase or decrease as inherently good or bad unless the supplied data itself provides a clear contextual signal.

17. Do not make causal claims. The dataset shows patterns and changes, not necessarily their causes.

18. Do not claim that one country is nationally better overall unless the supplied comparison explicitly supports that statement.

19. The overall country score is a relative score within the selected countries and selected indicators only.

20. Keep the briefing professional, concise and decision-oriented.

INTERPRETATION PRIORITY:

When forming the briefing, prioritise:

- Significant multi-year trends
- Persistent increases or decreases
- Important reversals
- Strong year-on-year movements
- Acceleration or deceleration
- High or low points
- Volatility or mixed patterns
- Countries requiring attention
- Indicators showing meaningful divergence between countries
- Practical monitoring implications

Do not simply repeat every number in the dataset.

Instead, identify the most important evidence-supported signals.

RETURN FORMAT:

Return JSON only.

Do not use Markdown.

Use exactly this structure:

{
  "summary": "4-5 sentence overall assessment",
  "keySignals": [
    "signal 1",
    "signal 2",
    "signal 3"
  ],
  "attention": "who needs attention and why (1-2 sentences)",
  "outlook": "practical implication or monitoring note (1-2 sentences)"
}

The summary should explain the most important patterns across the selected period.

The keySignals array should contain the most decision-relevant signals supported by the data.

The attention field should identify the country, indicator or trend requiring the greatest attention when the data supports doing so.

The outlook field should describe what decision-makers should monitor or consider next, without inventing a recommendation unsupported by the evidence.

FACTS:

${JSON.stringify(payload, null, 2)}
`.trim();
}

function extractJsonObject(text: string): string {
  const trimmed = text.trim();

  if (
    trimmed.startsWith('{') &&
    trimmed.endsWith('}')
  ) {
    return trimmed;
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');

  if (
    start !== -1 &&
    end !== -1 &&
    end > start
  ) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Request body must be valid JSON.',
        },
        { status: 400 }
      );
    }

    const parsedPayload =
      IntelligencePayloadSchema.safeParse(body);

    if (!parsedPayload.success) {
      return NextResponse.json(
        {
          error: 'Invalid intelligence payload.',
          details: parsedPayload.error.flatten(),
        },
        { status: 400 }
      );
    }

    const payload = parsedPayload.data;

    const apiKey =
      process.env.OPENROUTER_API_KEY?.trim();

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
            process.env.OPENROUTER_SITE_URL ||
            'http://localhost:3000',

          'X-Title':
            process.env.OPENROUTER_APP_NAME ||
            'AllSectorsWatch',
        },

        body: JSON.stringify({
          model,

          temperature: 0.2,

          messages: [
            {
              role: 'system',

              content:
                'You generate structured agricultural intelligence briefings. Respond with valid JSON only. Use the complete supplied time series when interpreting trends. Do not invent metrics, values, countries, years or causes.',
            },

            {
              role: 'user',

              content: buildPrompt(payload),
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
          const errorValue = parsed.error;

          if (
            typeof errorValue === 'object' &&
            errorValue !== null &&
            'message' in errorValue &&
            typeof errorValue.message === 'string'
          ) {
            details = errorValue.message;
          } else if (
            typeof errorValue === 'string'
          ) {
            details = errorValue;
          }
        } else if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'message' in parsed &&
          typeof parsed.message === 'string'
        ) {
          details = parsed.message;
        }
      } catch {
        // Keep the raw response excerpt.
      }

      return NextResponse.json(
        {
          error: `OpenRouter request failed (${response.status}): ${details}`,
        },
        { status: 502 }
      );
    }

    let providerData: {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    try {
      providerData = JSON.parse(raw) as typeof providerData;
    } catch {
      return NextResponse.json(
        {
          error:
            'OpenRouter returned non-JSON response.',
        },
        { status: 502 }
      );
    }

    const content =
      providerData?.choices?.[0]?.message?.content;

    if (
      !content ||
      typeof content !== 'string'
    ) {
      return NextResponse.json(
        {
          error:
            'OpenRouter returned an empty response.',
        },
        { status: 502 }
      );
    }

    let aiJson: unknown;

    try {
      aiJson = JSON.parse(
        extractJsonObject(content)
      );
    } catch {
      return NextResponse.json(
        {
          error:
            'OpenRouter returned invalid JSON content.',
          details: content.slice(0, 300),
        },
        { status: 502 }
      );
    }

    const parsedBriefing =
      AiBriefingSchema.safeParse(aiJson);

    if (!parsedBriefing.success) {
      return NextResponse.json(
        {
          error:
            'AI response did not match the required briefing schema.',
          details:
            parsedBriefing.error.flatten(),
        },
        { status: 502 }
      );
    }

    const briefing = parsedBriefing.data;

    return NextResponse.json({
      summary: briefing.summary,

      keySignals:
        briefing.keySignals.slice(0, 6),

      attention: briefing.attention,

      outlook: briefing.outlook,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to generate intelligence briefing.';

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}
