import type { PropertyBinding } from "../../types.ts";

export function generatePropertyBindingSetupCode(propertyBindings: PropertyBinding[]): string {
    let code = '';
    propertyBindings.forEach(binding => {
      code += `
        {
          const element = this.shadowRoot.getElementById("${binding.elementId}");
          if (element) {
            // Initialize element property with state value
            element["${binding.property}"] = this.state["${binding.stateProperty}"];
  
            // Update state when element property changes
            element.addEventListener("input", () => {
              this.state["${binding.stateProperty}"] = element["${binding.property}"];
            });
  
            // Update element property when state changes
            effect({
              update: () => {
                element["${binding.property}"] = this.state["${binding.stateProperty}"];
              },
            });
          }
        }
      `;
    });
    return code;
  }