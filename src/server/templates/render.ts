// services/templateRenderer.ts

import { encodeHex } from "https://deno.land/std@0.203.0/encoding/hex.ts";

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

function sanitize(input: unknown): string {
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

function preprocessTemplate(template: string): string {
  // Step 1: Handle skye function calls
  const skyeExprRegex = /{{\s*skye`([\s\S]+?)`\s*}}/g;
  let processedTemplate = template.replace(skyeExprRegex, (_, code) => {
    return `\${(() => { 
      const result = skye\`${code}\`; 
      return sanitize(typeof result === 'function' ? result() : result); 
    })()}`;
  });

  // Step 2: Replace remaining {{ ... }} with ${ ... } for variable interpolation
  const placeholderRegex = /{{\s*([\s\S]+?)\s*}}/g;
  processedTemplate = processedTemplate.replace(placeholderRegex, (_, code) => {
    return `\${sanitize(${code.trim()})}`;
  });

  return processedTemplate;
}

function createTemplateFunction(
  templateString: string
): (context: Record<string, any>) => string {
  return (context: Record<string, any>) => {
    const functionBody = `
      with ({...context, skye, sanitize}) {
        return \`${templateString}\`;
      }
    `;
    try {
      const renderFunc = new Function(
        "context",
        "skye",
        "sanitize",
        functionBody
      );
      return renderFunc(context, skye, sanitize);
    } catch (error) {
      console.error("Template rendering error:", error);
      return "";
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
    return "Internal Server Error";
  }
}

// Hash the template using the BLAKE3 algorithm
export async function hashTemplate(template: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(template);
  const hashBuffer = await crypto.subtle.digest("BLAKE3", data);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = encodeHex(hashArray);
  return hashHex;
}