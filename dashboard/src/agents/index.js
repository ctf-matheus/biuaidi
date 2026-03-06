import scopeAgent         from "./scopeAgent";
import reconAgent         from "./reconAgent";
import testCaseAgent      from "./testCaseAgent";
import findingsAgent      from "./findingsAgent";
import reportAgent        from "./reportAgent";
import communicationAgent from "./communicationAgent";
import defectDojoAgent    from "./defectDojoAgent";

/**
 * Central agent registry keyed by agentKey.
 * Each value exposes: { label, icon, color, buildPrompt(input) }
 */
export const AGENTS = {
  scope:         scopeAgent,
  recon:         reconAgent,
  test_cases:    testCaseAgent,
  findings:      findingsAgent,
  report:        reportAgent,
  communication: communicationAgent,
  defectdojo:    defectDojoAgent,
};
