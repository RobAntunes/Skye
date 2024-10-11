// services/templateRenderer.ts

import { encodeHex } from "jsr:@std/encoding/hex";
import { crypto as cryptoDeno } from "jsr:@std/crypto";

// The skye function to handle template strings and expressions

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
        try {
          expr = expr(); // Execute the function and use its return value
        } catch (err) {
          console.error("Error executing expression function:", err);
          expr = "";
        }
      }
      result += expr;
    }
  }
  return result; // Return the final result
}

export function sanitize(input: unknown): string {
  if (typeof input !== "string") {
    input = String(input);
  }
  return (input as string).replace(/[&<>"']/g, (char: any) => {
    const escapeChars: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
    };
    return escapeChars[char] || char;
  });
}

export function preprocessTemplate(template: string): string {
  // Step 1: Handle skye function calls
  const skyeExprRegex = new RegExp(
    "\\{\\{\\s*skye`([\\s\\S]+?)`\\s*\\}\\}",
    "g"
  );
  let processedTemplate = template.replace(skyeExprRegex, (_, code) => {
    return `\${(() => { 
      const result = skye\`${code}\`; 
      return sanitize(typeof result === 'function' ? result() : result); 
    })()}`;
  });

  // Step 2: Replace remaining {{ ... }} with ${ ... } for variable interpolation
  const placeholderRegex = new RegExp("\\{\\{\\s*([\\s\\S]+?)\\s*\\}\\}", "g");
  processedTemplate = processedTemplate.replace(placeholderRegex, (_, code) => {
    return `\${sanitize(${code.trim()})}`;
  });

  return processedTemplate;
}

export function createTemplateFunction(
  templateString: string
): (context: Record<string, any>) => string {
  return (context: Record<string, any>) => {
    const { skye: contextSkye, sanitize: contextSanitize, ...rest } = context;

    // Escape special characters in the template string
    const escapedTemplate = templateString
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\$/g, "\\$")
      .replace(/\r/g, "\\r")
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t");

    const functionBody = `
      const skye = contextSkye;
      const sanitize = contextSanitize;
      try {
        return \`${escapedTemplate}\`;
      } catch (error) {
        console.error("Error in template:", error);
        return \`Error rendering template: \${error.message}\`;
      }
    `;

    try {
      const renderFunc = new Function(
        "contextSkye",
        "contextSanitize",
        "rest",
        functionBody
      );
      return renderFunc(contextSkye, contextSanitize, rest);
    } catch (error) {
      console.error("Error creating template function:", error);
      console.error("Template string:", templateString);
      return `Error creating template function: ${(error as Error).message}`;
    }
  };
}

export async function renderTemplate(
  templatePath: string,
  context: Record<string, any>
): Promise<string> {
  try {
    const templateContent = await Deno.readTextFile(templatePath);
    const processedTemplate = preprocessTemplate(templateContent);
    const templateFunction = createTemplateFunction(processedTemplate);
    return templateFunction(context);
  } catch (error) {
    console.error("Error rendering template:", error);
    console.error("Template path:", templatePath);
    return `Error rendering template: ${(error as Error).message}`;
  }
}

// Hash the template using the BLAKE3 algorithm
export async function hashTemplate(template: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(template);
  const hashBuffer = await cryptoDeno.subtle.digest("BLAKE3", data);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = encodeHex(hashArray);
  return hashHex;
}
