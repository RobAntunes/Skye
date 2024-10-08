export function sanitize(input: string): string {
    return input.replace(/[&<>"'/]/g, (char) => {
      const escapeChars: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
      };
      return escapeChars[char];
    });
  }