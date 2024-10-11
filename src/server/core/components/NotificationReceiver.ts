// src/components/NotificationReceiver.ts

import { effects } from "../base/reactivity/Effects.ts";
import { Observable } from "../base/reactivity/Observable.ts";

/**
 * NotificationReceiver is a web component that listens for notifications and displays them.
 */
class NotificationReceiver extends HTMLElement {
  private notifications: string[] = [];
  private unsubscribe: (() => void) | null = null;
  private notificationsObservable: Observable<string>;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.handleNotification = this.handleNotification.bind(this);
    this.notificationsObservable = effects.observable.create<string>();
  }

  /**
   * Called when the component is added to the DOM.
   */
  connectedCallback() {
    this.render();
    // Subscribe to the 'notificationsObservable' and store the unsubscribe function
    this.unsubscribe = effects.observable.subscribe<string>(
      this.notificationsObservable,
      this.handleNotification
    );
  }

  /**
   * Called when the component is removed from the DOM.
   */
  disconnectedCallback() {
    // Unsubscribe from the 'notificationsObservable'
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Handles incoming notifications by updating the list and re-rendering.
   * @param {string} message - The notification message.
   */
  private handleNotification(message: string): void {
    this.notifications.push(message);
    this.render();
  }

  /**
   * Renders the component's HTML, displaying the list of notifications.
   */
  private render(): void {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <div>
          <h2>Notifications</h2>
          <ul>
            ${this.notifications.map((msg: string) => `<li>${msg}</li>`).join("")}
          </ul>
        </div>
        <style>
          h2 {
            font-size: 18px;
            margin-bottom: 10px;
          }
          ul {
            list-style-type: disc;
            padding-left: 20px;
          }
          li {
            margin-bottom: 5px;
          }
        </style>
      `;
    }
  }

  /**
   * Provides a method to emit notifications.
   * This can be called from other parts of the application to send notifications.
   * @param message The notification message to emit.
   */
  public emitNotification(message: string): void {
    this.notificationsObservable.emit(message);
  }
}

// Define the custom element
customElements.define("notification-receiver", NotificationReceiver);