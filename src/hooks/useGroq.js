import { useCallback } from "react";

const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "") : "";

// Groq retired the entire Llama chat family, so the old default
// (llama-3.1-8b-instant) now 404s with model_not_found. gpt-oss is the current
// fast tier. This constant is only used on the bring-your-own-key path; when
// calling through our proxy the server picks the model.
const GROQ_MODEL = "openai/gpt-oss-20b";

// gpt-oss models reason before answering. Without these two flags the
// chain-of-thought streams into delta.reasoning while delta.content stays
// empty, so the UI shows nothing for several seconds and then dumps the whole
// answer at once. 'hidden' suppresses the reasoning channel entirely.
const REASONING = { reasoning_effort: "low", reasoning_format: "hidden" };

/**
 * Read an OpenAI-style SSE stream, invoking onChunk for each content token.
 *
 * Buffers across reads: a chunk boundary can split a `data:` line in half, and
 * the previous version parsed each read in isolation, so any token unlucky
 * enough to straddle a boundary was silently dropped.
 */
async function consumeStream(res, onChunk) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    // Keep the last (possibly incomplete) line for the next read.
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const delta = JSON.parse(data).choices?.[0]?.delta;
        const token = delta?.content || "";
        if (token) {
          full += token;
          onChunk?.(token, full);
        }
      } catch {
        // Ignore keep-alive comments and any partial JSON.
      }
    }
  }
  return full;
}

export function useGroq() {
  /**
   * Send a conversation and stream the reply.
   *
   * Two paths:
   *  - Student supplied their own Groq key -> call Groq directly from the
   *    browser. They pay for those tokens, so there is nothing to gate.
   *  - Otherwise -> go through our server proxy, which holds the shared key
   *    and requires an active pass. The key is no longer in the JS bundle.
   */
  const chat = useCallback(async (messages, onChunk, options = {}) => {
    const localApiKey = localStorage.getItem("cmrit_groq_api_key");

    if (localApiKey) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localApiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          stream: true,
          max_tokens: 1024,
          temperature: 0.7,
          ...REASONING,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Groq API error: ${res.status} - ${err}`);
      }
      return consumeStream(res, onChunk);
    }

    // Shared-key path: proxied and gated.
    const cached = localStorage.getItem("cmrit_user");
    const token = cached ? JSON.parse(cached).token : null;
    if (!token) {
      throw new Error("Sign in to use AI answers.");
    }

    const res = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages, heavy: !!options.heavy }),
    });

    if (!res.ok) {
      let message = `AI request failed (${res.status})`;
      try {
        const body = await res.json();
        if (body.code === "SUBSCRIPTION_REQUIRED") {
          const err = new Error(
            "AI answers are part of the CMRIT Placement Pass. Unlock it, or add your own Groq API key in settings."
          );
          err.code = "SUBSCRIPTION_REQUIRED";
          throw err;
        }
        if (body.message) message = body.message;
      } catch (e) {
        if (e.code === "SUBSCRIPTION_REQUIRED") throw e;
      }
      throw new Error(message);
    }

    return consumeStream(res, onChunk);
  }, []);

  return { chat };
}
