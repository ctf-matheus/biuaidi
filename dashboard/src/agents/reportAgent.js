import { C } from "../lib/tokens";
import { fillTemplate } from "../lib/fillTemplate";
import promptTemplate from "@prompts/report.md?raw";

const reportAgent = {
  label: "Report Agent",
  icon: "◈",
  color: C.green,

  /**
   * @param {object} ctx - Pipeline context (must include ctx.scope and ctx.findings)
   * @returns {string} Filled prompt ready to send to Claude
   */
  buildPrompt(ctx) {
    const engagementData = {
      scope:            ctx.scope,
      findings_summary: ctx.findings?.summary,
      finding_count:    ctx.findings?.validated_findings?.length,
    };

    return fillTemplate(promptTemplate, {
      engagement_json: JSON.stringify(engagementData, null, 2),
    });
  },
};

export default reportAgent;
