// src/mixins/Responsive.ts

import { SkyeComponent } from "../../SkyeComponent.ts";
import { type Constructor } from "../../SkyeComponent.ts";

function Responsive<TBase extends Constructor<SkyeComponent>>(Base: TBase) {
  return class ResponsiveComponent extends Base {
    private resizeObserver!: ResizeObserver;

    override connectedCallback(): void {
      super.connectedCallback && super.connectedCallback();
      this.setupResponsiveness();
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback && super.disconnectedCallback();
      this.cleanupResponsiveness();
    }

    private setupResponsiveness(): void {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this);

      // Apply initial styles
      this.handleResize();
    }

    private cleanupResponsiveness(): void {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
    }

    private handleResize(): void {
      const width = this.clientWidth;

      // Define breakpoints and styles
      const styles = [
        { max: 599, fontSize: "12px", padding: "4px" },
        { min: 600, max: 959, fontSize: "14px", padding: "8px" },
        { min: 960, max: 1279, fontSize: "16px", padding: "12px" },
        { min: 1280, max: 1919, fontSize: "18px", padding: "16px" },
        { min: 1920, fontSize: "20px", padding: "20px" },
      ];

      // Find the matching style
      let appliedStyle = styles[0]; // Default to the smallest breakpoint
      for (const style of styles) {
        if (
          (style.min === undefined || width >= style.min) &&
          (style.max === undefined || width <= style.max)
        ) {
          appliedStyle = style;
          break;
        }
      }

      // Apply styles directly
      this.style.fontSize = appliedStyle.fontSize;
      this.style.padding = appliedStyle.padding;
    }
  };
}

export { Responsive };