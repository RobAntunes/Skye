import { effect, reactive } from "../../reactivity/reactive.ts";
import { parseTemplate } from "../../templates/engine.ts";

export function SkyeFunctionalComponent(componentFn: () => any) {
    class SkyeFunctionalComponent extends HTMLElement {
      state: any;
      sideEffects: Set<() => void> = new Set(); // Track listeners and side effects
  
      constructor() {
        super();
        this.state = reactive({});
      }
  
      connectedCallback() {
        this.render();
  
        // Track effects and automatically clean them up
        effect({
          render: () => this.render(),
        });
      }
  
      render() {
        const template = componentFn();
        this.innerHTML = '';
        this.appendChild(parseTemplate(template));
      }
  
      // Override the standard document.addEventListener to track it for cleanup
      override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
        super.addEventListener(type, listener, options);
  
        // Track the listener in the sideEffects set for automatic cleanup
        this.sideEffects.add(() => document.removeEventListener(type, listener, options));
      }
  
      removeSideEffects() {
        // Remove all tracked listeners or side effects
        this.sideEffects.forEach(cleanup => cleanup());
        this.sideEffects.clear(); // Clear the effects set after cleanup
      }
  
      disconnectedCallback() {
        // Automatically clean up listeners when component is removed
        this.removeSideEffects();
      }
    }
  
    return customElements.define('skye-functional-component', SkyeFunctionalComponent);
  }