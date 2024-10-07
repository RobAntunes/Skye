import { reactive, effect } from "../../reactivity/reactive.ts";

export class SkyeComponent extends HTMLElement {
  state: any;
  cleanupFn?: () => void;

  constructor(initialState = {}) {  
    super();
    this.state = reactive(initialState);
  }

  connectedCallback() {
    const outerRender = this.render.bind(this);
    
    // Start the initial render
    outerRender();

    // Setup reactive effect for re-rendering on state changes
    effect({
      render() {
        outerRender();
      }
    });
  }

  disconnectedCallback() {
    // Handle cleanup or memory management if needed
    if (this.cleanupFn) {
      this.cleanupFn();
    }
  }

  beforeRender() {
    // Hook for actions before rendering
  }
  
  afterRender() {
    // Hook for actions after rendering
  }

  batchStateUpdates(fn: () => void) {
    // Temporarily disable reactivity and batch multiple state updates
    this.suspendReactivity();
  
    // Perform all state updates within this block
    fn();
  
    // Re-enable reactivity and trigger a single re-render
    this.resumeReactivity();
    this.render(); // Optionally trigger a re-render
  }

  onSuspend() {
    // Hook for when the component's functions or effects are suspended
  }
  
  onResume() {
    // Hook for when the component resumes from a suspended state
  }

  render() {
    // Clear previous render
    this.innerHTML = "";

    // Create and append the new template
    const template = this.renderTemplate();
    if (template) {
      this.appendChild(template);
    }
  }

  // User-defined function for cleanup
  onCleanup(fn: () => void) {
    this.cleanupFn = fn;
  }

  // Override this to provide a custom template
  renderTemplate(): DocumentFragment | null {
    return document.createDocumentFragment();
  }
}