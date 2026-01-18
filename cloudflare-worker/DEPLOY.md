# Cloudflare Worker Deployment Guide

## Quick Start (10-15 мөр код ✅)

### Step 1: Install Wrangler
```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare
```bash
wrangler login
```

### Step 3: Navigate to Worker Directory
```bash
cd cloudflare-worker
```

### Step 4: Set OpenAI API Key (Secret)
```bash
wrangler secret put OPENAI_API_KEY
# Paste your OpenAI API key: sk-...
```

### Step 5: Deploy
```bash
wrangler deploy
```

### Step 6: Copy Worker URL
After deployment, you'll see:
```
✨  Deployed to https://persona-chat-worker.YOUR_SUBDOMAIN.workers.dev
```

### Step 7: Add Worker URL to Frontend
1. Open your app
2. Go to header → "Cloudflare Worker URL" field
3. Paste the Worker URL: `https://persona-chat-worker.YOUR_SUBDOMAIN.workers.dev`
4. Enable "Use OpenAI" checkbox

## Architecture

```
[ Browser ] 
    ↓ (NO API KEY exposed)
[ Cloudflare Worker ]
    ↓ (API KEY in secret)
[ OpenAI API ]
    ↓ (Streaming response)
[ Browser ]
```

## Features

✅ **Secure**: API key never exposed to browser
✅ **Streaming**: Full OpenAI streaming support
✅ **Persona**: System prompt automatically built
✅ **CORS**: Already configured
✅ **Free**: Cloudflare Workers free tier is generous

## Testing Locally

```bash
wrangler dev
```

## Update Secrets

```bash
wrangler secret put OPENAI_API_KEY
```

## Files Structure

```
cloudflare-worker/
├── worker.ts          # Main worker code (10-15 мөр core logic)
├── wrangler.toml      # Worker configuration
├── package.json       # Dependencies
└── README.md          # This file
```

## API Endpoint

**POST** `https://your-worker.workers.dev`

**Body:**
```json
{
  "persona": {
    "name": "Elon Musk",
    "birthdate": "1971-06-28",
    "livedPlace": "USA",
    "gender": "male",
    "details": "CEO of Tesla"
  },
  "history": [
    { "role": "user", "content": "Hello!" }
  ]
}
```

**Response:** Streaming SSE format (same as OpenAI API)
