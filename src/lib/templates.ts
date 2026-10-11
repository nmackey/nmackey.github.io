export function render(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{%([A-Z0-9_]+)%\}\}/g, (match, key: string) => {
    return Object.hasOwn(vars, key) ? vars[key] : match;
  });
}
