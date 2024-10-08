import { effect, reactive } from "../../reactivity/reactive.ts";
import { parseTemplateString } from "../../templates/engine.ts";

export class SkyeComponent extends HTMLElement {
  state: any;
  private cleanupTasks: Array<() => void> = [];

  constructor() {
    super();
    this.state = reactive({});
  }

  connectedCallback(): void {
    // Set up the reactive effect and get the cleanup function
    const cleanupRenderEffect = effect(() => this.render());

    // Automatically clean up the effect on disconnect
    this.addCleanupTask(cleanupRenderEffect);
  }

  disconnectedCallback(): void {
    // Execute all cleanup tasks
    this.cleanupTasks.forEach((cleanup) => cleanup());
    this.cleanupTasks = [];
  }

  render(): void {
    const template = this.template();
    const fragment = parseTemplateString(template);
    this.innerHTML = '';
    this.appendChild(fragment);
  }

  template(): string {
    // To be overridden by subclasses
    return '';
  }

  // Helper method to add a cleanup task
  protected addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  // Helper method to add event listeners with automatic cleanup
  protected addEventListenerWithCleanup<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.addEventListener(type, listener, options);
    this.addCleanupTask(() => this.removeEventListener(type, listener, options));
  }
}

export type Constructor<T = {}> = new (...args: any[]) => T;