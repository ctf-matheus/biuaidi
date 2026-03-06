/**
 * Low-level wrapper for the Anthropic Messages API.
 * The API key is read from the VITE_ANTHROPIC_API_KEY environment variable,
 * which must be set in dashboard/.env (never committed to version control).
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL   = "claude-sonnet-4-6";

/**
 * Sends a single prompt to Claude and returns the parsed JSON response.
 *
 * @param {string} prompt - The full prompt string built by an agent
 * @returns {Promise<object>} Parsed JSON from the model response
 */
export async function callClaude(prompt) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "VITE_ANTHROPIC_API_KEY is not set. Copy dashboard/.env.example to dashboard/.env and add your key."
    );
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    // SEC-04: log full body only to console; expose only status code to the UI
    const body = await res.text().catch(() => "");
    console.error("Anthropic API error body:", body);
    throw new Error(`Erro na API Anthropic (${res.status}). Verifique o console para detalhes.`);
  }

  const data = await res.json();
  const text = (data.content || []).map((b) => b.text || "").join("");
  const clean = text.replace(/```json\n?|```\n?/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    // SEC-09: truncate raw response to avoid leaking sensitive prompt data in state
    return { _raw: text.slice(0, 500), _error: "Failed to parse JSON response from model" };
  }
}
