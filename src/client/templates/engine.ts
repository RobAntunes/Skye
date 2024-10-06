export function parseTemplate(template: string) {
    // Extract the JS parts inside the control flow like 'if', 'for', etc.
    return template
      .replace(/if\s*\(([^)]+)\)\s*\{/g, '{ if ($1) {') // Handle if statements
      .replace(/for\s*\(([^)]+)\)\s*\{/g, '{ for ($1) {') // Handle for loops
      .replace(/{\s*(.+?)\s*}/g, '$1'); // Replace curly braces around JS expressions
  }