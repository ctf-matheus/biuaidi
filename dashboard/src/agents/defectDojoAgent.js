import { fillTemplate } from "../lib/fillTemplate";
import promptTemplate from "@prompts/defectdojo.md?raw";

const defectDojoAgent = {
  label: "DefectDojo Agent",
  icon: "◉",
  color: "#BF6B6B",

  /**
   * @param {object} ctx - Pipeline context (must include ctx.findings, ctx.scope, ctx.engagement_name)
   * @returns {string} Filled prompt ready to send to Claude
   */
  buildPrompt(ctx) {
    const today    = new Date();
    const plusWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return fillTemplate(promptTemplate, {
      findings_json:   JSON.stringify(ctx.findings?.validated_findings || [], null, 2),
      engagement_name: ctx.engagement_name || "Pentest",
      scope_summary:   ctx.scope?.scope_summary || "",
      target_start:    today.toISOString().split("T")[0],
      target_end:      plusWeek.toISOString().split("T")[0],
    });
  },
};

export default defectDojoAgent;
