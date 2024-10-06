// Import necessary reactivity system (assuming reactive and effect are already defined)
import { reactive, effect } from "../../reactivity/reactive copy.ts";

export class TresComponent extends HTMLElement {
  // Reactive state for each component
  state: any;

  constructor(initialState = {}) {  
    super();
    this.state = reactive(initialState); // Initialize reactive state
  }

  // Lifecycle method when the element is connected to the DOM
  connectedCallback() {
    const outer = this.render;
    outer();
    // Set up an effect to rerender whenever reactive state changes
    effect({
        render() {
            outer();
        }
    });
  }

  // Lifecycle method when the element is removed from the DOM
  disconnectedCallback() {
    // Handle cleanup or memory management if needed
  }

  // Rendering the template - to be implemented by derived components
  render() {
    this.innerHTML = ""; // Clear the component's previous content

    const template = this.renderTemplate(); // Get template content
    if (template) {
      this.appendChild(template); // Insert the template into the DOM
    }
  }

  // Placeholder method for derived components to implement their template logic
  renderTemplate(): DocumentFragment | null {
    return document.createDocumentFragment(); // Return a fragment as a placeholder
  }
}

// Now define the custom element for TresComponent (subclasses will define their own)
customElements.define("tres-component", TresComponent);
