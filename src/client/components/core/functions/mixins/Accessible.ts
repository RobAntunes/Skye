// src/mixins/Accessible.ts

import { SkyeComponent } from "../../SkyeComponent.ts";
import { type Constructor } from "../../SkyeComponent.ts";
import { effect } from "../../../../reactivity/reactive.ts";

function Accessible<TBase extends Constructor<SkyeComponent>>(Base: TBase) {
  return class AccessibleComponent extends Base {
    private handleKeyDownBound: (event: KeyboardEvent) => void;

    constructor(...args: any[]) {
      super(...args);
      this.handleKeyDownBound = this.handleKeyDown.bind(this);
    }

    override connectedCallback(): void {
      super.connectedCallback && super.connectedCallback();
      this.setupAccessibility();
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback && super.disconnectedCallback();
      this.removeEventListener("keydown", this.handleKeyDownBound);
    }

    setupAccessibility(): void {
      // Existing accessibility setup...

      // Keyboard Navigation
      this.addEventListener("keydown", this.handleKeyDownBound);

      // Setup reactive ARIA attributes
      this.setupAriaStateReactivity();
    }

    setupAriaStateReactivity(): void {
      effect({
        updateAriaAttributes: () => {
          if ("expanded" in this.state) {
            this.setAttribute("aria-expanded", String(this.state.expanded));
          }
          if ("disabled" in this.state) {
            this.setAttribute("aria-disabled", String(this.state.disabled));
          }
        },
      });
    }

    handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Enter" || event.key === " ") {
        this.click();
        event.preventDefault();
      }
    }

    generateAriaLabel(): string | null {
      const heading = this.querySelector("h1, h2, h3, h4, h5, h6");
      return heading ? heading.textContent?.trim() || null : null;
    }
  };
}

export { Accessible };