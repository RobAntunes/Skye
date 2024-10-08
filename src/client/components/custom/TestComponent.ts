// src/components/custom/TestComponent.ts

import { SkyeComponent } from "../core/SkyeComponent.ts";
import { Accessible } from "../core/functions/mixins/Accessible.ts";
import { Responsive } from "../core/functions/mixins//Responsive.ts";
import { composeMixins } from "../core/functions/mixins/compose.ts";
import { reactive } from "../../reactivity/reactive.ts";

// Compose the base class with mixins
const BaseComponent = composeMixins(
  SkyeComponent,
  Accessible,
  Responsive
) as typeof SkyeComponent & (new (...args: any[]) => SkyeComponent);

class TestComponent extends BaseComponent {
  constructor() {
    super();
    this.state = reactive({
      title: "Initial Title",
      description: "Initial Description",
      expanded: false,
      disabled: false,
    });
  }

  override template(): string {
    return `
      <h1>${this.state.title}</h1>
      <p>${this.state.description}</p>
    `;
  }
}

// Define the custom element
customElements.define("test-component", TestComponent);
  
  class AccessibleTestComponent extends composeMixins(BaseComponent, Accessible) {
    constructor() {
      super();
      this.state = reactive({
        title: "Initial Title",
        description: "Initial Description",
        expanded: false,
        disabled: false,
      });
    }
  
    override template(): string {
      return `
        <h1>${this.state.title}</h1>
        <p>${this.state.description}</p>
      `;
    }
  }

  customElements.define("accessible-test-component", AccessibleTestComponent)