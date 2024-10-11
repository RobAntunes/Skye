// src/core/Component.ts

import { effects } from '../base/reactivity/Effects.ts';
import { skye, preprocessTemplate, createTemplateFunction } from '../../templates/render.ts';
import { reactive } from "../base/reactivity/reactive.ts";

/**
 * Base Component class extending HTMLElement.
 * Automatically sets up reactive rendering based on state changes.
 */
export abstract class Base<T extends Record<string, any> = Record<string, any>> extends HTMLElement {
  /**
   * The reactive state object to be defined by derived components.
   */
  public state: T;

  /**
   * The HTML template string with placeholders for state properties.
   * Example: `<p>{{message}}</p>`
   */
  protected template: string = '';

  /**
   * Additional scripts or dynamic JavaScript to be executed.
   * Example: `console.log('Hello, ' + this.state.user.name);`
   */
  protected scripts: string = '';

  constructor() {
    super();
    // Attach a shadow DOM
    this.attachShadow({ mode: 'open' });
    // Initialize state as reactive
    this.state = reactive({} as T);
  }

  /**
   * Lifecycle method called when the component is added to the DOM.
   */
  connectedCallback() {
    this.onMount();
    this.setupAutoRender();
    this.render(); // Initial render
  }

  /**
   * Lifecycle method called when the component is removed from the DOM.
   */
  disconnectedCallback() {
    this.onUnmount();
    this.cleanupEffects();
  }

  /**
   * Hook for derived classes to implement mount logic.
   */
  protected abstract onMount(): void;

  /**
   * Hook for derived classes to implement unmount logic.
   */
  protected abstract onUnmount(): void;

  /**
   * Sets up an automatic rendering effect.
   * Whenever reactive state properties accessed within the render method change,
   * the render method is automatically invoked.
   */
  private setupAutoRender(): void {
    effects.sync(() => {
      this.render();
    });
  }

  /**
   * Renders the component's HTML based on its state.
   * Utilizes the skye function and preprocesses the template.
   */
  protected render(): void {
    if (!this.shadowRoot) return;

    // Preprocess the template to handle skye expressions and placeholders
    const processedTemplate = preprocessTemplate(this.template);

    // Create the template function
    const templateFunction = createTemplateFunction(processedTemplate);

    // Generate the HTML by executing the template function with the current state
    const html = templateFunction(this.state);

    // Set the shadow DOM's innerHTML
    this.shadowRoot.innerHTML = html;

    // Execute any dynamic JavaScript defined in the scripts property
    if (this.scripts.trim() !== '') {
      try {
        // The context includes the component instance and the state
        const func = new Function('base', 'state', skye`${this.scripts}`);
        func(this, this.state);
      } catch (error) {
        console.error('Dynamic JS Execution Error:', error);
      }
    }
  }

  /**
   * Cleans up any active effects to prevent memory leaks.
   */
  private cleanupEffects(): void {
    // Implement effect cleanup if necessary
    // For example, removing listeners or disposing of cached data
    // Currently, no specific cleanup is required
  }
}