import { C } from "../lib/tokens";
import { fillTemplate } from "../lib/fillTemplate";
import promptTemplate from "@prompts/scope.md?raw";

const scopeAgent = {
  label: "Scope Agent",
  icon: "⬡",
  color: C.blue,

  /**
   * @param {string} input - Raw scope text provided by the user
   * @returns {string} Filled prompt ready to send to Claude
   */
  buildPrompt(input) {
    return fillTemplate(promptTemplate, { input });
  },
};

export default scopeAgent;
