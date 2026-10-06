import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const IntelligencePayloadSchema = z.object({
  sector: z.string().min(1).max(100),
  period: z.string().min(1).max(50),
  countries: z.array(z.string().min(1).max(100)).min(1).max(50),
  variables: z.array(z.string().min(1).max(100)).min(1).max(50),
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
        strongestChange: z.number().nullable(),
        weakest: z.string().min(1).max(100),
        weakestChange: z.number().nullable(),
      })
    )
    .max(50),
  signals: z.array(z.string().min(1).max(500)).max(20),
});

const AiBriefingSchema = z.object({
  summary: z.string().min(1).max(2000),
  keySignals: z.array(z.string().min(1).max(500)).min(1).max(8),
  attention: z.string().min(1).max(1000),
  outlook: z.string().min(1).max(1000),
});

type IntelligencePayload = z.infer<typeof IntelligencePayloadSchema>;

function buildPrompt(payload: IntelligencePayload): string {
  return `
You are an agricultural sector intelligence analyst.

Using ONLY the facts below, write a concise intelligence briefing.

Rules:
- Do not invent numbers, countries, or indicators.
- Do not recompute percentages; use the values provided.
- Do not invent performance scores.
- Be clear, professional, and decision-oriented.
- If a field is null or missing, do not invent a value for it.

Return JSON only, with this exact shape:
{
  "summary": "4-5 sentence overall assessment",
  "keySignals": ["signal 1", "signal 2", "signal 3"],
  "attention": "who needs attention and why (1-2 sentences)",
  "outlook": "practical implication or monitoring note (1-2 sentences)"
}

FACTS:
${JSON.stringify(payload, null, 2)}
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

    const parsedPayload = IntelligencePayloadSchema.safeParse(body);

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
              content:
                'You generate structured agricultural intelligence briefings. Respond with valid JSON only. No markdown. Do not invent metrics.',
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
        const parsed = JSON.parse(raw);
        details =
          parsed?.error?.message ||
          parsed?.error ||
          parsed?.message ||
          details;
      } catch {
        // keep raw text
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
      providerData = JSON.parse(raw);
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

    const parsedBriefing = AiBriefingSchema.safeParse(aiJson);

    if (!parsedBriefing.success) {
      return NextResponse.json(
        {
          error: 'AI response did not match the required briefing schema.',
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
        : 'Unable to generate intelligence briefing.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}