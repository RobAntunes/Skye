// services/templateRenderer.ts

import { encodeHex } from "jsr:@std/encoding";

// Hash the template using the BLAKE3 algorithm
export async function hashTemplate(template: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(template);
  const hashBuffer = await crypto.subtle.digest("BLAKE3", data);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = encodeHex(hashArray);
  return hashHex;
}
// The skye function remains the same
export function skye(
  strings: TemplateStringsArray,
  ...expressions: any[]
): string {
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];

    if (i < expressions.length) {
      let expr = expressions[i];

      if (typeof expr === "function") {
        expr = expr();
      }

      // Sanitize if it's a string
      if (typeof expr === "string") {
        expr = sanitize(expr);
      }

      result += expr;
    }
  }
  return result;
}

// Preprocess the template
export async function renderTemplate(
  templatePath: string,
  context: Record<string, any>
): Promise<string> {
  const templateContent = await Deno.readTextFile(templatePath);
  const processedTemplate = preprocessTemplate(templateContent);
  const templateFunction = createTemplateFunction(processedTemplate);
  return templateFunction(context);
}

function preprocessTemplate(template: string): string {
  // Replace JavaScript code blocks with expressions
  const codeBlockRegex = /<!--\s*@js\s*([\s\S]*?)-->/g;
  let processedTemplate = template.replace(codeBlockRegex, (_, code) => {
    return `\${() => { ${code.trim()} }}`;
  });

  // Replace inline code blocks (closing tags)
  const inlineCodeBlockRegex = /<!--\s*([\s\S]*?)-->/g;
  processedTemplate = processedTemplate.replace(
    inlineCodeBlockRegex,
    (_, code) => {
      return `\${() => { ${code.trim()} }}`;
    }
  );

  // Wrap the entire template in backticks
  processedTemplate = "`" + processedTemplate + "`";

  return processedTemplate;
}

function createTemplateFunction(
  templateString: string
): (context: Record<string, any>) => string {
  return (context: Record<string, any>) => {
    // Create a function that accepts context and returns the rendered template
    const functionBody = `
      with (context) {
        return skye${templateString};
      }
    `;
    try {
      const renderFunc = new Function("context", "skye", functionBody);
      return renderFunc(context, skye);
    } catch (error) {
      console.error("Template rendering error:", error);
      return "";
    }
  };
}

// Sanitization function to prevent XSS attacks
function sanitize(input: string): string {
  return input.replace(/[&<>"'/]/g, (char) => {
    const escapeChars: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
    };
    return escapeChars[char];
  });
}
