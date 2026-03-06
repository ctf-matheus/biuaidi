import { C } from "../lib/tokens";
import { fillTemplate } from "../lib/fillTemplate";
import promptTemplate from "@prompts/test-cases.md?raw";

const testCaseAgent = {
  label: "Test Case Agent",
  icon: "⬣",
  color: C.purple,

  /**
   * @param {object} ctx - Pipeline context (must include ctx.scope and ctx.recon)
   * @returns {string} Filled prompt ready to send to Claude
   */
  buildPrompt(ctx) {
    return fillTemplate(promptTemplate, {
      context_json: JSON.stringify({ scope: ctx.scope, recon: ctx.recon }, null, 2),
    });
  },
};

export default testCaseAgent;
