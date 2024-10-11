// src/components/NotificationSender.js

import { effects } from "../base/reactivity/Effect.ts"; // Adjust the path as necessary
import { OBSERVABLES } from "../constants/Observables.ts"; // Adjust the path as necessary

/**
 * NotificationSender is a web component that emits notifications when a button is clicked.
 */
class NotificationSender extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.sendNotification = this.sendNotification.bind(this);
  }

  /**
   * Called when the component is added to the DOM.
   */
  connectedCallback() {
    this.render();
    this.shadowRoot
      ?.querySelector("#notify-btn")
      ?.addEventListener("click", this.sendNotification);
  }

  /**
   * Called when the component is removed from the DOM.
   */
  disconnectedCallback() {
    this.shadowRoot
      ?.querySelector("#notify-btn")
      ?.removeEventListener("click", this.sendNotification);
  }

  /**
   * Emits a notification through the Effects system.
   */
  sendNotification() {
    const message = "You have a new notification!";
    effects.emit(OBSERVABLES.NOTIFICATIONS, message);
  }

  /**
   * Renders the component's HTML.
   */
  render() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <div>
        <button id="notify-btn">Send Notification</button>
        </div>
        <style>
        button {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            }
            </style>
            `;
    }
  }
}

// Define the custom element
customElements.define("notification-sender", NotificationSender);
