import { useCallback } from "react";

const GROQ_MODEL = "llama-3.1-8b-instant";

export function useGroq() {
  const chat = useCallback(async (messages, onChunk) => {
    // Prioritize user's saved Groq API Key in local storage, then fall back to Env variable
    const localApiKey = localStorage.getItem("cmrit_groq_api_key");
    const apiKey = localApiKey || import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("No Groq API Key configuration found. Please add an API Key in settings.");
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error: ${res.status} — ${err}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n").filter(l => l.startsWith("data: "));
      for (const line of lines) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const token = JSON.parse(data).choices?.[0]?.delta?.content || "";
          full += token;
          onChunk?.(token, full);
        } catch {}
      }
    }
    return full;
  }, []);

  return { chat };
}
