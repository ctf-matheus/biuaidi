import { C } from "../lib/tokens";
import { fillTemplate } from "../lib/fillTemplate";
import promptTemplate from "@prompts/findings.md?raw";

const findingsAgent = {
  label: "Findings Agent",
  icon: "⬤",
  color: C.yellow,

  /**
   * @param {object} ctx - Pipeline context (must include ctx.burp_raw and ctx.scope)
   * @returns {string} Filled prompt ready to send to Claude
   */
  buildPrompt(ctx) {
    return fillTemplate(promptTemplate, {
      burp_raw:      ctx.burp_raw || "Nenhum finding bruto fornecido.",
      scope_summary: ctx.scope?.scope_summary || "",
    });
  },
};

export default findingsAgent;
