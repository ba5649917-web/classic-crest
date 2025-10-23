export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/** ✅ Schema (voice now has 4 options) */
const requestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +14155551234)'),
  niche: z.enum(['property']),
  voice: z.enum(['eric', 'alexis', 'salma', 'mehmud']),
  consent: z.literal(true),
});

type RequestData = z.infer<typeof requestSchema>;

/** 🧠 Simple rate limiting */
const rateLimitMap = new Map<string, number>();
const phoneCallMap = new Map<string, number>();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const last = rateLimitMap.get(ip);
  if (last && now - last < 60_000) return false;
  rateLimitMap.set(ip, now);
  return true;
}
function checkPhoneLimit(phone: string) {
  const now = Date.now();
  const last = phoneCallMap.get(phone);
  if (last && now - last < 3_600_000) return false;
  phoneCallMap.set(phone, now);
  return true;
}

/** 🎯 Agent ID lookup for (niche, voice) → agent id (8 env vars) */
function getAgentId(niche: RequestData['niche'], voice: RequestData['voice']): string {
  const map: Record<string, string | undefined> = {
    // Property
    'property_eric':   process.env.AGENT_ID_PROPERTY_ERIC,
    'property_alexis': process.env.AGENT_ID_PROPERTY_ALEXIS,
    'property_salma':  process.env.AGENT_ID_PROPERTY_SALMA,
    'property_mehmud': process.env.AGENT_ID_PROPERTY_MEHMUD,

    // Education Consultant
  };

  const id = map[`${niche}_${voice}`];
  if (!id) throw new Error(`Agent ID not configured for ${niche} - ${voice}`);
  return id;
}

/** ☎️ Submit batch call to ElevenLabs (puts variables in conversation_initiation_client_data) */
async function sendCallToElevenLabs(
  data: RequestData,
  agentId: string,
  companyName: string
) {
  const elevenNumberId = process.env.ELEVENLABS_PHONE_NUMBER_ID!;
  const apiKey = process.env.ELEVENLABS_API_KEY!;

  const payload = {
    agent_id: agentId,
    agent_phone_number_id: elevenNumberId,
    recipients: [
      {
        phone_number: data.phone,

        // ✅ Dynamic variables used by your agent prompt (e.g., "Hi {{user_name}} from {{company_name}}")
        conversation_initiation_client_data: {
          dynamic_variables: {
            user_name: data.name,
            company_name: companyName || '',
            
          },

          // (Optional) per-call overrides:
          // conversation_config_override: {
          //   agent: {
          //     first_message: `Hi ${data.name}, I’m your ${data.niche === 'property' ? 'property' : 'education'} consultant.`
          //   }
          // }
        },
      },
    ],
    call_name: `Outbound ${new Date().toISOString()}`,
    scheduled_time_unix: Math.floor(Date.now() / 1000),
  };

  // Debug log
  console.log('--- BATCH CALL PAYLOAD ---');
  console.log(JSON.stringify(payload, null, 2));
  console.log('--------------------------');

  const response = await fetch(
    'https://api.elevenlabs.io/v1/convai/batch-calling/submit',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
      body: JSON.stringify(payload),
    }
  );

  const text = await response.text();
  if (!response.ok) {
    console.error('❌ ElevenLabs API error:', response.status, text);
    throw new Error(`ElevenLabs API failed: ${text}`);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  console.log('✅ ElevenLabs API success:', parsed);
  return parsed;
}

/** 🚀 POST handler */
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again in a minute.' },
        { status: 429 }
      );
    }

    const raw: any = await request.json();

    // Validate against schema (voice is one of: eric | alexis | salma | mehmud)
    const validation = requestSchema.safeParse(raw);
    if (!validation.success) {
      console.error('Validation error fields:', validation.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: RequestData = validation.data;

    // Company comes from the raw body (not in schema on purpose)
    const companyName: string = typeof raw.company === 'string' ? raw.company.trim() : '';

    if (!checkPhoneLimit(data.phone)) {
      return NextResponse.json(
        { error: 'Phone already called within 1 hour.' },
        { status: 429 }
      );
    }

    const agentId = getAgentId(data.niche, data.voice);

    const callResponse = await sendCallToElevenLabs(
      data,
      agentId,
      companyName
    );

    return NextResponse.json({ success: true, call: callResponse });
  } catch (err: any) {
    console.error('❌ Error in start-call API:', err);
    return NextResponse.json(
      { error: err?.message || 'Unexpected error occurred.' },
      { status: 500 }
    );
  }
}
