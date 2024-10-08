import type { EventBinding } from "../../types.ts";

export function generateEventListenerSetupCode(eventBindings: EventBinding[]): string {
    let code = '';
    eventBindings.forEach(binding => {
      code += `
        {
          const element = this.shadowRoot.getElementById("${binding.elementId}");
          if (element) {
            element.addEventListener("${binding.eventType}", (${binding.handlerExpression}).bind(this));
          }
        }
      `;
    });
    return code;
  }