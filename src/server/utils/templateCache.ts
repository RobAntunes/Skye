const templateCache = new Map<string, string>();

export async function getTemplate(templatePath: string): Promise<string> {
  if (templateCache.has(templatePath)) {
    return templateCache.get(templatePath)!;
  }
  const templateContent = await Deno.readTextFile(templatePath);
  templateCache.set(templatePath, templateContent);
  return templateContent;
}