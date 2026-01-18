# Cloudflare Worker for Persona Chat

## Setup Steps

### 1. Install Wrangler
```bash
npm install -g wrangler
# or
npm install wrangler --save-dev
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Set OpenAI API Key
```bash
wrangler secret put OPENAI_API_KEY
# Paste your API key when prompted
```

### 4. Deploy Worker
```bash
wrangler deploy
```

### 5. Get Worker URL
After deployment, you'll get a URL like:
```
https://persona-chat-worker.your-subdomain.workers.dev
```

### 6. Update Frontend
Update `src/llm/index.ts` to use the worker URL instead of direct OpenAI API.

## Development
```bash
wrangler dev
```

## Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (set via `wrangler secret`)

## API Endpoint
- `POST /` - Stream chat completion
- Body: `{ persona: PersonaPrompt, history: ChatMessage[] }`
