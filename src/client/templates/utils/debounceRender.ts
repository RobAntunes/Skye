import { renderTemplate } from "./lazyRender.ts";


let updateTimeout: number | null = null;
export function renderTemplateDebounced(template: string, state: Record<string, any>, element: HTMLElement) {
  if (updateTimeout) clearTimeout(updateTimeout);

  updateTimeout = globalThis.setTimeout(() => {
    renderTemplate(template, state, element);
  }, 50); // Debounce time
}