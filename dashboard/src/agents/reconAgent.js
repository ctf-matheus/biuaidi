import { C } from "../lib/tokens";
import { fillTemplate } from "../lib/fillTemplate";
import promptTemplate from "@prompts/recon.md?raw";

const reconAgent = {
  label: "Recon Agent",
  icon: "⬢",
  color: C.accent,

  /**
   * @param {object} ctx - Pipeline context (must include ctx.scope)
   * @returns {string} Filled prompt ready to send to Claude
   */
  buildPrompt(ctx) {
    return fillTemplate(promptTemplate, {
      scope_json: JSON.stringify(ctx.scope, null, 2),
    });
  },
};

export default reconAgent;
