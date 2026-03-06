import { C } from "../lib/tokens";
import { fillTemplate } from "../lib/fillTemplate";
import promptTemplate from "@prompts/communication.md?raw";

const communicationAgent = {
  label: "Communication Agent",
  icon: "◎",
  color: C.blue,

  /**
   * @param {object} ctx - Pipeline context (must include ctx.findings, ctx.scope, ctx.engagement_name)
   * @returns {string} Filled prompt ready to send to Claude
   */
  buildPrompt(ctx) {
    return fillTemplate(promptTemplate, {
      engagement_name: ctx.engagement_name || "",
      overall_risk:    ctx.findings?.summary?.overall_risk || "N/A",
      critical_count:  String(ctx.findings?.summary?.critical || 0),
      high_count:      String(ctx.findings?.summary?.high || 0),
      scope_summary:   ctx.scope?.scope_summary || "",
    });
  },
};

export default communicationAgent;
