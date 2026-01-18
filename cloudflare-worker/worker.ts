/**
 * Cloudflare Worker for OpenAI API Proxy
 * Deploy: wrangler publish
 */

interface Env {
  OPENAI_API_KEY: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface PersonaPrompt {
  name: string;
  birthdate: string;
  livedPlace: string;
  gender: string;
  details: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST
    if (request.method !== "POST") {
      return new Response("Method not allowed", { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    try {
      const { persona, history }: { 
        persona: PersonaPrompt; 
        history: ChatMessage[] 
      } = await request.json();

      // Build persona system prompt
      const systemPrompt = `You are roleplaying as "${persona.name}".
Birthdate: ${persona.birthdate}
Lived place: ${persona.livedPlace}
Gender: ${persona.gender}
Details: ${persona.details}

Rules:
- Reply in a style consistent with the persona.
- Keep it helpful and friendly.
- Respond in the user's language (English or Japanese) based on the last user message.`;

      // Prepare messages for OpenAI
      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...history.map(msg => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        }) as ChatMessage),
      ];

      // Call OpenAI API with streaming
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: messages,
          stream: true,
        }),
      });

      if (!openaiResponse.ok) {
        const error = await openaiResponse.text();
        return new Response(JSON.stringify({ error }), {
          status: openaiResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create a readable stream to forward OpenAI's streaming response
      const stream = new ReadableStream({
        async start(controller) {
          const reader = openaiResponse.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              controller.enqueue(value);
            }
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : String(error) 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  },
};
