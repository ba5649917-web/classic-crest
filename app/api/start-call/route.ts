export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * ✅ Zod validation schema
 */
const requestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +14155551234)'),
  niche: z.enum(['property', 'edu_consultant']),
  voice: z.enum(['male', 'female']),
  consent: z.literal(true),
});

type RequestData = z.infer<typeof requestSchema>;

/**
 * 🧠 Basic rate limiting (per IP + phone number)
 */
const rateLimitMap = new Map<string, number>();
const phoneCallMap = new Map<string, number>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(ip);
  if (last && now - last < 60000) return false; // 1 min per IP
  rateLimitMap.set(ip, now);
  return true;
}

function checkPhoneLimit(phone: string): boolean {
  const now = Date.now();
  const last = phoneCallMap.get(phone);
  if (last && now - last < 3600000) return false; // 1 hour per phone
  phoneCallMap.set(phone, now);
  return true;
}

/**
 * 🎯 Agent ID selection based on niche + voice
 */
function getAgentId(niche: string, voice: string): string {
  const map: Record<string, string | undefined> = {
    'property_male': process.env.AGENT_ID_PROPERTY_M,
    'property_female': process.env.AGENT_ID_PROPERTY_F,
    'edu_consultant_male': process.env.AGENT_ID_EDUCONS_M,
    'edu_consultant_female': process.env.AGENT_ID_EDUCONS_F,
  };

  const id = map[`${niche}_${voice}`];
  if (!id) throw new Error(`Agent ID not configured for ${niche} - ${voice}`);
  return id;
}

/**
 * ☎️ Call ElevenLabs API directly
 */
async function sendCallToElevenLabs(data: RequestData, agentId: string) {
  const elevenNumberId = process.env.ELEVENLABS_PHONE_NUMBER_ID!;
  const apiKey = process.env.ELEVENLABS_API_KEY!;

  const payload = {
    agent_id: agentId,
    agent_phone_number_id: elevenNumberId,
    recipients: [
      {
        phone_number: data.phone,
        metadata: {
          user_name: data.name,
          user_email: data.email,
          niche: data.niche,
          voice: data.voice,
        },
      },
    ],
    call_name: `Outbound ${new Date().toISOString()}`,
    scheduled_time_unix: Math.floor(Date.now() / 1000),
  };

  const response = await fetch('https://api.elevenlabs.io/v1/convai/batch-calling/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ ElevenLabs API error:', response.status, errorText);
    throw new Error(`ElevenLabs API failed: ${errorText}`);
  }

  return response.json();
}

/**
 * 🚀 POST handler
 */
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // ⏳ IP rate limit check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: RequestData = validation.data;

    // 📞 Phone number rate limit check
    if (!checkPhoneLimit(data.phone)) {
      return NextResponse.json(
        { error: 'Phone already called within 1 hour.' },
        { status: 429 }
      );
    }

    // 🧠 Determine agent ID based on user selection
    const agentId = getAgentId(data.niche, data.voice);

    // 📡 Trigger ElevenLabs outbound call
    const callResponse = await sendCallToElevenLabs(data, agentId);

    console.log('✅ ElevenLabs call triggered:', callResponse);

    return NextResponse.json({ success: true, call: callResponse });
  } catch (err: any) {
    console.error('❌ Error in start-call API:', err);
    return NextResponse.json(
      { error: err?.message || 'Unexpected error occurred.' },
      { status: 500 }
    );
  }
}
