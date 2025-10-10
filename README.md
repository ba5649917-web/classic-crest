# AI Call Demo Web App

A production-ready Next.js application that integrates with n8n and ElevenLabs to provide instant AI consultant calls.

## Overview

This web app allows users to request an AI consultant call by filling out a simple form. The application:

1. Collects user information (name, email, phone, consultant type, voice preference)
2. Sends a structured payload to your n8n webhook
3. n8n handles the ElevenLabs API integration to initiate the call
4. ElevenLabs calls the user immediately
5. Post-call summary is sent via n8n webhook to email

**Important**: This app does NOT directly communicate with Twilio or ElevenLabs. All integration is handled through n8n workflows.

## Features

- Clean, responsive Tailwind UI with shadcn/ui components
- Form validation with zod and react-hook-form
- E.164 phone number validation
- Rate limiting (1 call per IP per minute, 1 call per phone per hour)
- Real-time loading states and user feedback
- Toast notifications for success/error states
- Support for 4 different agent configurations (2 niches × 2 voices)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env` (or `.env.local`) and fill in your values:

```bash
cp .env.local.example .env
```

Required environment variables:

```env
# Base URL for your application
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# n8n webhook URL (receives the call initiation payload)
N8N_START_URL=https://your-n8n-domain.com/webhook/your-start-webhook-id

# ElevenLabs phone number ID
ELEVENLABS_PHONE_NUMBER_ID=phnum_xxxxxxxxxxxxxx

# Four ElevenLabs agent IDs (one for each niche/voice combination)
AGENT_ID_PROPERTY_M=agent_xxxxxxxxxxxxxx
AGENT_ID_PROPERTY_F=agent_xxxxxxxxxxxxxx
AGENT_ID_EDUCONS_M=agent_xxxxxxxxxxxxxx
AGENT_ID_EDUCONS_F=agent_xxxxxxxxxxxxxx
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## How It Works

### Web App → n8n Integration

When a user submits the form, the app sends this JSON payload to `N8N_START_URL`:

```json
{
  "call_name": "Outbound 2025-10-09T12:34:56.789Z",
  "agent_id": "agent_xxxxxxxxxxxxxx",
  "agent_phone_number_id": "phnum_xxxxxxxxxxxxxx",
  "scheduled_time_unix": 1728480896,
  "recipients": [
    {
      "phone_number": "+14155551234",
      "metadata": {
        "user_name": "John Doe",
        "user_email": "john@example.com",
        "niche": "property",
        "voice": "male"
      }
    }
  ]
}
```

### n8n Workflow Configuration

Your n8n workflow should have these nodes:

1. **Webhook (POST)** - Receives the payload from this web app
2. **HTTP Request** - Posts to ElevenLabs API:
   - URL: `https://api.elevenlabs.io/v1/convai/batch-calling/submit`
   - Method: POST
   - Headers: `xi-api-key: YOUR_ELEVENLABS_API_KEY`
   - Body: The payload received from the web app
3. **Webhook (POST)** - Receives post-call summary from ElevenLabs
4. **Email Node** - Sends conversation summary to user

The web app only handles the first step. All ElevenLabs integration and email sending happens in n8n.

## Agent ID Mapping

The app maps user selections to the appropriate agent ID:

| Niche | Voice | Agent ID Environment Variable |
|-------|-------|------------------------------|
| Property Consultant | Male | `AGENT_ID_PROPERTY_M` |
| Property Consultant | Female | `AGENT_ID_PROPERTY_F` |
| Education Consultant | Male | `AGENT_ID_EDUCONS_M` |
| Education Consultant | Female | `AGENT_ID_EDUCONS_F` |

Make sure all four agent IDs exist in your ElevenLabs account before deploying.

## Testing

1. Fill out the form with valid information
2. Use a real phone number in E.164 format (e.g., `+14155551234`)
3. Check your n8n workflow logs to confirm the payload was received
4. Answer the phone when ElevenLabs calls
5. Check your email for the post-call summary

## Rate Limiting

- **IP-based**: Maximum 1 call per IP address per minute
- **Phone-based**: Maximum 1 call per phone number per hour

These limits are stored in-memory and will reset when the server restarts. For production use, consider implementing Redis-based rate limiting.

## Project Structure

```
.
├── app/
│   ├── api/
│   │   └── start-call/
│   │       └── route.ts       # API endpoint that forwards to n8n
│   ├── page.tsx               # Main form UI
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/ui/             # shadcn/ui components
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions
├── .env                       # Environment variables (DO NOT COMMIT)
├── .env.local.example         # Environment template
└── README.md                  # This file
```

## Technologies Used

- **Next.js 13** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** - UI component library
- **react-hook-form** - Form state management
- **zod** - Schema validation
- **Lucide React** - Icons

## Security Notes

- Never commit `.env` or `.env.local` files to version control
- The app includes basic rate limiting, but consider more robust solutions for production
- Phone numbers are validated for E.164 format
- User consent is required before initiating calls
- No sensitive data is logged to console (except in development for debugging)

## Support

If you encounter issues:

1. Verify all environment variables are set correctly
2. Check that your n8n webhook URL is accessible
3. Ensure your ElevenLabs agent IDs are valid
4. Check the browser console and server logs for error messages

## License

MIT
