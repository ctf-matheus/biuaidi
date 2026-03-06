import { AGENTS } from "../agents";
import { callClaude } from "../lib/claudeApi";

/**
 * Resolves the correct input shape for each agent and dispatches the API call.
 *
 * @param {string} agentKey - Key from the AGENTS registry
 * @param {object} ctx      - Full pipeline context for the current engagement
 * @returns {Promise<object>} Parsed JSON response from the model
 */
export async function dispatch(agentKey, ctx) {
  const agent = AGENTS[agentKey];
  if (!agent) throw new Error(`Unknown agentKey: "${agentKey}"`);

  // Each agent's buildPrompt decides how to use the context.
  // scope is the only agent that receives a plain string instead of ctx.
  const input = agentKey === "scope" ? ctx.scope_input : ctx;
  const prompt = agent.buildPrompt(input);

  return callClaude(prompt);
}

/**
 * Maps an agentKey to the context property it writes to.
 *
 * @param {string} agentKey
 * @returns {string} The context key to update after the agent runs
 */
export function ctxKeyForAgent(agentKey) {
  const map = {
    scope:         "scope",
    recon:         "recon",
    test_cases:    "test_cases",
    findings:      "findings",
    report:        "report",
    communication: "communication",
    defectdojo:    "defectdojo",
  };
  return map[agentKey] ?? agentKey;
}
