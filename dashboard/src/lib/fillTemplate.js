/**
 * Replaces {{key}} placeholders in a template string with values from a map.
 *
 * @param {string} template - Raw template string (imported from a .md file)
 * @param {Record<string, string>} vars - Map of placeholder → replacement value
 * @returns {string} The filled prompt string
 */
export function fillTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : `{{${key}}}`
  );
}
