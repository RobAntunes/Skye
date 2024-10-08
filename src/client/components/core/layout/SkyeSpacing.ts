import { composeMixins } from "../functions/mixins/compose.ts";
import { Responsive } from "../functions/mixins/Responsive.ts";
import { SkyeComponent } from "../SkyeComponent.ts";

class SkyeSpacing extends composeMixins(SkyeComponent, Responsive) {
    override template(): string {
      return `
        <div class="spacing-container" style="padding: var(--padding-md)">
          <slot></slot>
        </div>
      `;
    }
  
    handleResize() {
      const spacingContainer = this.querySelector('.spacing-container') as HTMLDivElement;
  
      if (globalThis.innerWidth < 768) {
        spacingContainer.style.padding = 'var(--padding-sm)'; // Mobile padding
      } else if (globalThis.innerWidth >= 768 && globalThis.innerWidth < 1024) {
        spacingContainer.style.padding = 'var(--padding-md)'; // Tablet padding
      } else {
        spacingContainer.style.padding = 'var(--padding-lg)'; // Desktop padding
      }
    }
  }
  
  customElements.define('skye-spacing', SkyeSpacing);