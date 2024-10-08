import { effect } from "../../reactivity/reactive.ts";
import { parseTemplate } from "../engine.ts";
import { hashTemplate } from "./hashTemplate.ts";

const templateCache = new Map<string, { hash: string, fragment: DocumentFragment }>();

export async function renderTemplate(
  template: string, 
  state: Record<string, any>, 
  element: HTMLElement
) {
  try {
    // Generate hash for the template
    const templateHash = await hashTemplate(template);

    // Check if the template is cached and matches the current hash
    const cachedTemplate = templateCache.get(template);
    let fragment: DocumentFragment;
    if (cachedTemplate && cachedTemplate.hash === templateHash) {
      fragment = cachedTemplate.fragment.cloneNode(true) as DocumentFragment;
    } else {
      // Parse the template and bind it with the state
      fragment = parseTemplate(template, state);

      // Cache the new template with its hash
      templateCache.set(template, { hash: templateHash, fragment });
    }

    // Clear the element's content and append the fragment
    element.innerHTML = '';
    element.appendChild(fragment);

    // Set up reactivity effect
    effect({
      update: () => {
        // Re-parse the template based on the updated state
        const updatedFragment = parseTemplate(template, state);
        element.innerHTML = ''; 
        element.appendChild(updatedFragment);
      }
    });

  } catch (error) {
    console.error("Error in renderTemplate:", error);
    throw error;
  }
}